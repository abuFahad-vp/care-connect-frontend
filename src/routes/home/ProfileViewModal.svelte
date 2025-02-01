<script>
    import { Button, Modal } from 'flowbite-svelte';
    import ProfileView from './ProfileView.svelte';
    let {formData} = $props();

    let showModal = $state(false);
    function closeModal() {
        showModal = false;
    }
</script>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showModal}
    <Modal bind:open={showModal} size="xs" autoclose>
        <div class="modal-overlay">
            <div class="modal-content">
                <ProfileView {formData}/>
                <Button color="light" onclick={closeModal}>Close</Button>
            </div>
        </div>
    </Modal>
{:else}
    <Button size="xs" color="dark" onclick={() => showModal = true}>View profile</Button>
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
    }
</style>
