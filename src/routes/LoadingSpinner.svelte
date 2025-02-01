<script lang="ts">
  let {
    color = "var(--primary-color)", 
    size = "1rem", 
    thickness_needle="0.2rem",
    thickness_outer="0.2rem",
  } = $props();
    
</script>

<div 
  class="clock-loader" 
  style=
  "--clock-color:{color};
  --clock-width: {size};
  --clock-thickness: {thickness_needle};
  --clock-thickness-outer: {thickness_outer};
  "
>
</div>
<style>
    .clock-loader {
    --clock-width: 1rem;
    --clock-radius: calc(var(--clock-width) / 2);
    --clock-minute-length: calc(var(--clock-width) * 0.4);
    --clock-hour-length: calc(var(--clock-width) * 0.2);
    --clock-thickness: 0.1rem;
    --clock-thickness-outer: 2px;

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--clock-width);
    height: var(--clock-width);
    border: var(--clock-thickness-outer) solid var(--clock-color);
    border-radius: 50%;
  }

  .clock-loader::before,
  .clock-loader::after {
    position: absolute;
    content: "";
    top: calc(var(--clock-radius) * 0.25);
    width: var(--clock-thickness);
    background: var(--clock-color);
    border-radius: 10px;
    transform-origin: center calc(100% - calc(var(--clock-thickness) / 2));
    animation: spin infinite linear;
  }

  .clock-loader::before {
    height: var(--clock-minute-length);
    animation-duration: 2s;
  }

  .clock-loader::after {
    top: calc(var(--clock-radius) * 0.25 + var(--clock-hour-length));
    height: var(--clock-hour-length);
    animation-duration: 15s;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>