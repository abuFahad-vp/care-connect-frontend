<script lang="ts">
    import { pageData } from "./page_state.svelte";

    let touchStartX = $state(0);
    let touchStartY = $state(0);
    let touchStartTime = $state(0);
    let isDragging = $state(false);
    let swipeProgress = $state(0);

    let { pages}: {
      pages: any[]
    } = $props();
    const SWIPE_THRESHOLD = 0.2; // 20% of screen width
    const VELOCITY_THRESHOLD = 0.5; // pixels/ms

    function startDrag(clientX: number, clientY: number) {
      touchStartX = clientX;
      touchStartY = clientY;
      touchStartTime = Date.now();
      isDragging = true;
    }

    function moveDrag(clientX: number, clientY: number) {
      if (!isDragging) return;
      if (Math.abs(touchStartY - clientY) > 50) return;
      if (!pageData.isSwipable) return;
      const deltaX = clientX - touchStartX;
      swipeProgress = deltaX / window.innerWidth;
      
      // Contain swipe between -1 and 1 (prevents overscrolling)
      swipeProgress = Math.max(-1, Math.min(1, swipeProgress));
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;

      const deltaTime = Date.now() - touchStartTime;
      const velocity = Math.abs(swipeProgress * window.innerWidth) / deltaTime;
      
      // Determine if we should switch pages
      if (Math.abs(swipeProgress) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        const direction = swipeProgress > 0 ? -1 : 1;
        const newIndex = pageData.currentPageIndex + direction;
        
        // Keep index within bounds
        if (newIndex >= 0 && newIndex < pages.length) {
          pageData.currentPageIndex = newIndex;
        }
      }
      
      swipeProgress = 0;
    }

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="swipe-container"
  ontouchstart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
  ontouchmove={e => moveDrag(e.touches[0].clientX,e.touches[0].clientY)}
  ontouchend={endDrag}
  onmousedown={e => startDrag(e.clientX, e.clientY)}
  onmousemove={e => moveDrag(e.clientX, e.clientY)}
  onmouseup={endDrag}
  onmouseleave={endDrag}
>
  <div 
    class="slider"
    style:transform={`translateX(calc(${-(pageData.currentPageIndex) * 100}% + ${swipeProgress * 100}%))`}
    style:transition={isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)'}
  >
    {#each pages as C, index}
      <div 
        class="page"
        class:active={index === pageData.currentPageIndex}
      >
        <C/>
      </div>
    {/each}
  </div>
</div>

<style>
  .swipe-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    user-select: none;
  }

  .slider {
    display: flex;
    width: 100%;
    height: 100%;
    will-change: transform;
  }

  .page {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.3s ease;
  }
</style>