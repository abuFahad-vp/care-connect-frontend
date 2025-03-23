<script lang="ts">
  import { user_data } from "./user.svelte";
  import { formatDateTime } from "./home/util.svelte";
  import ProfileViewModal from "./home/ProfileViewModal.svelte";

  let { taskForm, elder, volunteer }: { taskForm: any, elder: any, volunteer: any } = $props();
  let locations = $state([] as any[]);

  if (taskForm !== undefined) {
    locations = taskForm.locations.map((location: string) => {
        let x = location.split("|");
        return [x[0], x[1]]; // location url and its description
    });
  }
</script>

<div>
<div class="bg-white p-3 rounded-md shadow-sm border border-gray-200 my-3 mx-2">
    {#if taskForm?.urgent}
      <p class="text-sm font-bold text-white bg-red-600 px-2 py-1 mb-2 rounded shadow-sm animate-pulse text-center">
          🚨 EMERGENCY 🚨
      </p>
    {/if}
    
    <div class="grid grid-cols-2 gap-1 text-xs mb-2">
        <p><span class="font-medium">ID:</span> {taskForm?.service_id}</p>
        <p><span class="font-medium text-blue-600">Status:</span> {taskForm?.status}</p>
    </div>
    
    <div class="mb-2">
        <p class="font-medium text-xs">Description:</p>
        <p class="text-sm text-gray-700 leading-tight">{taskForm?.description}</p>
    </div>
    
    <div class="flex flex-wrap gap-4 text-xs mb-2">
        <div>
            <p class="font-medium">Documents:</p>
            <ul class="list-disc pl-4">
                {#each taskForm?.documents || [] as document}
                    <li>
                        <a class="text-blue-600 hover:underline" target="_blank" 
                           href={`${user_data.serverURL}/volunteer/get_documents/${taskForm?.service_id}/${document}?token=${user_data.sessionToken}`}>
                           {document}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
        
        <div>
            <p class="font-medium">Locations:</p>
            <ul class="list-disc pl-4">
                {#each locations || [] as location}
                    <li>
                        <a class="text-blue-600 hover:underline" target="_blank" href={location[0]}>
                            {location[1]}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
    
    <div class="grid grid-cols-2 gap-1 text-xs mb-3">
        <p><span class="font-medium">From:</span> {taskForm ? formatDateTime(taskForm.time_period_from) : ""}</p>
        <p><span class="font-medium">To:</span> {taskForm ? formatDateTime(taskForm.time_period_to) : ""}</p>
        <p class="col-span-2"><span class="font-medium">Contact:</span> {taskForm?.contact_number}</p>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex justify-between gap-2 mt-2 pt-2 border-t border-gray-200">
      {#if user_data.data.user_type === "elder" && volunteer !== undefined}
        <ProfileViewModal formData={volunteer}/>
      {:else if user_data.data.user_type === "volunteer" && elder !== undefined}
        <ProfileViewModal formData={elder}/>
      {:else if user_data.data.user_type === "admin"}
        {#if elder !== undefined}
        <ProfileViewModal formData={elder}/>
        {/if}
        {#if volunteer !== undefined}
        <ProfileViewModal formData={volunteer}/>
        {/if}
      {/if}
    </div>
</div>
</div>
