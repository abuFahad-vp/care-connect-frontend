<script>
    import { goto } from "$app/navigation";
    import { Button } from "flowbite-svelte";

</script>
<main class="main-container">
    <div>
        <Button onclick={() => {goto("/")}}>Logout</Button>
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