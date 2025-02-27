<script lang="ts">
    let { message, isOwnMessage } = $props<{
        message: ChatMessageTemp;
        isOwnMessage: boolean;
    }>();

    let formattedTime = $derived(new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric'
    }).format(message.timestamp));
</script>

<div class={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 max-w-full`}>
    <div class={`max-w-[80%] ${isOwnMessage ? 'bg-teal-800 text-white' : 'bg-stone-400'} rounded-lg px-4 py-1`}>
        <p class="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        <span class={`text-xs ${isOwnMessage ? 'text-teal-100' : 'text-stone-100'} block mt-1`}>
            {formattedTime}
        </span>
    </div>
</div>
