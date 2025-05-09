<script lang="ts">
    import { onMount } from 'svelte';
    import Background from './Background.svelte';
    import Navigation from './navigation.svelte';
    import { get_server_ip, login, user_data } from './user.svelte';

    let showPassword = $state(false);
    let error_msg = $state("");
    let isLoading = $state(false);
    let showIPInput = $state(false);
    let ping_timeout = $state(150);
    let institutions = $state({})

    const togglePasswordVisibility = () => {
      showPassword = !showPassword;
    };

    async function onsubmit(e: SubmitEvent) {
      isLoading = true;
      error_msg = "";
      const formData = new FormData(e.target as HTMLFormElement);
      let username = formData.get("username") as string;
      let password = formData.get("password") as string;

      let redirect = "";

      try {
        if (user_data.serverIP == "") {
          await get_server_ip();
        }
        const signup_url = `http://${user_data.serverIP}:8000/user/get_institutions`;
        const response = await fetch(signup_url, { method: "GET"});

        if (response.ok) {
          const data = await response.json();
          institutions = data;
          console.log(institutions);
        }
      } catch (e) {
        console.log("ERROR: ", e)
      }

      for (let email in institutions) {
        if (username === email) {
          redirect = "/admin"
          break
        } else {
          redirect = "/home"
        }
      }

      const response = await login(username, password, redirect, ping_timeout);
      if (response?.result) {
        console.log("Successfully logged");
        return
      }
      error_msg = response?.error_msg as string;
      isLoading = false;
  }
</script>

<main>
  <Background z_index={-1}/>
  <Navigation/>
  <div class="background1"></div>
  <div class="background2"></div>
  <div class="banner">
  {#if showIPInput}
  <lable for="my_ip">Your IP: </lable>
  <input id="my_ip" type="text" bind:value={user_data.myIP}>
  <lable for="server_ip">Server IP: </lable>
  <input id="server_ip" type="text" bind:value={user_data.serverIP}>
  <lable for="ping_timeout">Ping timout: </lable>
  <input id="ping_timeout" type="number" bind:value={ping_timeout}>
  <button onclick={() => showIPInput = false}>close</button>
  {:else}
  <button onclick={() => showIPInput = true}>.</button>
  {/if}
    <img src="/images/care-connect-logo.png" class="logo" alt="CareConnect Logo" />
    <h1 class="title">Welcome to CareConnect!</h1>
  </div>
  <form class="login-form" {onsubmit}>
    <input type="email" name="username" class="email-input form-element input-box" placeholder="Email address" required />
    <div class="password-container">
      <input
        type={showPassword ? "text" : "password"}
        class="password-input form-element input-box"
        name="password"
        placeholder="Password"
        required
      />
      <button
        class="password-toggle-icon"
        onclick={(event) => {
          event.preventDefault();
          togglePasswordVisibility();
        }}
        title={showPassword ? "Hide Password" : "Show Password"}
      aria-label="eye">
      </button>
    </div>
    {#if error_msg != ""}
      <p class="error-msg">{error_msg}</p>
    {/if}
    <button type="submit" class="login-button form-element">
      {#if isLoading}
        <div class="clock-loader"></div>
      {:else}
        Login
      {/if}
    </button>
    <a class="signup-button" href="/signup">New User? Signup</a>
  </form>
</main>

<style>
  :global(*) {
    font-family: 'Inter';
    user-select: none;
  }

  .title {
    font-family: 'Inter';
    font-weight: 900;
  }

  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 95vh;
    box-sizing: border-box;
    overflow: hidden;
  }

  .logo {
    width: 100px;
    height: 100px;
    background-image: var(--logo);
    background-size: contain;
    background-repeat: no-repeat;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    width: 90%;
    gap: 0.5rem;
  }

  .form-element {
    border-radius: 0.8rem;
    border-width: 0.005rem;
    border: 1px solid var(--border-color);
    box-shadow: none;
    outline: none;
    height: 3rem;
  }

  .input-box {
    padding-left: 10%;
  }

  .password-container {
    display: flex;
    align-items: center;
    position: relative;
  }

  .password-input {
    width: 100%;
    padding-right: 2.5rem;
  }

  .password-toggle-icon {
    position: absolute;
    background: none;
    right: 1rem;
    cursor: pointer;
    width: 15px;
    height: 15px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    user-select: none;
    background-image: url("/images/eye-icon.png");
  }

  .password-toggle-icon:active,
  .password-toggle-icon[title="Hide Password"] {
    background-image: url("/images/eye-slash-icon.png");
  }

  .login-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;
    background-color: var(--primary-color);
    border: none;
    color: white;
    font-weight: 600;
  }

  .clock-loader {
    --clock-color: white;
    --clock-width: 1rem;
    --clock-radius: calc(var(--clock-width) / 2);
    --clock-minute-length: calc(var(--clock-width) * 0.4);
    --clock-hour-length: calc(var(--clock-width) * 0.2);
    --clock-thickness: 0.1rem;

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--clock-width);
    height: var(--clock-width);
    border: 2px solid var(--clock-color);
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

  .signup-button {
    background: none;
    border: none;
    text-decoration: underline;
    font-size: small;
    font-weight: 900;
    align-self: center;
    margin-top: 2%;
  }

  .error-msg {
    color: red;
    border: none;
    align-self: center;
    margin: 0 0;
    height: auto;
    font-weight: 700;
  }

  .banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
  }
</style>
