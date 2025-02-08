<script lang="ts">
    import { Button, Input, Label, Modal } from "flowbite-svelte";
    import { user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { record_contract, unassign, type recordForm } from "./recordData.svelte";
    import { displayImage, reportUser } from "../util.svelte";
    // import { ExclamationCircleOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import ReportModal from "../../ReportModal.svelte";
    
    let newRequestProfile = $state({} as any);
    let isNewRequest = $state(false);
    let showProfile = $state(false);
    let showUpdatedModal = $state(false);

    onMount(() => {

        const inputsAndTextareas = document.querySelectorAll('input, textarea');
        const form = document.querySelector('form');

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
        },
        {
            title: "Height",
            value: "",
            remarks: "",
            unit: "cm",
        },
        {
            title: "Blood pressure",
            value: "",
            remarks: "",
            unit: "mmHg"
        },
        {
            title: "Heart rate",
            value: "",
            remarks: "",
            unit: "bpm"
        },
        {
            title: "Body temperature",
            value: "",
            remarks: "",
            unit: "°F"
        },
        {
            title: "Oxygen saturation",
            value: "",
            remarks: "",
            unit: "SpO₂%"
        },
        {
            title: "Blood glucose",
            value: "",
            remarks: "",
            unit: "mg/dL"
        },
        {
            title: "Respiratory rate",
            value: "",
            remarks: "",
            unit: "breaths per minute"
        },
    ]);

    user_data.websocket.addListener((msg) => {
        if (msg.type == "Text") {
            const incomingData = JSON.parse(msg.data)
            if (incomingData.type === "new_volunteer_request") {
                const requestEmail = incomingData.elder_profile.email;
                newRequestProfile = incomingData.elder_profile;
                isNewRequest = true;
                console.log(`New volunteer request received: ${requestEmail}`);
            }
        }
    })

    async function updateRecord() {
        try {
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
                console.log("DONE");
            } else {
                console.log("Failed to update the record");
            }
        } catch (e: any) {
            console.log("Error: ", e);
        }
    }

    function acceptRequest() {
        let decision = `new_volunteer_request:accept:${newRequestProfile.email}`
        const jsonResponse = {
            type: decision
        }
        user_data.websocket.send(JSON.stringify(jsonResponse));
        console.log(`Response sent for request ${newRequestProfile.email}: ${decision}`);
        record_contract.partner_profile = newRequestProfile;
        record_contract.is_assigned = true;
        isNewRequest = false;
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
</script>

<main class="main-container">
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
                    <div class="unassign-button">
                        <Button size="xs" onclick={() => {isNewRequest = false; unassign()}} color="red">Unassign</Button>
                    </div>
                    <div>
                        <ReportModal page="100%" fn={reportPartner} color="dark" size="xs"/>
                    </div>
                </div>
            {/if}
        </div>
        <div class="record-form" style="background-color: white; border-radius: 20px; padding: 20px; margin-top: 10px">
            <form>
                {#each record_form as field (field.title)}
                    <Label>{`${field.title} (${field.unit})`}</Label>
                    <div style="margin: 5px;">
                        <Input type="text" placeholder={`Enter the ${field.title}`} bind:value={field.value}></Input>
                    </div>
                    <div style="margin: 5px; margin-bottom: 10px">
                        <Input type="text" placeholder={`Enter the remarks on ${field.title}`} bind:value={field.remarks}></Input>
                    </div>
                {/each}
                {#if showUpdatedModal}
                <p style="color: green; padding: 5px"><strong>Record successfully updated</strong></p>
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