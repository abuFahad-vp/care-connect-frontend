<script lang="ts">
    import { goto } from "$app/navigation";
    import { user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { OpenDoorSolid } from "flowbite-svelte-icons";
    import WebSocket from '@tauri-apps/plugin-websocket';
    import { record_contract } from "../records/recordData.svelte";
    import { pageData } from "../page_state.svelte";
    import { service_requests } from "../services/elder/service_data.svelte";
    import { Tabs, TabItem } from 'flowbite-svelte';
    import TaskRecords from "../../admin/TaskRecords.svelte";
</script>

<main class="main-container">
  <Tabs tabStyle="underline">
      <TabItem open title="Profile">
        <div class="user-profile">
            <ProfileView formData={user_data.data}/>
            <div class="logout">
                <OpenDoorSolid />
                <button onclick={
                  async (e) => {
                    service_requests.requests = [];
                    pageData.serviceRequestsArray = [];
                    pageData.currentPageIndex = 0;

                    record_contract.service_id = "";
                    record_contract.is_assigned = false;
                    record_contract.is_requesting = false;
                    record_contract.partner_profile = {};

                    user_data.file = undefined as any;
                    try {
                      await user_data.websocket.disconnect();
                      await user_data.chat_socket.disconnect();
                    } catch (e: any) {
                      console.log("Already closed");
                    }


                    user_data.websocket = new WebSocket(0, [] as any),
                    user_data.chat_socket = new WebSocket(0, [] as any),
                    user_data.sessionToken = "",
                    user_data.data = {
                          institution: '',
                          user_type: '',
                          full_name: '',
                          email: '',
                          password: '',
                          confirm_password: '',
                          dob: '',
                          contact_number: '',
                          location: '',
                          volunteer_credits: "",
                          bio: '',
                          profile_image: "",
                    }
                    goto("/")
                  }
                }>logout</button>
            </div>
        </div>
      </TabItem>
    <TabItem title="Activity Logs">
      <TaskRecords />
    </TabItem>
  </Tabs>
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

    .logout {
        display: flex;
        align-items: center;
        padding: 20px;
    }

    .user-profile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: white;
    }
</style>
