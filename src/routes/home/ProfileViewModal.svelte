<script>
    import { Button, Modal } from 'flowbite-svelte';
    import ProfileView from './ProfileView.svelte';
    import { displayImage } from './util.svelte';
    let {formData} = $props();

    let showModal = $state(false);

    function closeModal() {
        showModal = false;
    }
</script>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showModal}
        <div class="modal-overlay">
            <div class="modal-content">
                <ProfileView {formData}/>
                <Button color="dark" onclick={closeModal}>Hide</Button>
            </div>
        </div>
{:else}
    <div style="display: flex; flex-direction: column; align-items: center">
        <img style="border-radius: 50%; width: 80px; height: 80px; margin: 5px" src={displayImage(formData.profile_image)} alt="profile">
        <p style="padding: 4px;"><strong>{formData.full_name}</strong></p>
        <Button size="xs" color="dark" onclick={() => showModal = true}>View profile</Button>
    </div>
{/if}

<style>
    .modal-overlay {
        /* position: fixed; */
        /* top: 0;
        left: 0; */
        position: relative;
        /* width: 100%;
        height: 100%; */
        /* background: rgba(0, 0, 0, 0.5); */
    }
    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: white;
        padding-bottom: 20px;
        border-radius: 10px;
        scroll-behavior: smooth;
    }
</style>
