<script lang="ts">
    import { onMount } from 'svelte';
    import { user_data } from '../../../user.svelte';
    import { chatData } from './chat_data.svelte';
    import ChatHeader from './ChatHeader.svelte';
    import ChatMessage from './ChatMessage.svelte';
    import RecordsPage from '../../../home/records/RecordsPage.svelte';

    let messages: ChatMessageTemp[] = $state([
    ]);

    let content = $state("");
    let messageContainer: HTMLDivElement;
    let keyboardVisible = $state(false);
    let viewportHeight = $state(window.innerHeight);
    let textarea: HTMLTextAreaElement;

    let currentUser = {
        name: chatData.partner_profile.full_name,
        email: chatData.partner_profile.email,
        avatar: chatData.partner_profile.profile_image,
    };

    let my_email = "";
    if (chatData.partner_profile.email === "v1@v.com") {
      my_email = "e1@e.com"
    } else {
      my_email = "v1@v.com"
    }

    // Auto-scroll to the latest message when messages update
    $effect(() => {
        if (messages.length && messageContainer) {
            setTimeout(() => {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }, 0);
        }
    });

    onMount(async () => {
      try {
        //let response = await fetch(`${user_data.serverURL}/user/messages/${chatData.service_id}`)
        let response = await fetch(`http://192.168.1.5:8000/user/messages/${chatData.service_id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch the messages");
        }
        messages = await response.json();
        messages = messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
      } catch(error) {
        console.log("ERROR: ", error)
      }
    })

    function handleFocus() {
        resizeTextarea();
        keyboardVisible = true;
    }

    function handleBlur() {
        keyboardVisible = false;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        handleSend();
      }
      resizeTextarea();
    }

    function handleSend() {
        keyboardVisible = true;
        if (content.trim() === "") {
            content = "";
            return;
        }
        let new_message: ChatMessageTemp = {
                id: messages.length + "",
                service_id: chatData.service_id,
                content: content,
                //sender: user_data.data.email,
                sender: my_email,
                reciever: chatData.partner_profile.email,
                timestamp: new Date(),
                status: "sent",
        };

        messages.push(new_message);
        chatData.socket?.send(JSON.stringify(new_message));
        content = "";
        resizeTextarea();
    }
    
    if (chatData.socket !== undefined) {
      chatData.socket.onmessage = (event) => {
        console.log('Message recieved: ', event.data);
        const data = JSON.parse(event.data);
        data.timestamp = new Date(data.timestamp);
        messages.push(data);
      }
    }

    function resizeTextarea() {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }

</script>

<div
    class="flex flex-col bg-white"
    style="height: {keyboardVisible ? viewportHeight + 'px' : '100vh'};"
>
    <ChatHeader user={currentUser} />

    <div
        bind:this={messageContainer}
        class="flex-1 overflow-y-auto px-4 py-4"
        style="transition: margin-bottom 0.3s ease;"
    >
        {#each messages as message (message.id)}
            <ChatMessage
                {message}
                isOwnMessage={my_email === message.sender}
            />
        {/each}
    </div>

    <div
        class="px-4 py-3 border-t bg-white transition-all duration-300"
        style="margin-bottom: {keyboardVisible ? '270px': '0'};"
    >
        <div class="flex items-center gap-2">
            <textarea
                placeholder="Type a message..."
                class="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-teal-800 focus:ring-1 focus:ring-teal-800 resize-none"
                bind:this={textarea}
                bind:value={content}
                onfocus={handleFocus}
                onblur={handleBlur}
                oninput={resizeTextarea}
                onkeydown={handleKeyDown}
                rows="1"
                style="overflow-y: hidden;"
            ></textarea>
            <button
                onclick={handleSend}
                class="px-4 py-2 bg-teal-800 text-white rounded-full hover:bg-teal-900"
            >
                Send
            </button>
        </div>
    </div>
</div>
