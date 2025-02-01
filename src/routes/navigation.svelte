<script lang="ts">
    import { onNavigate } from "$app/navigation";

    onNavigate((navigator) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                // Resolve the transition when navigation completes
                resolve();
                await navigator.complete;
            });
        });
    });
</script>