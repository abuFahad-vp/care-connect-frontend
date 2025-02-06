import { user_data } from "../user.svelte";

function detectImageFormat(base64String: string) {
    const data = base64String.startsWith('data:') 
      ? base64String.split(',')[1] 
      : base64String;

    const header = atob(data).slice(0, 4);
    const bytes = [];
    for (let i = 0; i < header.length; i++) {
      bytes.push(header.charCodeAt(i).toString(16));
    }
    const hex = bytes.join('');

    if (hex.startsWith('89504e47')) {
      return 'image/png';
    } else if (hex.startsWith('ffd8')) {
      return 'image/jpeg';
    } else if (hex.startsWith('47494638')) {
      return 'image/gif';
    } else if (hex.startsWith('424d')) {
      return 'image/bmp';
    } else if (base64String.startsWith('data:image/')) {
      return base64String.split(';')[0].split(':')[1];
    } else {
      return 'image/jpeg';
    }
  }

  export function displayImage(base64Input: string): string {
    try {
        let imageSource = '';
        const cleanBase64 = base64Input.trim();
        
        if (cleanBase64.startsWith('data:image')) {
            imageSource = cleanBase64;
        } else {
            const mimeType = detectImageFormat(cleanBase64);
            imageSource = `data:${mimeType};base64,${cleanBase64}`;
        }
        return imageSource;
    } catch (e) {
        return '';
    }
  }

export function getTimeDifference(to_time: string, from_time?: string): number {

    let parsedDateTo = parseDate(to_time);

    let parsedDateFrom = new Date();
    if (from_time !== undefined) {
        parsedDateFrom = parseDate(from_time);
    }

    const differenceMs = parsedDateTo.getTime() - parsedDateFrom.getTime();
    return differenceMs;
}

export function parseDate(time: string): Date {
    let [datePart, timePart] = time.split("T");
    let [year, month, day] = datePart.split('-').map(Number);
    let [hours, minutes] = timePart.split(':').map(Number);
    let date = new Date(year, month - 1, day, hours, minutes);
    return date;
}

export function formatDateTime(isoString: string) {
    const date = new Date(isoString);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // "Thursday"
        year: 'numeric', // "2025"
        month: 'long', // "January"
        day: 'numeric', // "30"
        hour: '2-digit', // "09"
        minute: '2-digit', // "59"
    } ;
    return date.toLocaleString('en-US', options);
}


export function formatMilliseconds(ms: number) {
    if (ms < 1000) {
        return `${ms} ms`;
    }

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 30)) % 12);
    const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
    }
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (seconds > 0) {
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }

    return `${ms} ms`;
}

export async function reportUser(msg: string, reported_email: string, feedback_type: string): Promise<boolean> {
    try {
        let formData = new FormData();
        formData.append("reported_email", reported_email);
        formData.append("feedback", msg),
        formData.append("feedback_type", feedback_type)

        let response = await fetch(`${user_data.serverURL}/user/feedback`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user_data.sessionToken}`
            },
            body: formData
        });
        console.log("Feedback response:", response);
        if (response.ok) {
          return true;
        }
        return false
    } catch (e: any) {
      console.log("ERROR:", e);
      return false
    }
}
