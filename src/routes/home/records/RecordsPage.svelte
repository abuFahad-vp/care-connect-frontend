<script lang="ts">
    import { onMount } from "svelte";
    import { user_data } from "../../user.svelte";
    import ElderRecordPage from "./ElderRecordPage.svelte";
    import { getPartner, record_contract } from "./recordData.svelte";
    import VolunteerRecordPage from "./VolunteerRecordPage.svelte";

    onMount(async () => {
        try {
            await getPartner();
        } catch(e: any) {
            console.log(e)
        }
    });

    try {
      user_data.websocket.addListener((msg) => {
          if (msg.type == "Text") {
              const incomingData = JSON.parse(msg.data)
              console.log("HERE")
              if (incomingData.type === "volunteer_service_message") {
                  if (incomingData.message === "unassign") {
                      record_contract.is_assigned = false;
                      record_contract.is_requesting = false;
                  }
              }
          }
      })
    } catch (error) {
      console.log("ERROR: ", error)
    }
</script>

{#if user_data.data.user_type === "elder"}
<ElderRecordPage />
{:else}
<VolunteerRecordPage />
{/if}

<style>
</style>
