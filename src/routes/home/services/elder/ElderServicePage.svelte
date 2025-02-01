<script lang="ts">
    import { service_requests } from "./service_data.svelte";
    import ServiceForm from "./ServiceForm.svelte";

    function onNewService(e: Event) {
        service_requests.requests.forEach((request, index) => {
                request.expanded = false;
        });

        service_requests.requests.push({
            status: "pending",
            fid: service_requests.requests.length,
            description: "",
            timeout: "",
            time_period_from: "",
            time_period_to: "",
            has_documents: false,
            locations: [] as string[],
            expanded: true,
            contact_number: "",
            documents: [] as File[],
            my_location: "",
            isAccepted: false,
            isSubmitting: false,
            service_id: '',
            error_msg: '',
            isTaskStarted: false,
            remainingTime: 0,
            startTimeRemaining: '',
            timeExceeded: false,
            doesAcceptRequest: true,
            progress: 0,
            locations_input: [],
            partner_profile: {},
        });
    }
</script>

<main class="main-container">
    <button onclick={onNewService} class="new-service-button">
        <svg  width="20px" height="20px" viewBox="0 0 24 24" >
            <path d="M4 12H20M12 4V20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        New service
    </button>
    {#if service_requests.requests.length == 0}
        <div class="no-service-label">
            <h4>No service running.<br>click "+" button for service request</h4>
        </div>
    {/if}
    {#if true}
        <div class="request-forms">
            {#each service_requests.requests.toReversed() as requests, id}
                {#if requests.expanded || service_requests.requests.every(requests => !requests.expanded)}
                    <ServiceForm formData={requests} {id} />
                {/if}
            {/each}
        </div>
    {/if}
</main>

<style>
    :global(*) {
        font-family: 'Inter';
        touch-action: manipulation;
    }

    .request-forms {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
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

    .new-service-button {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        color: white;
        background-color: var(--primary-color);
        border-radius: 30px;
        border-width: 0px;
        box-shadow: none;
        padding: 0.6rem;
        bottom: 3rem;
        right: 0.6rem;
        z-index: 1;
    }

    .no-service-label {
        position: absolute;
        top: 45%;
        left: 10%;
        opacity: 0.5;
        z-index: 0;
    }
</style>