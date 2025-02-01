export const service_requests = $state<{requests: service_form[]}>({requests: []});

export interface service_form {
        partner_profile: any;
        status: any;
        fid: number,
        description: string,
        timeout: string,
        time_period_from: string,
        time_period_to: string,
        has_documents: boolean
        contact_number: string,
        locations: string[],
        documents: File[],
        expanded: boolean,
        my_location: string,
        isSubmitting:boolean,
        isAccepted: boolean,
        service_id: string,
        error_msg: string,
        remainingTime: number,
        isTaskStarted: boolean,
        startTimeRemaining: string,
        timeExceeded: boolean,
        doesAcceptRequest: boolean,
        progress: number,
        locations_input: { address: string; description: string; } [],
}
    // let remainingTimeinDate = $derived.by(() => {
    //     return formatMilliseconds(formData.remainingTime);
    // });
    // // let startTimeRemaining = $state("");
    // // let isTaskStarted = $state(false);
    // let timeExceeded = $state(false);