<script lang="ts">
    import { Button } from "flowbite-svelte";
    import { user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { record_contract, unassign } from "./recordData.svelte";
    import { displayImage } from "../util.svelte";

    let newRequestProfile = $state({} as any);
    let isNewRequest = $state(false);
    let showProfile = $state(false);
    

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
                </div>
            {/if}
        </div>
        <div class="record-form" style="background-color: white; border-radius: 20px; padding: 20px; margin-top: 10px">
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