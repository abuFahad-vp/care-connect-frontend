<script lang="ts">
    import ChatContainer from "./ChatContainer.svelte";
    import { chatData } from "./chat_data.svelte";
    import { onMount } from "svelte";
    
    let {partner_profile, service_id, show = $bindable()} = $props();
    let el: any;

    chatData.partner_profile = partner_profile;
    chatData.service_id = service_id;

    onMount(() => {
      if (el) {
        document.body.appendChild(el);
      }
      return () => {
        if (el) el.remove();
      }
    })
</script>

<main bind:this={el}>
  <ChatContainer bind:show={show} />
</main>

<style>
  main {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    overflow: hidden;
    pointer-events: auto;
  }
</style>
