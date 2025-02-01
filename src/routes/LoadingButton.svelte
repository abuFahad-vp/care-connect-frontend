<script lang="ts">
  import LoadingSpinner from './LoadingSpinner.svelte';
  let {isLoading, content, onclick, type}:{
    isLoading: boolean,
    content: string,
    onclick: any
    type: "button" | "submit"
  } = $props();
</script>

<button
  class="generic-button"
  {onclick}
  type={type}
>
  {#if isLoading}
    <LoadingSpinner color="#ffffff"/>
  {:else}
    {content}
  {/if}
</button>

<style>
  .generic-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    background-color: var(--primary-color, #007BFF);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .generic-button:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
</style>