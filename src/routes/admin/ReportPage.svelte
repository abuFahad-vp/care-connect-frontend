<script lang="ts">
    import { onMount } from "svelte";
    import { pageData } from "./page_state.svelte";
    let reports = $state([] as any[]);

    onMount(async () => {
        await getFeedbacks();
    });

    function customSort(reports: any[]) {
        return reports.sort((a, b) => {
            if (a.status === 'not_reviewed' && b.status !== 'not_reviewed') return -1;
            if (b.status === 'not_reviewed' && a.status !== 'not_reviewed') return 1;
            
            return b.id - a.id;
        });
    }

    async function getFeedbacks() {
        try {
            // let response = await fetch(`${user_data.serverURL}/admin/feedback`, {
            let response = await fetch(`http://192.168.1.11:8000/admin/feedback`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3Mzg5ODY5Njl9.6x6LXfF8-nZd86R0R8CGXL3I5DZY8tmJyzBpR_R42gA`
                },
            });

            if (response.ok) {
                let responseData = await response.json() as any[];
                reports = customSort(responseData);
                console.log(responseData);
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

    function viewProfile(email: string, type: string) {
        pageData.searchKeyword = email
        pageData.currentPageIndex = 1;
    }

    // TODO
    async function updateStatus(id: number, newStatus: string) {
        try {
            // let response = await fetch(`${user_data.serverURL}/admin/feedback`, {
            let response = await fetch(`http://192.168.1.11:8000/admin/`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3Mzg5ODY5Njl9.6x6LXfF8-nZd86R0R8CGXL3I5DZY8tmJyzBpR_R42gA`
                },
            });

            if (response.ok) {
                let responseData = await response.json() as any[];
                reports = customSort(responseData);
                console.log(responseData);
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

</script>

<main class="main-container">
  <div class="report-management">
    {#if reports.length === 0}
    <p style="opacity:0.6; width:100%; height:70vh; display: flex; justify-content:center; align-items:center">No feedbacks or reports</p>
    {/if}
    {#each reports as report (report.id)}
      <div class="report-card rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
        <div class="report-details p-4">
            <div>
              <p class="text-lg font-semibold text-gray-800 mb-2">{report.feedback}</p>
              <span class="px-3 py-1 rounded-full text-sm {
                report.status === 'not_reviewed' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : 
                report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }">
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div class="buttons-div">
              <button 
                onclick={() => viewProfile(report.reported_email, 'reported')}
                class="buttons bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                View Reported Profile
              </button>
              <button 
                onclick={() => viewProfile(report.reporter_email, 'reporter')}
                class="buttons bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                View Reporter Profile
              </button>
              <button 
                onclick={() => updateStatus(report.id, 'reviewed')}
                class="buttons bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
    {/each}
  </div>
</main>

<style>
  .main-container {
    position: static;
    bottom: 20%;
    width: 100%;
    height: 82vh;
    overflow-y: auto;
    border: 1px solid #000;
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

  .report-management {
    max-width: 500px;
    margin: 0 auto;
    padding: 15px;
  }
  
  .report-card {
    margin-bottom: 15px;
    transition: all 0.3s ease;
  }

  .report-details {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .buttons-div {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }

  .buttons {
    height: 40px;
  }
  
  button {
    outline: none;
    transition: all 0.3s ease;
  }
</style>