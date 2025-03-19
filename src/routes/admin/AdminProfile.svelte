<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "flowbite-svelte";
    import WebSocket from "@tauri-apps/plugin-websocket";
    import { user_data } from "../user.svelte";
    import { pageData } from "./page_state.svelte";
    import { service_requests } from "../home/services/elder/service_data.svelte";


</script>
<main class="main-container">
    <div>
            <Button onclick={
              async (e: any) => {
                service_requests.requests = [];
                pageData.currentPageIndex = 0;

                user_data.file = undefined as any;

                await user_data.websocket.disconnect();
                await user_data.chat_socket.disconnect();

                user_data.websocket = new WebSocket(0, [] as any),
                user_data.chat_socket = new WebSocket(0, [] as any),
                user_data.sessionToken = "",
                user_data.data = {
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
            }>logout</Button>
    </div>
</main>

<style>
    .main-container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: static;
        bottom: 20%;
        width: 100%;
        height: 82vh;
        overflow-y: auto;
        border: 1px solid #000;;
        border-width: 0px;
        border-color: black;
        touch-action: pan-y;
    }

    .main-container::-webkit-scrollbar {
        width: 0px;
    }

    @media (max-height: 700px) {
        .main-container {
            height: 73vh;
        }
    }
</style>
