<script lang="ts">
    import { Button } from "flowbite-svelte";
    import ChatContainer from "./ChatContainer.svelte";
    import { chatData } from "./chat_data.svelte";
    import { user_data } from "../../../../user.svelte";

    let { data } = $props();

    if (data.service_id !== undefined) {
      chatData.service_id = data.service_id;
    }
    chatData.partner_profile = data.partner_profile;
    if (data.ip !== undefined) {
      chatData.ip = data.ip;
    }

    let my_email = "";
    if (chatData.partner_profile.email === "v1@v.com") {
      my_email = "e1@e.com"
    } else {
      my_email = "v1@v.com"
    }

    const socket = new WebSocket(`ws://${data.ip}:8000/chat/${my_email}`);

    socket.onopen = () => {
      console.log('WebSocket connection established')
    }
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    }

    socket.onerror = (error) => {
      console.error('Websocket error: ', error);
    }

    chatData.socket = socket;

</script>

<main>
  <ChatContainer />
</main>
