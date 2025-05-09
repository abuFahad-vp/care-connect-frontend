<script lang="ts">
    import { Button, Input, Label } from "flowbite-svelte";
    import { getPartner, record_contract, unassign, type recordForm } from "./recordData.svelte";
    import LoadingSpinner from "../../LoadingSpinner.svelte";
    import { sleep, user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { displayImage, reportUser } from "../util.svelte";
    import { onMount } from "svelte";
    import ReportModal from "../../ReportModal.svelte";
    import ChatWindow from "../../chat/ChatWindow.svelte";

    let showProfile = $state(false);
    let record_form = $state([] as recordForm[]);
    let isShowChat = $state(false);
    let showSpinner = $state(true);

    user_data.websocket.addListener(async (msg) => {
        if (msg.type === "Text") {
            const incomingData = JSON.parse(msg.data)
            if (incomingData.type === "volunteer_service") {
                if (incomingData.message === "record_updated") {
                    try {
                        await getRecord();
                    } catch (e: any) {
                        console.log("ERROR: ", e)
                    }
                }
            }
        }
    })

    onMount(async () => {
        try {
            await getRecord();
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    })

    async function getRecord() {
        try {
            let response = await fetch(`${user_data.serverURL}/elder/record`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });
            if (response.ok) {
                let responseData = await response.json();
                record_form = JSON.parse(responseData.data);
                // console.log(record_form[0]);
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

    async function startVolunteerRequest() {
        
        showSpinner = true;

        let response = await fetch(`${user_data.serverURL}/elder/new_volunteer_request`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user_data.sessionToken}`
            },
        })

        let responseData = await response.json() as any;
        console.log(response)
        console.log(responseData)

        setTimeout(function(){showSpinner = false}, 3000);

        while (true) {
            response = await fetch(`${user_data.serverURL}/elder/find_assign_volunteer/5`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                }
            });

            if (await getPartner() === true) {
                return
            }

            responseData = await response.json() as any;
            console.log(response)
            console.log(responseData)

            await sleep(1000);
        }
    }

    async function reportPartner(msg: string): Promise<string> {
        let status = await reportUser(msg, record_contract.partner_profile.email, "Weekend service report");
        if (status) {
            return `Successfully reported the ${record_contract.partner_profile.user_type}`
        } else {
            return `Failed to report the ${record_contract.partner_profile.user_type}`
        }
    }

    async function submitFeedback(msg: string): Promise<string> {
        let status = await reportUser(msg, record_contract.partner_profile.email, "Weekend service feedback");
        if (status) {
            return `Thank you for your feedback`
        } else {
            return `Failed to send the feedback`
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
                    {#if !isShowChat}
                    <div style="padding: 5px;">
                      <Button onclick={() => isShowChat = true} color="light" size="xs">Chat</Button>
                    </div>
                    {:else}
                    <ChatWindow partner_profile={record_contract.partner_profile} service_id={record_contract.service_id} bind:show={isShowChat}/>
                    {/if}
                    <div class="unassign-button">
                        <Button size="xs" onclick={() => {unassign()}} color="red">Unassign</Button>
                    </div>
                    <!-- <div class="unassign-button">
                        <Button size="xs" onclick={() => {unassign()}} color="red">Unassign</Button>
                    </div> -->
                    <div>
                        <ReportModal modal_header="Report" button_name="Report" page="100%" fn={reportPartner} color="dark" size="xs"/>
                    </div>
                </div>
            {/if}
        </div>
        <div class="record-form" style="background-color: white; border-radius: 20px; padding: 20px; margin-top: 10px">
            <form>
                {#each record_form as field (field.title)}
                    <Label>{`${field.title} (${field.unit})`}</Label>
                    <div style="margin: 5px;">
                        <Input readonly={true} type="text" placeholder={`${field.title}`} bind:value={field.value}></Input>
                    </div>
                    <div style="margin: 5px; margin-bottom: 10px">
                        <Input readonly={true} type="text" placeholder={`remarks on ${field.title}`} bind:value={field.remarks}></Input>
                    </div>
                {/each}
                <ReportModal modal_header="Feedback" button_name="Feedback" page="100%" fn={submitFeedback} color="primary" size="xs"/>
                <div style="padding-bottom: 20px;"></div>
            </form>
        </div>
    {:else if record_contract.is_requesting}
        <div class="request-loading">
            {#if showSpinner}
              <h2>Requesting...</h2>
              <div class="spinner">
                  <LoadingSpinner size=2rem/>
              </div>
            {:else}
              <h2>Request Sent.</h2>
            {/if}
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
