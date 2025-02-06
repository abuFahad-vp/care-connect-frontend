<script lang="ts">
    import { Button, Input, Textarea } from "flowbite-svelte";
    import { ExclamationCircleOutline } from "flowbite-svelte-icons";
    let {color="primary", size ="xs", fn}: {
        color:"primary" | "red" | "yellow" | "green" | "purple" | "blue" | "light" | "dark" | "none" | "alternative" | undefined,
        size: "xs" | "sm" | "md" | "lg" | "xl" | undefined, 
        fn: ((msg: string) => Promise<string>)
    } = $props();
    let showModal = $state(false);
    let reportReason = $state("");
    let reportStatus = $state("");
</script>

<main>
    {#if showModal}
        <div class="modal">
            <div style="color: white; display: flex; flex-direction:column; gap: 5px; margin: 7px; justify-content: center; align-items: center">
                <ExclamationCircleOutline/>
                <p>Report</p>
                <Textarea bind:value={reportReason} placeholder="Reason"/>
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
        }} {size} {color}>Report</Button>
    {/if}
</main>

<style>
    .modal{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0px;
        left: 100%;
        width: 100%;
        height: 80vh;
        background-color: rgba(0, 0, 0, 0.6);
    }
</style>
