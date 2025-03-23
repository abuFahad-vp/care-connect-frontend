<script lang="ts">
    import { onMount } from "svelte";
    import { pageData } from "./page_state.svelte";
    import { user_data } from "../user.svelte";
    let reports = $state([] as any[]);

    onMount(async () => {
        try {
            await getFeedbacks();
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    });

    function customSort(reports: any[]) {
        return reports.sort((a, b) => {
            if (a.status === 'not_reviewed' && b.status !== 'not_reviewed') return -1;
            if (b.status === 'not_reviewed' && a.status !== 'not_reviewed') return 1;
            
            return b.id - a.id;
        });
    }

    user_data.websocket.addListener(async (msg) => {
        if (msg.type === "Text") {
            const incomingData = JSON.parse(msg.data)
            if (incomingData.type === "new_feedback") {
                try {
                    await getFeedbacks();
                } catch (e: any) {
                    console.log("ERROR: ", e)
                }
            }
        }
    })

    async function getUser(email: string) {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/users/${email}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });

            if (response.ok) {
                let responseData = await response.json();
                return responseData;
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
            return {}
        }
    }

    async function getFeedbacks() {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/feedback`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });
            if (response.ok) {
                let responseData = await response.json() as any[];
                let loggedUserInstitution = user_data.data.institution;

                // Use Promise.all to resolve all async getUser() calls in parallel
                let filteredReports = await Promise.all(responseData.map(async report => {
                    let [reporter, reported] = await Promise.all([
                        getUser(report.reporter_email),
                        getUser(report.reported_email)
                    ]);

                    console.log("REPORTED: ", reported.institution);
                    console.log("REPORTER: ", reporter.institution);
                    console.log("Captain institution: ", loggedUserInstitution);

                    // Return the report if either institution matches the logged user’s institution
                    return (reporter.institution === loggedUserInstitution || reported.institution === loggedUserInstitution) 
                        ? report 
                        : null;
                }));

                // Remove null values
                reports = customSort(filteredReports.filter(report => report !== null));

                console.log("Response Data: ", reports);
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
        }
    }

    function viewProfile(email: string, type: string) {
        pageData.searchKeyword = email
        pageData.currentPageIndex = 1;
        pageData.showElder = true;
        pageData.showVolunteer = true;
    }

    async function updateStatus(id: number, newStatus: string) {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/feedback/review/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });

            if (response.ok) {
                await getFeedbacks();
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
            <div>
                <p>feedback type: <strong>{report.feedback_type}</strong></p>
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
              {#if report.status !== 'reviewed'}
              <button 
                onclick={() => updateStatus(report.id, 'reviewed')}
                class="buttons bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Mark as Reviewed
              </button>
              {/if}
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
    touch-action: pan-y;
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
