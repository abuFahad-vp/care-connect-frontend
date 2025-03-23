<script lang="ts">
    import { onMount } from "svelte";
    import ProfileView from "../home/ProfileView.svelte";
    import { Button, Input } from "flowbite-svelte";
    import Fuse from 'fuse.js';
    import { pageData } from "./page_state.svelte";
    import { user_data } from "../user.svelte";

    let users = $state([] as any[]);
    let institutions = $state({});

    const options = {
        keys: ['email', 'full_name'],
        threshold: 0.3
    }

    async function approveUser(email: string) {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/approve/${email}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });

            if (response.ok) {
                console.log(`Approval successfull`);
                await getUsers();
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

    async function deleteUser(email: string) {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/delete/${email}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
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
        let filteredUsers = users;
        if (pageData.searchKeyword !== "") {
            const fuse = new Fuse(users, options);
            const searchResults = fuse.search(pageData.searchKeyword);
            filteredUsers = searchResults.map(result => result.item);
        }
        
        return filteredUsers.filter(user => {
            if (!pageData.showVolunteer && !pageData.showElder) {
                return false;
            }
            
            if (user.user_type === "volunteer" && pageData.showVolunteer) {
                return true;
            }
            
            if (user.user_type === "elder" && pageData.showElder) {
                return true;
            }
            
            return false;
        });
    }

    onMount(async () => {
        try {
          const signup_url = `http://${user_data.serverIP}:8000/user/get_institutions`;
          const response = await fetch(signup_url, { method: "GET"});

          if (response.ok) {
            const data = await response.json();
            institutions = data;
            await getUsers();
            console.log(institutions);
          }
        } catch (e) {
          console.log("ERROR: ", e)
        }
    });

    async function getUsers() {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/get_all_users`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });

            if (response.ok) {
                let responseData = await response.json() as any[];
                console.log(responseData);
                const captainEmails = new Set(Object.keys(institutions));
                users = responseData.filter(user => 
                    (user.user_type === "elder") || user.institution === user_data.data.institution && !captainEmails.has(user.email)
                );
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
    <div class="flex items-center space-x-2 mb-3">
      <label for="volunteer" class="text-sm font-medium cursor-pointer text-gray-700">Show volunteer</label>
      <input 
          type="checkbox" 
          bind:checked={pageData.showVolunteer} 
          id="volunteer" 
          name="volunteer"
          class="w-4 h-4 accent-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
      >
    </div>

    <div class="flex items-center space-x-2 mb-3">
      <label for="elder" class="text-sm font-medium cursor-pointer text-gray-700">Show elder</label>
      <input 
          type="checkbox" 
          bind:checked={pageData.showElder} 
          id="elder" 
          name="elder"
          class="w-4 h-4 accent-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
      >
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
            <div style="display: flex; gap: 10px;">
                {#if !user.approve && user.user_type === "volunteer"}
                 <Button onclick={() => {approveUser(user.email)}} color="green">Approve the volunteer</Button>
                {:else if user.user_type === "volunteer"}
                 <Button disabled={true} color="alternative">Approved</Button>
                {/if}
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
