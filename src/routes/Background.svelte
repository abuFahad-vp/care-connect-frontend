<script lang="ts">
    export const {z_index} = $props();    
</script>

<div class="background1" style="z-index: {z_index};"></div>
<div class="background2" style="z-index: {z_index};"></div>

<style>
    .background1 {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bg-color);
        opacity: 0.4;
    }

    .background2 {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("/images/startup_image.jpg");
        opacity: 0.2;
        background-size: contain;
    }
</style>