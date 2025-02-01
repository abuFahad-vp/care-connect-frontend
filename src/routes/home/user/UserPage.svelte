<script lang="ts">
    import { goto } from "$app/navigation";
    import { user_data } from "../../user.svelte";
    import ProfileView from "../ProfileView.svelte";
    import { OpenDoorSolid } from "flowbite-svelte-icons";

</script>

<main class="main-container">
    <div class="user-profile">
        <ProfileView formData={user_data.data}/>
        <div class="logout">
            <OpenDoorSolid />
            <button onclick={(e) => goto("/")}>logout</button>
        </div>
    </div>
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