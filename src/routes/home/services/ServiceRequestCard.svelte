<script lang="ts">
    import { slide } from "svelte/transition";
    import { displayImage, formatDateTime, formatMilliseconds, getTimeDifference, reportUser } from "../util.svelte";
    import { pageData } from "../page_state.svelte";
    import { user_data } from "../../user.svelte";
    import LoadingSpinner from "../../LoadingSpinner.svelte";
    import { Button, Modal, Progressbar } from "flowbite-svelte";
    import { ExclamationCircleOutline } from "flowbite-svelte-icons";
    import ProfileViewModal from "../ProfileViewModal.svelte";
    import ReportModal from "../../ReportModal.svelte";

    let {requestForm, id} = $props()
    let partner_profile = requestForm.elder_profile;
    let service_form = requestForm.service_form;
    console.log("EMERGENCY: ", service_form["urgent"]);

    let locations = service_form.locations.map((location: string) => {
        let x = location.split("|");
        return [x[0], x[1]]; // location url and it's description
    });

    // let locations = [
    //     ["https://www.google.com/maps?q=10.1095700,76.4584167", "Elder's location"],
    //     ["https://google.com/maps?=10.1010,76.4584167", "ABC Pharmacy"],
    // ];

    let finishModal = $state(false);
    let abortModal = $state(false);

    function onAbort() {
        const jsonResponse = {
           type: "service_message",
           status: "aborted",
           service_id: requestForm.service_id,
           message: "task_aborted"
        }
        service_form.status = "aborted"
        user_data.websocket.send(JSON.stringify(jsonResponse))
        console.log("Response successfully sented.")
    }

    function onFinish() {
        const jsonResponse = {
           type: "service_message",
           status: "completed",
           service_id: requestForm.service_id,
           message: "task completed"
        }
        service_form.status = "completed"
        user_data.websocket.send(JSON.stringify(jsonResponse))
        console.log("Response successfully sented.")
    }

    function onclick_accept() {
        if (getTimeDifference(service_form.time_period_to) < 0) {
            service_form.status = "cancelled";
            return
        }
        const jsonResponse = {
           type: "service_message",
           status: "accepted",
           service_id: requestForm.service_id,
           message: "request_accepted"
        }

        requestForm.volunteer_accepted = true;
        requestForm.elder_accepted = false;

        user_data.websocket.send(JSON.stringify(jsonResponse))
        console.log("Response successfully sented.")
    }

    function onclick_reject() {
        // requestForm.not_show = true;
        pageData.serviceRequestsArray = pageData.serviceRequestsArray.filter((req,_) => req.service_form.service_id !== service_form.service_id);
    }

    // async function fetchDocument(service_id: string, document_any: any) {
    //     // let response = window.open(`${user_data.serverURL}/volunteer/get_documents/${service_id}/${document_any}`, "_blank");
    //     // console.log(response);

    //     const response = await fetch(`${user_data.serverURL}/volunteer/get_documents/${service_id}/${document_any}`, {
    //         method: 'GET',
	// 		headers: {
	// 			'accept': 'application/json',
	// 			'Authorization': `Bearer ${user_data.sessionToken}`
	// 		},
    //     });

    //     if (!response.ok) {
    //         console.error("Failed to download file");
    //         return
    //     }

    //     const blob = await response.blob();
    //     const url = window.URL.createObjectURL(blob);
    //     window.open(url, "_blank");
    //     // const a = document.createElement('a');
    //     // a.href = url;
    //     // a.target = "_blank";
    //     // a.download = document_any;
    //     // document.body.appendChild(a);
    //     // window.open(a, "_system");
    //     // // a.click();
    //     // document.body.removeChild(a);
    // }

	function expandOrCollapse() {
        pageData.serviceRequestsArray.forEach((request) => {
            if (request.service_id !== requestForm.service_id) {
                request.expanded = false;
            }
        });
		requestForm.expanded = !requestForm.expanded 
	}


    async function reportPartner(msg: string): Promise<string> {
        let status = await reportUser(msg, partner_profile.email, "Normal Service Report");
        if (status) {
            return "Successfully reported the elder";
        }
        return "Failed to report the elder";
    }
</script>

<div 
	class="container" 
	transition:slide
	class:expanded={requestForm.expanded}
	class:partially-collapsed={!requestForm.expanded}
>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    {#if requestForm.expanded}
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <Modal bind:open={finishModal} size="xs" autoclose>
            <div class="text-center">
                <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to finish this task?</h3>
                <div class="modal-buttons">
                    <Button onclick={(e: any) => {e.preventDefault(); onFinish()}} color="green" class="me-2">Yes, I'm sure</Button>
                    <Button color="alternative">No, cancel</Button>
                </div>
            </div>
        </Modal>
        <Modal bind:open={abortModal} size="xs" autoclose>
            <div class="text-center">
                <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to abort this task?</h3>
                <div class="modal-buttons">
                    <Button onclick={(e: any) => {e.preventDefault(); onAbort()}} color="red" class="me-2">Yes, I'm sure</Button>
                    <Button color="alternative">No, cancel</Button>
                </div>
            </div>
        </Modal>
        <div class="full-content" transition:slide={{ duration: 300 }}>
        <div class="profile-view">
            <div class="modal-button">
                <ProfileViewModal formData={partner_profile}/>
                <div style="margin-left: 10px; padding: 5px;align-self: center;">
                  <Button 
                  color="light" 
                  size="xs" 
                  onclick={() => {
                    window.location.href = 
                      `/chat/${user_data.serverIP}/${service_form.service_id}/${partner_profile.email}`}
                  }>Chat</Button>
                </div>
            </div>
        </div>
        <div class="form-container">
            {#if service_form["urgent"]}
              <p class="text-xl font-bold text-white bg-red-600 px-4 py-2 rounded-lg shadow-md animate-pulse">
                  🚨 It's an EMERGENCY! 🚨
              </p>
            {/if}
            <div class="form-details">
                <p class="service-id"><strong>Service ID:</strong> {service_form.service_id}</p>
                <p class="status"><strong>Status:</strong> {service_form.status}</p>
            </div>
            
            <label><strong>Description:</strong></label>
            <p class="description">{service_form.description}</p>
            
            <label><strong>Documents:</strong></label>
                {#each service_form.documents as document}
                    <li>
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a target="_blank" href={`${user_data.serverURL}/volunteer/get_documents/${service_form.service_id}/${document}?token=${user_data.sessionToken}`}>{document}</a>
                    </li>
                {/each}
            
            <label><strong>Locations:</strong></label>
            {#each locations as location}
                <li>
                    <a target="_blank" href={location[0]}>{location[1]}</a>
                </li>
            {/each}
            
            <!-- <p class="time-period"><strong>From:</strong> {service_form.time_period_from}</p>
            <p class="time-period"><strong>To:</strong> {service_form.time_period_to}</p> -->
            <p class="time-period"><strong>From:</strong> {formatDateTime(service_form.time_period_from)}</p>
            <p class="time-period"><strong>To:</strong> {formatDateTime(service_form.time_period_to)}</p>
            <p class="contact-number"><strong>Contact No:</strong> {service_form.contact_number}</p>
            {#if service_form.status !== "pending" && service_form.status !== "accepted" && service_form.status !== "ongoing"}
                <Button onclick={onclick_reject} color="dark">Clear</Button>
            {:else if !requestForm.volunteer_accepted}
                <div class="submission-control">
                    <button class="reject styled-button" onclick={onclick_reject}>Reject</button>
                    <button class="accept styled-button" onclick={onclick_accept}>Accept</button>
                </div>

                <div class="controls">
                    <button class="expand-button" aria-label="expand-collapse" onclick={expandOrCollapse}>
                        {#if !requestForm.expanded}
                            <svg style="transform: rotate(180deg)" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
                                <path d="M18 15L12 9L6 15" stroke="#33363F" stroke-width="2"/>
                            </svg>
                        {:else}
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none">
                                <path d="M18 15L12 9L6 15" stroke="#33363F" stroke-width="2"/>
                            </svg>
                        {/if}
                    </button>
                </div>
            {:else if requestForm.volunteer_accepted && !requestForm.elder_accepted}
                <div class="spinner">
                    <LoadingSpinner size="2rem"/>
                </div>
            {:else if requestForm.volunteer_accepted && requestForm.elder_accepted}
                {#if !requestForm.isTaskStarted}
                <p>Task is not started. it will start in {requestForm.startTimeRemaining}</p>
                {:else}
                    <div class="progress-div">
                        {#if requestForm.timeExceeded}
                            <Progressbar
                                progress="100"
                                size="h-4"
                                labelInside
                                color="red"
                            />
                            <p class="time-status" style="color: red;">{formatMilliseconds(requestForm.remainingTime)} exceeded</p>
                        {:else}
                            <Progressbar
                                progress={requestForm.progress}
                                size="h-4"
                                precision={2}
                                labelInside
                                color="green"
                            />
                            <p style="color: green" class="time-status">{formatMilliseconds(requestForm.remainingTime)} remaining</p>
                        {/if}
                        <div style="display:flex; gap: 3px">
                            <ReportModal page="0%" fn={reportPartner} color="dark" size="md"/>
                            <Button color="red" onclick={() => {abortModal = true}}>Abort</Button>
                            <Button color="green" onclick={() => {finishModal = true}}>Finish</Button>
                        </div>
                    </div>
                {/if}
            {:else}
                <p>This is not possible</p>
            {/if}
        </div>
    </div>
    {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="card-container" onclick={expandOrCollapse}>
            <div class="card">
                <img src={displayImage(partner_profile.profile_image)} class="dp" alt="profile_image" />
                <div class="card-header">
                    <div class="card-details">
                        <p class="name">{partner_profile.full_name}</p>
                        {#if service_form["urgent"]}
                          <p class="text-xl font-bold text-white bg-red-600 px-4 py-2 rounded-lg shadow-md animate-pulse">
                              🚨 It's an EMERGENCY! 🚨
                          </p>
                        {/if}
                        <p class="service-id">Service ID: {service_form.service_id}</p>
                        <!-- <p class="time-period">From: {service_form.time_period_from}</p>
                        <p class="time-period">To: {service_form.time_period_to}</p> -->
                        <p class="time-period">From: {formatDateTime(service_form.time_period_from)}</p>
                        <p class="time-period">To: {formatDateTime(service_form.time_period_to)}</p>
                        <p class="status">Status: {service_form.status}</p>
                    </div>
                    <p class="description">{service_form.description}</p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .card-container {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        /* padding: 1rem; */
        min-height: 0;
    }
    .card {
        display: flex;
        flex-direction: column;
        width: 100%;
        /* max-width: 400px; */
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        overflow: hidden;
        min-height: 0;
    }
    .card-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .dp {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }
    .card-details {
        flex: 1;
        min-width: 0;
    }
    .card-details p {
        margin: 0.25rem 0;
        font-size: max(0.7rem, min(0.9rem, 2vw));
        color: #333;
        overflow-wrap: break-word;
        word-wrap: break-word;
    }
    .name {
        font-size: max(0.9rem, min(1.2rem, 2.5vw));
        font-weight: bold;
        color: #000;
    }
    .description {
        width: 100%;
        font-size: max(0.7rem, min(0.9rem, 2vw));
        color: #333;
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin-top: 0.5rem;
    }

    .status {
        color: #007bff;
        font-weight: bold;
    }
    @media (max-width: 600px) {
        .card {
            padding: 1rem;
            width: 100%;
        }
        .dp {
            width: 60px;
            height: 60px;
        }
    }

    .full-content {
        padding: 20px;
    }

	.full-content p {
        margin: 0.25rem 0;
        font-size: 1rem;
        padding: 2px;
        color: #333;
        overflow-wrap: break-word;
        word-wrap: break-word;
    }

	.controls {
		position: absolute;
		bottom: 1%;
		right: 45%;
		display: flex;
		gap: 8px;
	}

	.container {
		transition: max-height 0.3s ease-in-out;
		/* max-height: 50px; */
		border: 1px solid #ccc;
		overflow: hidden;
		position: relative;
		touch-action: pan-y;
		border-radius: 30px;
		background-color: #ffffff;
        /* padding: 0%; */
	}

	.expanded {
		max-height: 2000px;
		z-index: 2;
        scroll-behavior: unset;
	}

    .styled-button {
        background-color: #007BFF;
        color: white;
        border: none;
        padding: 10px 15px;
        margin-bottom: 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease;
        font-size: 14px;
    }

    .styled-button:hover {
        background-color: #0056b3;
    }

    .reject {
        background-color: #dc3545;
    }

    .reject:hover {
        background-color: #c82333;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    a {
        color: #007BFF;
        text-decoration: underline;
    }

    .spinner {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-buttons {
        display: flex;
        flex-direction: column;
        /* gap: 5px; */
        align-items: center;
        padding-bottom: 10px;
    }

    .profile-view {
        display: flex;
        /*flex-direction: column;*/
        /* gap: 5px; */
        align-items: center;
        justify-content: center;
        padding-bottom: 10px;
    }
</style>
