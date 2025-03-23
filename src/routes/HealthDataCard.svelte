<script lang="ts">
    import ProfileViewModal from "./home/ProfileViewModal.svelte";
    import { user_data } from "./user.svelte";

  let { record, elder, volunteer } = $props();
  
  // State to track if the card is expanded
  let expanded = $state(false);
  
  // Parse the data string into an array of health measurements
  const healthData = JSON.parse(record.data);
  
  // Format the date string to be more readable
  function formatDate(dateString: any) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Toggle expansion state
  function toggleExpand() {
    expanded = !expanded;
  }
  
  // Function to count completed fields
  function getCompletedCount(data: any) {
    return data.filter((item: any) => item.value && item.value.trim() !== '').length;
  }
</script>

<div class="max-w-md mx-auto my-4">
  <div 
    class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
    class:shadow-lg={expanded}
  >
    <!-- Card Header - Always visible -->
    <div 
      class="p-4 cursor-pointer flex flex-col border-b"
      on:click={toggleExpand}
    >
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-lg text-gray-800">Record #{record.id}</h3>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {record.status}
          </span>
        </div>
        <button class="text-blue-500 hover:text-blue-700">
          {expanded ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div class="grid grid-cols-2 gap-2 mb-3">
        <p class="text-sm text-gray-600">
          Elder: {record.user_email}
        </p>
        <p class="text-sm text-gray-600">
          Volunteer: {record.volunteer_email}
        </p>
      </div>
      
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-700">
          {getCompletedCount(healthData)} of {healthData.length} health metrics recorded
        </p>
        <p class="text-sm text-gray-600">
          Check-in: {formatDate(record.last_check_in)}
        </p>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-2 mt-3" on:click|stopPropagation>
      {#if user_data.data.user_type === "elder"}
        <ProfileViewModal formData={volunteer}/>
      {:else if user_data.data.user_type === "volunteer"}
        <ProfileViewModal formData={elder}/>
      {:else}
        <ProfileViewModal formData={elder}/>
        <ProfileViewModal formData={volunteer}/>
      {/if}
      </div>
    </div>
    
    <!-- Expandable Content -->
    {#if expanded}
      <div class="p-4 bg-gray-50">
        <!-- Record details -->
        <div class="mb-4 pb-4 border-b border-gray-200">
          <h4 class="font-medium text-gray-800 mb-3">Record Information</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-gray-500">Service ID</p>
              <p class="font-mono">{record.service_id}</p>
            </div>
            <div>
              <p class="text-gray-500">Volunteer</p>
              <p>{record.volunteer_email}</p>
            </div>
          </div>
        </div>
        
        <!-- Health data -->
        <h4 class="font-medium text-gray-800 mb-3">Health Measurements</h4>
        <div class="divide-y divide-gray-200">
          {#each healthData as field (field.title)}
            <div class="py-3 first:pt-0 last:pb-0">
              <div class="flex justify-between items-baseline">
                <h4 class="font-medium text-gray-800">{field.title}</h4>
                <span class="text-sm text-gray-500">{field.unit}</span>
              </div>
              
              <div class="mt-1 flex items-center">
                {#if field.value}
                  <span class="text-lg font-semibold">{field.value}</span>
                {:else}
                  <span class="text-gray-400 italic">Not recorded</span>
                {/if}
              </div>
              
              {#if field.remarks}
                <p class="mt-1 text-sm text-gray-600">
                  Notes: {field.remarks}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
