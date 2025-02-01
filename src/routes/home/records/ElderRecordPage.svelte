<script lang="ts">
    import { Button } from "flowbite-svelte";
    import { getPartner, record_contract, unassign } from "./recordData.svelte";
    import LoadingSpinner from "../../LoadingSpinner.svelte";
    import { sleep, user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { displayImage } from "../util.svelte";

    let showProfile = $state(false);

    async function startVolunteerRequest() {
        let response = await fetch(`${user_data.serverURL}/elder/new_volunteer_request`, {
            method: 'POST',
			headers: {
				'Authorization': `Bearer ${user_data.sessionToken}`
			},
        })
        let responseData = await response.json() as any;
        console.log(response)
        console.log(responseData)

        while (true) {
            response = await fetch(`${user_data.serverURL}/elder/find_assign_volunteer/5`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                }
            });
            if (response.ok) {
                await getPartner();
                return
            }
            responseData = await response.json() as any;
            console.log(response)
            console.log(responseData)
            await sleep(1000);
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
                        <Button size="xs" onclick={() => {unassign()}} color="red">Unassign</Button>
                    </div>
                </div>
            {/if}
        </div>
        <div class="record-form">
        </div>
    {:else if record_contract.is_requesting}
        <div class="request-loading">
            <h2>Requesting...</h2>
            <div class="spinner">
                <LoadingSpinner size=2rem/>
            </div>
        </div>
    {:else}
        <div class="request-button">
            <Button shadow={true} onclick={() => {
                    record_contract.is_requesting = true;
                    startVolunteerRequest();
                }
            } color="primary" size="xs">Request new volunteer for the weekend service</Button>
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

    .request-button {
        position: relative;
        display: flex;
        width: 70%;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        left: 15%;
    }

    .request-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: x-large;
        font-weight: 800;
        color: var(--primary-color);
    }

    .profile-view {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        border-radius: 20px;
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