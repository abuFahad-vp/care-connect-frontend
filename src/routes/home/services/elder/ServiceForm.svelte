<script lang="ts">
	import { slide } from 'svelte/transition';
    import { service_requests, type service_form } from './service_data.svelte';
    import LoadingButton from '../../../LoadingButton.svelte';
    import { user_data } from '../../../user.svelte';
    import LoadingSpinner from '../../../LoadingSpinner.svelte';
    import { onMount } from 'svelte';
    import { pageData } from '../../page_state.svelte';
    import { Progressbar } from 'flowbite-svelte';
    import { Button, Modal, Input } from 'flowbite-svelte'
    import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
    import { displayImage, formatDateTime, formatMilliseconds, reportUser } from '../../util.svelte';
    import ProfileViewModal from '../../ProfileViewModal.svelte';
    import ReportModal from '../../../ReportModal.svelte';

    let { formData, id }: {
		formData: service_form
		id: number
	} = $props();

    let confirmationModal = $state(false);
    let abortModal = $state(false);
    // let remainingTimeinDate = $derived.by(() => {
    //     return formatMilliseconds(formData.remainingTime);
    // });
    // // let startTimeRemaining = $state("");
    // // let isTaskStarted = $state(false);
    // let timeExceeded = $state(false);
    let abortMessage = $state("");

    // formData.time_period_from = "2025-01-26T12:15";
    // formData.time_period_to = "2025-01-26T12:16";
    // formData.isSubmitting = true;
    // formData.isAccepted = true;

	let isLocationLoading = $state(false);

    setInterval(() => {
        if (formData.isSubmitting && !formData.isAccepted && new Date().getTime() > parseDate(formData.time_period_to).getTime()) {
            formData.error_msg = "Request time out";
            formData.doesAcceptRequest = false;
            formData.isAccepted = false;
            formData.isSubmitting = false;
        }
    }, 1000);

    onMount(() => {

        const inputsAndTextareas = document.querySelectorAll('input, textarea');

        inputsAndTextareas.forEach(element => {
            element.addEventListener('focus', () => {
                pageData.isSwipable = false;
            });

            element.addEventListener('blur', () => {
                pageData.isSwipable = true;
            });
        });

        inputsAndTextareas.forEach(element => {
            element.addEventListener('focus', () => {
                // Add temporary padding to the body to make space for the keyboard
                document.body.style.paddingBottom = '300px';

                setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300); // Delay for keyboard animation
            });

            element.addEventListener('blur', () => {
                // Remove the extra padding when the element loses focus
                document.body.style.paddingBottom = '0';
            });
        });
    });

	function expandOrCollapse() {
        service_requests.requests.forEach((request) => {
            if (request.fid !== formData.fid) {
                request.expanded = false;
            }
        });
		formData.expanded = !formData.expanded 
	}

    function handleDocumentUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            formData.documents = [...formData.documents, ...Array.from(input.files)];
			console.log("files",$state.snapshot(formData.documents))
        }
    }

    function removeDocument(index: number) {
        formData.documents = formData.documents.filter((_, i) => i !== index);
    }

    function addLocation() {
        formData.locations_input = [...formData.locations_input, { address: '', description: '' }];
    }

    function removeLocation(index: number) {
        formData.locations_input = formData.locations_input.filter((_, i) => i !== index);
    }

    function deleteForm() {
        pageData.isSwipable = true;
		service_requests.requests = service_requests.requests
			.filter((req, _) => req.fid !== formData.fid);
    }

    const getLocation = async (event: MouseEvent) => {
        event.preventDefault();
        isLocationLoading = true;
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            formData.my_location = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
        } catch (error) {
            formData.error_msg = error as string
        } finally {
            isLocationLoading = false;
        }
    }

    function parseDate(time: string): Date {
        let [datePart, timePart] = time.split("T");
        let [year, month, day] = datePart.split('-').map(Number);
        let [hours, minutes] = timePart.split(':').map(Number);
        let date = new Date(year, month - 1, day, hours, minutes);
        return date;
    }

    function getTimeDifference(to_time: string, from_time?: string): number {

        let parsedDateTo = parseDate(to_time);

        let parsedDateFrom = new Date();
        if (from_time !== undefined) {
            parsedDateFrom = parseDate(from_time);
        }

        const differenceMs = parsedDateTo.getTime() - parsedDateFrom.getTime();
        console.log("difference = ", differenceMs);
        return differenceMs;
    }

    async function handleSubmit(event: Event) {

        formData.isSubmitting = true;
        formData.error_msg = "";
		event.preventDefault()

        formData.timeout = formData.time_period_to;
        const differenceSeconds = Math.floor(getTimeDifference(formData.timeout) / 1000);
        // console.log(`Difference: ${differenceSeconds}`);

		let new_locations = formData.locations_input.map(({address, description}) => `${address}|${description}`)
		// console.log("new locations", new_locations);
		// console.log("Docs", $state.snapshot(formData.documents));
		let has_documents = formData.documents.length > 0;

        const requestData: service_form = {
            partner_profile: {},
            status: "ongoing",
            progress: 0,
            doesAcceptRequest: true,
            startTimeRemaining: '',
            fid: formData.fid,
            timeout: differenceSeconds.toString(),
            description: formData.description,
            has_documents: has_documents,
            time_period_from: formData.time_period_from,
            time_period_to: formData.time_period_to,
            contact_number: formData.contact_number,
            locations: [`${formData.my_location}|Elder's location`, ...new_locations],
			documents: formData.documents,
			expanded: false,
			my_location: "",
            isSubmitting: formData.isSubmitting,
            isAccepted: formData.isAccepted,
            service_id: formData.service_id,
            error_msg: "",
            remainingTime: 0,
            isTaskStarted: false,
            timeExceeded: false,
            locations_input: [],
        };

		// console.log(JSON.stringify(requestData));
		// console.log("lenghth = ", requestData.documents.length);
		try {
        	const response = await createServiceRequest(requestData);
            const responseData = await response.json() as any;

            console.log("service request response:", responseData);

            if (!response.ok) {
                throw new Error(responseData.detail);
            }

            if (responseData.status === "pending") {
                formData.service_id = responseData.service_id;
                console.log("request sended:", formData.service_id);
            }

            // if (responseData.status === "failed") {
            //     throw new Error("No volunteer accepted the request");
            // }

            // if (responseData.status === "accepted") {
            //     formData.isAccepted = true;
            //     formData.service_id = responseData.service_id;
            //     remainingTime = getTimeDifference(formData.time_period_to, formData.time_period_from);
            //     console.log("remaining time", remainingTime)
            //     startTime();
            //     return responseData
            // }
            // formData.error_msg = "You can't be here";
            return responseData;

        } catch (error: any) {
            formData.isSubmitting = false;
            console.log(error);
			formData.error_msg = error.message;
        }
	}

    async function createServiceRequest(requestData: service_form): Promise<any> {

        const formData = new FormData();

		requestData.locations.forEach(location => {
			formData.append('locations', location);
		});

		requestData.documents.forEach(files => {
			formData.append('documents', files);
		});
		console.log("Server URL => ", user_data.serverIP);
        const timeout_end = requestData.time_period_to.replace('T', ' ');
        const url = new URL(`http://${user_data.serverIP}:8000/elder/new_service_request/${timeout_end}`);

		url.searchParams.append('description', requestData.description);
		url.searchParams.append('has_documents', requestData.has_documents.toString());
		url.searchParams.append('time_period_from', requestData.time_period_from);
		url.searchParams.append('time_period_to', requestData.time_period_to);
		url.searchParams.append('contact_number', requestData.contact_number);

		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${user_data.sessionToken}`
			},
			body: formData
		});
		return response;
	}

    function abortRequest() {
        const jsonResponse = {
            type:"service_message", 
            status:"aborted", 
            service_id: formData.service_id, 
            message: abortMessage
        }
        user_data.websocket.send(JSON.stringify(jsonResponse));
        deleteForm();
    }

    async function reportPartner(msg: string): Promise<string> {
        let status = await reportUser(msg, formData.partner_profile.email, "Normal Service Report");
        if (status) {
            return "Successfully reported the volunteer";
        }
        return "Failed to report the volunteer";
    }
</script>

<div 
	class="container" 
	transition:slide
	class:expanded={formData.expanded}
	class:partially-collapsed={!formData.expanded}
>
    <div class="controls">
        <button class="expand-button" aria-label="expand-collapse" onclick={expandOrCollapse}>
            {#if !formData.expanded}
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

	{#if formData.expanded}
        {#if formData.isAccepted}
            <div class="profile-view">
                <ProfileViewModal formData={formData.partner_profile}/>
            </div>
        {/if}
		<div class="full-content" transition:slide={{ duration: 300 }}>
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<form class="service-form"
                id="request_form"
                onclick={(e) => e.stopPropagation()}
                onkeydown={(e) => e.stopPropagation()}
                onsubmit={(e) => {e.stopPropagation(); e.preventDefault(); confirmationModal = true}}
			>
                <Modal bind:open={confirmationModal} size="xs" autoclose>
                    <div class="text-center">
                        <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to submit this request?</h3>
                        <div class="modal-buttons">
                            <Button onclick={(e: any) => {e.preventDefault(); handleSubmit(e)}} color="green" class="me-2">Yes, I'm sure</Button>
                            <Button color="alternative">No, cancel</Button>
                        </div>
                    </div>
                </Modal>
                <Modal bind:open={abortModal} size="xs" autoclose={true} class="w-full">
                    <form class="flex flex-col space-y-6" action="#">
                        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Are you sure you want to abort?</h3>
                        <Input type="text" bind:value={abortMessage} name="abort-message" placeholder="Reason for your action" required />
                        <Button color="red" on:click={abortRequest} class="w-full1">Abort the task</Button>
                    </form>
                </Modal>
            <fieldset disabled="{formData.isSubmitting}">
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea
                        id="description"
                        placeholder="Description about the service" 
                        bind:value={formData.description}
                        rows=6
                        required>
                    </textarea>
                </div>

                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Documents</label>
                    <label class="cursor-pointer flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900">
                    📂 Choose File
                    <input
                        type="file"
                        multiple
                        class="hidden"
                        onchange={handleDocumentUpload}
                    />
                    </label>
                    {#if formData.documents.length > 0}
                        <div class="uploaded-files">
                            <div class="document-column">
                                {#each formData.documents as file, index (file)}
                                    <div class="file-item">
                                        {file.name}
                                        <button 
                                            type="button" 
                                            onclick={() => removeDocument(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Locations</label>
					<div class="our-location">
						<label for="our-location">Your location</label> 
						<input 
							id="our-location" 
							type="url" 
							name="our-location" 
							bind:value={formData.my_location}
							required
						>
						<div class="loading-button">
							<LoadingButton type="button" isLoading={isLocationLoading} onclick={getLocation} content="Get current location"/>
						</div>
					</div>
					<br>
                    <button 
                        type="button" 
                        onclick={addLocation}
                        class="add-location-btn"
                    >
                        + Add Location
                    </button>

                    {#each formData.locations_input as location, index (location)}
                        <div class="location-group">
                            <input 
                                type="url" 
                                placeholder="Location URL" 
                                bind:value={location.address}
                                required
                            />
                            <textarea 
                                placeholder="Location Description" 
                                bind:value={location.description}
                                rows="2"
								required
                            ></textarea>
                            <button 
                                type="button" 
                                onclick={() => removeLocation(index)}
                            >
                                ✕
                            </button>
                        </div>
                    {/each}
                </div>

                <div class="form-group">
                    <label for="time_period_from">Time period from:</label>
                    <input 
                        id="time_period_from" 
                        type="datetime-local" 
                        name="time_period_from" 
                        step="1"
                        bind:value={formData.time_period_from}
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="time_period_to">Time period to:</label>
                    <input 
                        id="time_period_to" 
                        type="datetime-local" 
                        name="time_period_to" 
                        step="1"
                        bind:value={formData.time_period_to}
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="contact_number">Contact number with country code:</label>
                    <input 
                        id="contact_number" 
                        type="tel" 
                        bind:value={formData.contact_number}
                        name="contact_number" 
                        required
                    >
                </div>

            </fieldset>
                {#if formData.error_msg !== ""}
                    <p class="error-msg">{formData.error_msg}</p>
                {/if}

                {#if formData.status !== "pending" && formData.status !== "accepted" && formData.status !== "ongoing"}
                <Button onclick={deleteForm} color="dark">Clear</Button>
                {:else if !formData.isSubmitting}
                    <div class="form-actions">
                        <button 
                            type="button" 
                            onclick={deleteForm}
                            class="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            class="btn-submit"
                        >
                            Submit
                        </button>
                    </div>
                {:else if !formData.isAccepted}
                    <div class="spinner">
                        <LoadingSpinner size=2rem color="var(--secondary-color)"/>
                    </div>
                {:else if formData.isAccepted}
                    {#if !formData.isTaskStarted}
                    <p>Task is not started. it will start in {formData.startTimeRemaining}</p>
                    {:else}
                        <div class="progress-div">
                            {#if formData.timeExceeded}
                                <Progressbar
                                    progress="100"
                                    size="h-4"
                                    labelInside
                                    color="red"
                                />
                                <p class="time-status" style="color: red;">{formatMilliseconds(formData.remainingTime)} exceeded</p>
                            {:else}
                                <Progressbar
                                    progress={formData.progress}
                                    size="h-4"
                                    precision={2}
                                    labelInside
                                    color="green"
                                />
                                <p style="color: green" class="time-status">{formatMilliseconds(formData.remainingTime)} remaining</p>
                            {/if}
                        </div>
                        <div class="form-actions">
                            <Button 
                                size="sm"
                                color="red"
                                type="button" 
                                onclick={() => {abortModal = true}}
                            >
                                Abort
                        </Button>
                        <ReportModal page="0%" fn={reportPartner} color="dark" size="sm"/>
                        </div>
                    {/if}
                {/if}
		</form>
		</div>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onclick={expandOrCollapse} class="partial-content" transition:slide={{ duration: 300 }}>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="card-container" onclick={expandOrCollapse}>
                <div class="card">
                    {#if formData.status !== "pending"}
                        <img src={displayImage(formData.partner_profile.profile_image)} class="dp" alt="profile_image" />
                    {/if}
                    <div class="card-header">
                        <div class="card-details">
                            <p class="name">{formData.partner_profile.full_name}</p>
                            <p class="service-id">Service ID: {formData.service_id}</p>
                            <!-- <p class="time-period">From: {service_form.time_period_from}</p>
                            <p class="time-period">To: {service_form.time_period_to}</p> -->
                            <p class="time-period">From: {formatDateTime(formData.time_period_from)}</p>
                            <p class="time-period">To: {formatDateTime(formData.time_period_to)}</p>
                            <p class="status">Status: {formData.status}</p>
                        </div>
                        <p class="description">{formData.description}</p>
                    </div>
                </div>
            </div>
		</div>
	{/if}
</div>

<style>
	.container {
		transition: max-height 0.3s ease-in-out;
		max-height: 200px;
		border: 1px solid #ccc;
		overflow: hidden;
		position: relative;
		touch-action: pan-y;
		border-radius: 30px;
		background-color: #ffffff;
        margin-bottom: 40px;
	}

	.expanded {
		max-height: 2000px;
		z-index: 2;
        scroll-behavior: unset;
	}

	/* .partial-content {
		/* height: 500px; */
		/* padding: 10px; */
	/* } */ 
	.full-content {
		padding: 20px;
	}

	.partially-collapsed {
		max-height: 300px;
		z-index: 0;
	}

	.controls {
		position: absolute;
		bottom: 1%;
		right: 45%;
		display: flex;
		gap: 8px;
	}

	/* .controls button {
		padding: 5px 12px;
		background-color: transparent;
		cursor: pointer;
		border: 0px solid #ccc;
		border-radius: 4px;
	} */

    .form-group {
        margin-bottom: 15px;
        margin-top: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
    }

    .form-group input, 
    .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .location-group {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
    }

    .file-item, 
    .location-group button {
        background: none;
        border: none;
        color: red;
        cursor: pointer;
    }

    .form-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    .btn-cancel, 
    .btn-submit {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .btn-cancel {
        background-color: #6c757d;
        color: white;
    }

    .btn-submit {
        background-color: #28a745;
        color: white;
    }

    .add-location-btn {
        background-color: #17a2b8;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        margin-bottom: 10px;
    }

    .uploaded-files {
        margin-top: 10px;
    }

    .document-column {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8f9fa;
        padding: 5px;
        border-radius: 4px;
    }

    .file-item button {
        background: none;
        border: none;
        color: red;
        cursor: pointer;
        margin-left: 10px;
    }
	label {
		font-weight: 700;
	}

	.our-location {
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: left;
	}

	div.our-location label {
		font-size: small;
		font-weight: 500;
	}
    .error-msg {
        color: red;
        font-weight: 700;
        left: 10px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .time-status {
        display: flex;
        align-items: center;
        justify-content: right;
    }

    .modal-buttons {
        display: flex;
    }

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

    .profile-view {
        display: flex;
        flex-direction: column;
        /* gap: 5px; */
        align-items: center;
        padding-top: 20px;
    }
</style>