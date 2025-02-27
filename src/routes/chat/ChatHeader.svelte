<script lang="ts">
    import { ArrowLeft } from 'lucide-svelte';
    import { displayImage } from '../../../../home/util.svelte';

    let { user } = $props<{
        user: {
            name: string;
            email: string;
            avatar: string;
        }
    }>();

    
    function handleBack() {
     window.location.href = "/home";
    }

</script>

<div class="flex items-center px-4 py-3 bg-white border-b">
    <button 
        class="p-1 hover:bg-gray-100 rounded-full mr-2"
        onclick={handleBack}
    >
        <ArrowLeft size={24} />
    </button>
    
    <div class="flex items-center">
        <img class="w-10 h-10 rounded-full" src={displayImage(user.avatar)} alt="ProfileImage"/>
        <div class="ml-3">
            <h2 class="font-semibold text-gray-800">{user.name}</h2>
            <p class="text-sm text-gray-500">{user.email}</p>
        </div>
    </div>
</div>
