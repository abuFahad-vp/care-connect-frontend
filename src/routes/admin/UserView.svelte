<script lang="ts">
    import { onMount } from "svelte";
    // import { user_data } from "../user.svelte";
    import ProfileView from "../home/ProfileView.svelte";
    import { Button, Input } from "flowbite-svelte";
    import Fuse from 'fuse.js';
    import { pageData } from "./page_state.svelte";

    let users = $state([] as any[]);

    const options = {
        keys: ['email', 'full_name'],
        threshold: 0.3
    }

    async function deleteUser(email: string) {
        try {
            // let response = await fetch(`/admin/users`, {
            // let response = await fetch(`${user_data.serverURL}/admin/delete/${email}`, {
            let response = await fetch(`http://192.168.1.11:8000/admin/delete/${email}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3Mzg5ODY5Njl9.6x6LXfF8-nZd86R0R8CGXL3I5DZY8tmJyzBpR_R42gA`
                },
            });

            if (response.ok) {
                console.log(`User ${email} successfully deleted`);
                await getUsers();
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }


    function listOfUsers() {
        // return []
        if (pageData.searchKeyword === "") {
            return users;
        }
        const fuse = new Fuse(users, options);
        const searchResults = fuse.search(pageData.searchKeyword);
        return searchResults.map(result => result.item);
    }

    onMount(async () => {
        try {
            await getUsers()
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    });

    async function getUsers() {
        try {
            // let response = await fetch(`${user_data.serverURL}/admin/users`, {
            let response = await fetch(`http://192.168.1.11:8000/admin/users`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3Mzg5ODY5Njl9.6x6LXfF8-nZd86R0R8CGXL3I5DZY8tmJyzBpR_R42gA`
                },
            });

            if (response.ok) {
                let responseData = await response.json() as any[];
                console.log(responseData);
                users = responseData.slice(1);
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

</script>

<main class="main-container">
    <div style="margin: 30px 0" class="search">
        <Input type="search" placeholder="search" bind:value={pageData.searchKeyword}/>
    </div>
    {#if listOfUsers().length === 0}
        <div style="opacity: 0.8; align-self: center; justify-self: center">
            <p>No users found.</p>
        </div>
    {/if}
    {#each listOfUsers() as user (user.email)}
        <div style=
        "background-color: white; display: flex; flex-direction: column;
        justify-contents: center; align-items: center; padding: 20px;
        border-radius: 5%"
        >
            <ProfileView formData={user} />
            <div>
                <Button onclick={() => {deleteUser(user.email)}} color="red"> Delete the user</Button>
            </div>
        </div>
        <div style="margin: 30px"></div>
    {/each}
</main>

<style>
    .main-container {
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