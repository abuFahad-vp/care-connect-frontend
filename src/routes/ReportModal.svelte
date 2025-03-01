<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";
    import { ExclamationCircleOutline } from "flowbite-svelte-icons";
    let {color="primary", size ="xs", fn, page, button_name="Report", modal_header="Report"}: {
        color:"primary" | "red" | "yellow" | "green" | "purple" | "blue" | "light" | "dark" | "none" | "alternative" | undefined,
        size: "xs" | "sm" | "md" | "lg" | "xl" | undefined, 
        page: string,
        fn: ((msg: string) => Promise<string>),
        button_name: string,
        modal_header: string,
    } = $props();
    let showModal = $state(false);
    let reportReason = $state("");
    let reportStatus = $state("");
</script>

<main>
    {#if showModal}
        <div class="modal" style="left: {page};">
            <div style="color: white; display: flex; flex-direction:column; gap: 5px; margin: 7px; justify-content: center; align-items: center">
                <ExclamationCircleOutline/>
                <p>{modal_header}</p>
                <Textarea bind:value={reportReason} placeholder="Enter your message..."/>
            </div>
            {#if reportStatus !== ""}
                <p style="color:yellow; margin: 10px">{reportStatus}</p>
            {/if}
            <div>
                <Button color="alternative" onclick={() => {showModal = false; reportStatus = ""; reportReason = ""}} size="xs">Close</Button>
                <Button color="red" onclick={async () => {
                    reportStatus = await fn(reportReason);
                    }} size="xs">Submit</Button>
            </div>
        </div>
    {:else}
        <Button onclick={() => {
            showModal = true
        }} {size} {color}>{button_name}</Button>
    {/if}
</main>

<style>
    .modal{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 10%;
        width: 100%;
        height: 50vh;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 1000;
    }
</style>
