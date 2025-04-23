<script lang="ts">
    import { Button, Input, Label} from "flowbite-svelte";
    import { user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { record_contract, unassign, type recordForm } from "./recordData.svelte";
    import { displayImage, reportUser } from "../util.svelte";
    import { onMount } from "svelte";
    import ReportModal from "../../ReportModal.svelte";
    import ChatWindow from "../../chat/ChatWindow.svelte";
    
    let newRequestProfile = $state({} as any);
    let isNewRequest = $state(false);
    let showProfile = $state(false);
    let showUpdatedModal = $state(false);
    let isShowChat = $state(false);
    let updateMsg = $state("");
    let updateColor = $state("green");
    let formErrors = $state<{[key: string]: string}>({});

    onMount(() => {
        const inputsAndTextareas = document.querySelectorAll('input, textarea');

        inputsAndTextareas.forEach(element => {
            element.addEventListener('focus', () => {
                document.body.style.paddingBottom = '300px';

                setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });

            element.addEventListener('blur', () => {
                document.body.style.paddingBottom = '0';
            });
        });
    });

    let record_form: recordForm[] = $state([
        {
            title: "Weight",
            value: "",
            remarks: "",
            unit: "kg",
            type: "number",
            min: 0,
            max: 500
        },
        {
            title: "Height",
            value: "",
            remarks: "",
            unit: "cm",
            type: "number",
            min: 0,
            max: 300
        },
        {
            title: "Blood pressure",
            value: "",
            remarks: "",
            unit: "mmHg",
            type: "bp"
        },
        {
            title: "Heart rate",
            value: "",
            remarks: "",
            unit: "bpm",
            type: "number",
            min: 0,
            max: 250
        },
        {
            title: "Body temperature",
            value: "",
            remarks: "",
            unit: "°F",
            type: "number",
            min: 90,
            max: 110
        },
        {
            title: "Oxygen saturation",
            value: "",
            remarks: "",
            unit: "SpO₂%",
            type: "number",
            min: 0,
            max: 100
        },
        {
            title: "Blood glucose",
            value: "",
            remarks: "",
            unit: "mg/dL",
            type: "number",
            min: 0,
            max: 600
        },
        {
            title: "Respiratory rate",
            value: "",
            remarks: "",
            unit: "breaths per minute",
            type: "number",
            min: 0,
            max: 60
        },
    ]);

    function validateField(field: recordForm): string | null {
        // Skip validation for empty fields (optional fields)
        if (!field.value) return null;

        // Validate numerical fields
        if (field.type === 'number') {
            const numValue = parseFloat(field.value);
            if (isNaN(numValue)) {
                return `${field.title} must be a valid number`;
            }
            if (field.min !== undefined && numValue < field.min) {
                return `${field.title} must be at least ${field.min} ${field.unit}`;
            }
            if (field.max !== undefined && numValue > field.max) {
                return `${field.title} must be no more than ${field.max} ${field.unit}`;
            }
        }

        // Special validation for blood pressure
        if (field.type === 'bp') {
            const bpPattern = /^(\d+)\/(\d+)$/;
            if (!bpPattern.test(field.value)) {
                return 'Blood pressure must be in format "systolic/diastolic" (e.g., 120/80)';
            }
            const [systolic, diastolic] = field.value.split('/').map(parseFloat);
            if (systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
                return 'Invalid blood pressure values';
            }
        }

        return null;
    }

    function validateForm(): boolean {
        formErrors = {};
        let isValid = true;

        record_form.forEach(field => {
            const error = validateField(field);
            if (error) {
                formErrors[field.title] = error;
                isValid = false;
            }
        });

        return isValid;
    }

    let previous_form = JSON.stringify(record_form);

    try {
      user_data.websocket.addListener((msg) => {
          if (msg.type == "Text") {
              const incomingData = JSON.parse(msg.data)
              if (incomingData.type === "new_volunteer_request") {

                  const requestEmail = incomingData.elder_profile.email;
                  newRequestProfile = incomingData.elder_profile;
                  newRequestProfile["service_id"] = incomingData.service_id;
                  isNewRequest = true;

                  let timeoutDuration = incomingData.timeout * 1000;
                  let requestTimeoutId = setTimeout(() => {
                    console.log(`Request timout reached for ${requestEmail}`);
                    newRequestProfile = {};
                    isNewRequest = false;

                    if (!record_contract.is_assigned) {
                      injectAlert("Request expired due to timeout");
                    }
                  }, timeoutDuration);

                  console.log(`New volunteer request received: ${requestEmail}: ${incomingData.timeout}`);
              }
          }
      })
    } catch (error) {
      console.log("ERROR: ", error);
    }

    async function updateRecord() {
        try {
            // Validate form before submission
            if (!validateForm()) {
                showUpdatedModal = true;
                updateColor = "red";
                updateMsg = "Please correct the errors in the form";
                return;
            }

            if (JSON.stringify(record_form) === previous_form) {
                showUpdatedModal = true;
                updateColor = "red";
                updateMsg = "Nothing to update!"
                return;
            }
            let formData = new FormData();
            formData.append("data", JSON.stringify(record_form));
            let response = await fetch(`${user_data.serverURL}/volunteer/update_record`, {
                method: "POST",
                headers: {
                    'accept': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
                body: formData
            });
            if (response.ok) {
                showUpdatedModal = true;
                updateColor = "green";
                updateMsg = "Record successfully updated";
                previous_form = JSON.stringify(record_form);
                formErrors = {}; // Clear any previous errors
                console.log("DONE");
            }else if (response.status === 401 ) {
                showUpdatedModal = true;
                updateColor = "orange";
                updateMsg = "Wait for a couple of seconds.";
                console.log("Wait for a couple of seconds.");
            } else {
                showUpdatedModal = true;
                updateColor = "red";
                updateMsg = "Failed to update the record";
                console.log("Failed to update the record");
            }
        } catch (e: any) {
            showUpdatedModal = true;
            updateColor = "red";
            updateMsg = "Failed to update the record";
            console.log("Error: ", e);
        }
    }

    async function acceptRequest() {
      try {
        let response = await fetch(`${user_data.serverURL}/volunteer/can_assign/${newRequestProfile.email}`, {
            method: "GET",
        });

        if (response.ok) {
          let decision = `new_volunteer_request:accept:${newRequestProfile.email}:${newRequestProfile.service_id}`
          const jsonResponse = {
              type: decision
          }

          user_data.websocket.send(JSON.stringify(jsonResponse));
          console.log(`Response sent for request ${newRequestProfile.email}: ${decision}`);
          record_contract.partner_profile = newRequestProfile;
          record_contract.is_assigned = true;
          isNewRequest = false;
        } else {
          injectAlert("Already Assigned!");
          newRequestProfile = {}
          isNewRequest = false;
        }
      } catch (e) {
        console.log("ERROR: ", e);
        injectAlert("Request failed!");
      }
    }

    function rejectRequest() {
        let decision = `new_volunteer_request:reject:${newRequestProfile.email}`
        const jsonResponse = {
            type: decision
        }
        user_data.websocket.send(JSON.stringify(jsonResponse));
        console.log(`Response sent for request ${newRequestProfile.email}: ${decision}`);
        isNewRequest = false;
    }

    async function reportPartner(msg: string): Promise<string> {
        let status = await reportUser(msg, record_contract.partner_profile.email, "Weekend service report");
        if (status) {
            return `Successfully reported the ${record_contract.partner_profile.user_type}`
        } else {
            return `Failed to report the ${record_contract.partner_profile.user_type}`
        }
    }  
    // Function to create and inject alert using DOM manipulation

    function injectAlert(message = "Already Assigned!") {
        // Get the container
        const container = document.getElementById('alert-container');
        
        container.innerHTML = '';
        
        // Create a div to hold our alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'flowbite-alert mb-4';
        
        // Set the HTML content for the alert
        alertDiv.innerHTML = `
            <div class="flex items-center p-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
                <svg class="flex-shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm.5 12a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1Z"/>
                </svg>
                <div class="ml-3 text-sm font-medium">
                    ${message}
                </div>
                <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" 
                        onclick="this.parentElement.remove()">
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Insert the alert at the beginning of the container
        container?.insertBefore(alertDiv, container.firstChild);
        
        // Optionally auto-remove after some time
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000); // Remove after 5 seconds
    }
</script>

<main class="main-container">
    {#if !record_contract.is_assigned}
      <div id="alert-container"></div>
    {/if}
    {#if record_contract.is_assigned}
        <div class="profile-view">
            {#if showProfile}
                <div class="profile-show">
                    <ProfileView formData={record_contract.partner_profile} />
                    <div style="padding-bottom: 20px;">
                        <Button onclick={() => showProfile = false} color="yellow" size="xs">Hide</Button>
                    </div>
                </div>
            {:else}
                <div style="padding: 20px; display: flex; flex-direction: column; align-items: center">
                    <img class="dp" src={displayImage(record_contract.partner_profile.profile_image)} alt="">
                    <p><strong>{record_contract.partner_profile.full_name}</strong></p>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 1rem">
                    <div class="view-button">
                        <Button onclick={() => showProfile = true} size="xs" color="yellow">View profile</Button>
                    </div>
                    {#if !isShowChat}
                    <div style="padding: 5px;">
                      <Button onclick={() => isShowChat = true} color="light" size="xs">Chat</Button>
                    </div>
                    {:else}
                    <ChatWindow partner_profile={record_contract.partner_profile} service_id={record_contract.service_id} bind:show={isShowChat}/>
                    {/if}
                    <div class="unassign-button">
                        <Button size="xs" onclick={() => {isNewRequest = false; unassign()}} color="red">Unassign</Button>
                    </div>
                    <div>
                        <ReportModal button_name="Report" modal_header="Report" page="100%" fn={reportPartner} color="dark" size="xs"/>
                    </div>
                </div>
            {/if}
        </div>
        <div class="record-form" style="background-color: white; border-radius: 20px; padding: 20px; margin-top: 10px">
            <form>
                {#each record_form as field (field.title)}
                    <Label>{`${field.title} (${field.unit})`}</Label>
                    <div style="margin: 5px;">
                        <Input 
                            type="text" 
                            placeholder={`Enter the ${field.title}`} 
                            bind:value={field.value}
                        ></Input>
                        {#if formErrors[field.title]}
                            <p style="color: red; font-size: 0.8rem;">{formErrors[field.title]}</p>
                        {/if}
                    </div>
                    <div style="margin: 5px; margin-bottom: 10px">
                        <Input 
                            type="text" 
                            placeholder={`Enter the remarks on ${field.title}`} 
                            bind:value={field.remarks}
                        ></Input>
                    </div>
                {/each}
                {#if showUpdatedModal}
                <p style="color: {updateColor}; padding: 5px"><strong>{updateMsg}</strong></p>
                {/if}
                <Button onclick={updateRecord}>Update</Button>
            </form>
        </div>
    {:else if isNewRequest}
        <div class="new-request">
            <ProfileView formData={newRequestProfile}/>
            <div class="control-buttons">
                <Button onclick={rejectRequest} color="red">Reject</Button>
                <Button onclick={acceptRequest} color="green">Accept</Button>
            </div>
        </div>
    {:else}
        <div class="no-service-label">
            <h4>No volunteer request yet.</h4>
        </div>
    {/if}
</main>

<style>
    :global(*) {
        font-family: 'Inter';
        touch-action: manipulation;
    }

    .main-container {
        position: static;
        bottom: 20%;
        width: 100%;
        height: 82vh;
        overflow-y: auto;
        border: 1px solid #000;;
        border-width: 0px;
        border-color: black;
    }

    .main-container::-webkit-scrollbar {
        width: 0px;
    }

    @media (max-height: 700px) {
        .main-container {
            height: 73vh;
        }
    }

    .new-request {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: white;
        border-radius: 20px;
    }

    .control-buttons {
        padding-bottom: 20px;
    }

    .no-service-label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        opacity: 0.5;
        z-index: 0;
    }

    .profile-view {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        border-radius: 20px;
    }

    .dp {
        border-radius: 50%;
        width: 100px;
        height: 100px;
    }

    .profile-show {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

</style>
