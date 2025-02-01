<script lang="ts">
    import { user_data } from "../../user.svelte";
    import ElderServicePage from "./elder/ElderServicePage.svelte";
    import { service_requests } from "./elder/service_data.svelte";
    import { formatMilliseconds, getTimeDifference, parseDate } from "../util.svelte";
    import VolunteerServicePage from "./volunteer/VolunteerServicePage.svelte";

    user_data.websocket.addListener((msg) => {
        console.log("New Web Socket Msg: ", msg);
        if (msg.type == "Text") {
            const incomingData = JSON.parse(msg.data)
            // if (incomingData.type === "new_service_request") {
            //     console.log(incomingData);
            //     incomingData.service_form.status = "pending";
            //     incomingData.expanded = false;
            //     pageData.serviceRequestsArray.push(incomingData);
            // }

            if (incomingData.type === "service_message") {
                console.log(incomingData);

                service_requests.requests.forEach((request) => {
                    if (request.service_id === incomingData.service_id) {
                        request.status = incomingData.status;
                    }
                })


                if (incomingData.status !== "accepted") {
                    service_requests.requests.forEach((request) => {
                        if (request.service_id == incomingData.service_id) {
                            request.status = incomingData.status;
                            request.error_msg = "Task Finished.";
                        }
                    })
                }

                if (incomingData.status === "accepted" && incomingData.message === "request_accepted") {
                    service_requests.requests.forEach((request) => {
                        if (request.service_id == incomingData.service_id && request.doesAcceptRequest) {
                            request.partner_profile = incomingData.volunteer_profile;
                            request.isAccepted = true;
                            request.remainingTime = getTimeDifference(request.time_period_to);
                            console.log("remaining time", request.remainingTime)
                            // startTime();
                            let progressSize = 0;
                            setInterval(() => {
                                if (!request.isTaskStarted && parseDate(request.time_period_from).getTime() < new Date().getTime()) {
                                    request.isTaskStarted = true;
                                    request.remainingTime = getTimeDifference(request.time_period_to);
                                    progressSize = 100 * 1000 / request.remainingTime;
                                }

                                if (!request.isTaskStarted) {
                                request.startTimeRemaining = formatMilliseconds(
                                    parseDate(request.time_period_from).getTime() - new Date().getTime())
                                }

                                if (request.isTaskStarted) {
                                    if (request.remainingTime > 0 && request.timeExceeded == false) {
                                        request.remainingTime -= 1000;
                                        request.progress += progressSize;
                                        // console.log("progress: ", request.progress)
                                    } else {
                                        request.remainingTime += 1000;
                                        request.timeExceeded = true;
                                    }
                                }
                            }, 1000);
                        }
                    })
                }
            }
        }
        user_data.websocket.send(JSON.stringify({type: "load_aayi"}))
    });

</script>

{#if user_data.data.user_type == "elder"}
    <ElderServicePage/>
{:else}
    <VolunteerServicePage/>
{/if}