<script lang="ts">
    import Background from '../Background.svelte';
    import RecordsPage from "./records/RecordsPage.svelte";
    import ServicePage from "./services/ServicePage.svelte";
    import UserPage from "./user/UserPage.svelte";
    import Slider from "./Slider.svelte";
    import { pageData} from './page_state.svelte';
    
    const pages = [ServicePage, RecordsPage, UserPage];
</script>

<div class="app-container">
    <header class="header">
        <h1>CareConnect</h1>
        <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" version="1.1" xml:space="preserve">
            <path d="M4.234,6.266c-1.409,1.45 -2.202,3.415 -2.202,5.464c-0,2.05 0.793,4.015 2.202,5.464l9.625,9.899c0.568,0.584 1.339,0.91 2.143,0.91c0.803,0 1.575,-0.326 2.143,-0.91c1.743,-1.793 9.617,-9.907 9.617,-9.907c1.409,-1.449 2.202,-3.414 2.202,-5.464c0,-2.05 -0.793,-4.014 -2.202,-5.464c-0,0 -0,0 -0,0c-1.419,-1.459 -3.345,-2.277 -5.352,-2.277c-2.007,-0 -3.932,0.818 -5.351,2.277c-0,0 -1.065,1.095 -1.065,1.095c0,0 -1.057,-1.087 -1.057,-1.087c-1.419,-1.459 -3.344,-2.277 -5.351,-2.277c-2.007,0 -3.933,0.818 -5.352,2.277m1.434,1.395c1.039,-1.069 2.448,-1.672 3.918,-1.672c1.47,0 2.878,0.603 3.917,1.672c0,-0 1.774,1.824 1.774,1.824c0.188,0.193 0.447,0.303 0.717,0.303c0.27,-0 0.529,-0.11 0.717,-0.303l1.782,-1.833c1.039,-1.068 2.447,-1.671 3.917,-1.671c1.47,-0 2.878,0.603 3.918,1.671c0.003,0.004 0.006,0.007 0.01,0.011c1.039,1.069 1.626,2.533 1.626,4.059c0,1.526 -0.587,2.991 -1.636,4.07c-0,-0 -7.874,8.114 -9.617,9.907c-0.188,0.193 -0.443,0.304 -0.709,0.304c-0.266,0 -0.521,-0.111 -0.709,-0.304l-9.625,-9.899c-1.049,-1.079 -1.636,-2.544 -1.636,-4.07c-0,-1.526 0.587,-2.99 1.636,-4.069"/>
            <path d="M14.998,15.003l-1.997,-0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1l1.997,-0l-0,1.997c-0,0.552 0.448,1 1,1c0.552,-0 1,-0.448 1,-1l-0,-1.997l1.997,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-1.997,-0l-0,-1.997c-0,-0.552 -0.448,-1 -1,-1c-0.552,0 -1,0.448 -1,1l-0,1.997Z"/>
        </svg>
    </header>

    <Background z_index={1}/>

    <main class="main-content">
        <Slider {pages}/>
    </main>

    <div class="nav-div">
        <nav class="nav-bar">
            <button class="nav-button" onclick={(e) => {pageData.currentPageIndex = 0}} class:active={pageData.currentPageIndex === 0}>
                <svg class="nav-icon" viewBox="0 0 1024 1024">
                    <path d="M859.4 365.7c-8.9 0-17.5 1.3-25.7 3.7-32-148.2-164.1-259.7-321.7-259.7S222.2 221.2 190.3 369.4c-8.2-2.4-16.8-3.7-25.7-3.7-50.4 0-91.4 41-91.4 91.4v109.7c0 50.4 41 91.4 91.4 91.4s91.4-41 91.4-91.4V438.8c0-141.2 114.8-256 256-256s256 114.8 256 256v109.7c0 92.1-48.9 175.4-127.1 221-16.6-23.1-43.7-38.1-74.2-38.1H457c-50.4 0-91.4 41-91.4 91.4 0 50.4 41 91.4 91.4 91.4h109.7c42.9 0 79-29.8 88.8-69.7 81.6-39.6 141.8-109.7 169.2-193.1 10.7 4.4 22.4 6.8 34.7 6.8 50.4 0 91.4-41 91.4-91.4V457.1c0.1-50.4-41-91.4-91.4-91.4zM182.9 566.9c0 10.1-8.2 18.3-18.3 18.3s-18.3-8.2-18.3-18.3V457.1c0-10.1 8.2-18.3 18.3-18.3s18.3 8.2 18.3 18.3v109.8z m383.8 274.3H457c-10.1 0-18.3-8.2-18.3-18.3 0-10.1 8.2-18.3 18.3-18.3h109.7c10.1 0 18.3 8.2 18.3 18.3 0 10.1-8.2 18.3-18.3 18.3z m311-274.3c0 10.1-8.2 18.3-18.3 18.3s-18.3-8.2-18.3-18.3V457.2c0-10.1 8.2-18.3 18.3-18.3s18.3 8.2 18.3 18.3v109.7z"/>
                    <path d="M512 658.3c80.7 0 146.3-65.6 146.3-146.3h-73.1c0 40.3-32.8 73.1-73.1 73.1S439 552.3 439 512h-73.1c-0.2 80.7 65.4 146.3 146.1 146.3z"/>
                </svg>
                Services
            </button>
            <button class="nav-button" onclick={(e) => {pageData.currentPageIndex = 1}} class:active={pageData.currentPageIndex === 1}>
                <svg class="nav-icon" viewBox="0 0 32 32">
                    <path d="M25.912,5c-0,-0.796 -0.316,-1.559 -0.879,-2.121c-0.562,-0.563 -1.325,-0.879 -2.121,-0.879c-3.431,-0 -10.4,-0 -13.831,-0c-0.795,-0 -1.558,0.316 -2.121,0.879c-0.563,0.562 -0.879,1.325 -0.879,2.121l0,22c0,0.796 0.316,1.559 0.879,2.121c0.563,0.563 1.326,0.879 2.121,0.879c3.431,0 10.4,0 13.831,0c0.796,0 1.559,-0.316 2.121,-0.879c0.563,-0.562 0.879,-1.325 0.879,-2.121l-0,-22Zm-2,-0l-0,22c-0,0.265 -0.105,0.52 -0.293,0.707c-0.188,0.188 -0.442,0.293 -0.707,0.293l-13.831,-0c-0.265,0 -0.519,-0.105 -0.707,-0.293c-0.187,-0.187 -0.293,-0.442 -0.293,-0.707c0,-0 0,-22 0,-22c0,-0.265 0.106,-0.52 0.293,-0.707c0.188,-0.188 0.442,-0.293 0.707,-0.293l13.831,-0c0.265,-0 0.519,0.105 0.707,0.293c0.188,0.187 0.293,0.442 0.293,0.707Z"/>
                    <path d="M14.995,8l-0.998,0c-0.552,0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1l1.002,-0l0.002,1.002c0.001,0.552 0.45,0.999 1.002,0.998c0.552,-0.001 0.999,-0.45 0.998,-1.002l-0.002,-0.998l0.998,0c0.551,0 1,-0.448 1,-1c-0,-0.552 -0.449,-1 -1,-1l-1.002,0l-0.003,-1.002c-0.001,-0.552 -0.45,-0.999 -1.002,-0.998c-0.552,0.001 -0.999,0.45 -0.998,1.002l0.003,0.998Z"/>
                    <path d="M14.992,17l6.016,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-6.016,-0c-0.552,-0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>
                    <path d="M14.992,21l6.016,0c0.552,0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-6.016,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>
                    <path d="M14.985,24.994l6.015,-0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-6.015,-0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Z"/>
                    <circle cx="10.998" cy="15.958" r="1"/>
                    <circle cx="10.998" cy="19.976" r="1"/>
                    <circle cx="10.998" cy="23.994" r="1"/>
                </svg>
                Record
            </button>
            <button class="nav-button" onclick={(e) => {pageData.currentPageIndex = 2}} class:active={pageData.currentPageIndex === 2}>
                <svg class="nav-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
                </svg>
                User
            </button>
        </nav>
    </div>
</div>

<style>
    :global(*) {
        font-family: 'Inter';
        box-sizing: border-box;
        user-select: none;
        touch-action: manipulation;
    }

    .app-container {
        display: flex;
        flex-direction: column;
        background-color: #f5fdfc;
        height: 100%;
        width: 100%;
    }

    .header {
        display: flex;
        background: var(--primary-color);
        justify-content: left;
        align-items: center;
        gap: 2%;
        color: white;
        padding: 1rem;
        width: 100%;
        box-shadow: 0 2px 8px rgba(7, 84, 95, 0.2);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
    }

    .header h1 {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.8rem;
        font-weight: 600;
        letter-spacing: 0.5px;
    }

    .main-content {
        display: flex;
        flex: 1;
        padding: 5rem 1rem 4rem;
        z-index: 1;
        height: 100%;
        width: 100%;
    }

    .nav-div {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 10px rgba(7, 84, 95, 0.1);
        border-top: 2px solid #d1e8ec;
        z-index: 2;
    }

    .nav-bar {
        display: flex;
        justify-content: space-around;
        padding: 0.5rem 0;
    }

    .nav-bar button {
        display: inline-block;
        color: rgb(147, 179, 138);
        text-decoration: none;
        padding: 0.8rem 1.2rem;
        background-color: transparent;
        border-radius: 20px;
        border-width: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
        position: relative;
    }

    .nav-bar button.active {
        color: #035257;
        background-color: #f0f9fb;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    .nav-bar button.active::after {
        content: '';
        width: 4px;
        height: 4px;
        background-color: #3b9c91;
        border-radius: 50%;
        position: absolute;
        bottom: 5px;
    }

    /* .nav-bar button:hover {
        color: #4e9ed1;
        transform: translateY(-2px);
    } */

    .nav-icon {
        width: 24px;
        height: 24px;
        fill: currentColor;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        min-height: 100vh;
    }
</style>
