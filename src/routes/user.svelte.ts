import { goto } from '$app/navigation';
import { invoke } from '@tauri-apps/api/core';
import WebSocket from '@tauri-apps/plugin-websocket';

export const user_data = $state({
    sessionToken: "",
    searchingIP: false,
    serverIP: "",
    serverURL: "",
    myIP: "",
    file: undefined as any,
    websocket: new WebSocket(0, [] as any),
    chat_socket: new WebSocket(0, [] as any),
    data: {
      user_type: '',
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      institution: '',
      dob: '',
      contact_number: '',
      location: '',
      volunteer_credits: "",
      bio: '',
      profile_image: "",
    },
})

export async function login(email: string, password: string, redirect: string, ping_timeout: number) {

  let return_response = {
    result: false,
    error_msg: "",
    data: undefined as any,
  };

  try {
    if (user_data.serverIP === "") {
      let count = 0;
      while (user_data.serverIP === "" && count < 5) {
        await get_server_ip(ping_timeout);
        count += 1;
      }
    }

    if (user_data.serverIP === "") {
       return_response.error_msg = "Network error"
       return return_response;
    }

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    let response = await fetch(`http://${user_data.serverIP}:8000/token`, {
      method: "POST",
      body: formData
    });

    if (response.ok) {

      const data = await response.json();
      data.data.password = password;

      console.log("Login successfull:", data);

      user_data.sessionToken = data.access_token;
      user_data.data = data.data;
      user_data.serverURL = `http://${user_data.serverIP}:8000`;

      if (redirect === "/admin") {
        user_data.data.user_type = "admin";
      }

      if (!data.data.approve) {
        console.error("Volunteer is not approved.");
        return_response.result = false;
        return_response.error_msg = "You're not approved by your captain";
        return return_response;
      }

      return_response.result = true;
      return_response.error_msg = "";
      return_response.data = data.data;

      let ws = await WebSocket.connect(`ws://${user_data.serverIP}:8000/ws?token=${user_data.sessionToken}`);
      user_data.websocket = ws;

      const socket = await WebSocket.connect(`ws://${user_data.serverIP}:8000/chat/${user_data.data.email}`);
      user_data.chat_socket = socket;

      if (redirect !== "") {
        goto(redirect);
      }
    } else {

      const error = await response.json();

      console.error("Login failed:", error.detail);
      return_response.result = false;
      return_response.error_msg = error.detail;
    }
  } catch (error: any) {
    return_response.result = false;
    return_response.error_msg = error;
    console.error("Error during login:", error);
  } finally {
    return return_response;
  }
}

export async function get_server_ip(timeout = 150): Promise<string> {
  try {
    user_data.searchingIP = true;

    const my_ip: string = await invoke('get_ip');
    user_data.myIP = my_ip;
    const gateway = my_ip.split(".").slice(0, 3).join('.');

    const ips = Array.from({ length: 250 }, (_, i) => `${gateway}.${i}`);
    
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < ips.length; i += BATCH_SIZE) {
      const batch = ips.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (ip) => {
          const isPinged = await ping(ip, timeout);
          return isPinged ? ip : null;
        })
      );
      
      const validIp = results.find(result => result !== null);
      if (validIp) {
        user_data.searchingIP = false;
        console.log("SERVER IP FOUND:", validIp);
        user_data.serverIP = validIp;
        return validIp;
        // user_data.serverURL = `http://${user_data.serverIP}:8000`;
      }
    }
    user_data.searchingIP = false;
    return "";
  } catch (error) {
    user_data.searchingIP = false;
    return "";
  }
}

export const ping = async (ip: string, timeout = 150) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`http://${ip}:8000/ping`, { signal });
    clearTimeout(timeoutId); // Clear timeout if the fetch succeeds
    return response.ok;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Fetch request timed out');
    }
    return false;
  }
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
