<script lang="ts">
    import { user_data, get_server_ip } from '../user.svelte';
    import { goto } from '$app/navigation';
    import LoadingButton from '../LoadingButton.svelte';
    import LoadingSpinner from '../LoadingSpinner.svelte';
    import { sleep } from '../user.svelte';
    import Navigation from '../navigation.svelte';
    import Background from '../Background.svelte';
    import parsePhoneNumberFromString from 'libphonenumber-js';
    import { onMount } from 'svelte';

    onMount(() => {

        const inputsAndTextareas = document.querySelectorAll('input, textarea');
        // const form = document.querySelector('form');

        inputsAndTextareas.forEach(element => {
            element.addEventListener('focus', () => {
                // Add temporary padding to the body to make space for the keyboard
                document.body.style.paddingBottom = '300px';

                setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300); // Delay for keyboard animation
            });

            element.addEventListener('blur', () => {
                // Remove the extra padding when the element loses focus
                document.body.style.paddingBottom = '0';
            });
        });
    });

    // let formData = $state({
    //     user_type: 'volunteer',
    //     full_name: 'v5',
    //     email: 'v5@v.com',
    //     password: 'vvvvvvvv',
    //     confirm_password: 'vvvvvvvv',
    //     dob: '01-01-2006',
    //     contact_number: '+919876543210',
    //     bio: 'nil',
    //     location: '',
    //     profile_image: new File([], ""),
    // });

    let formData = $state({
        user_type: 'volunteer',
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        dob: '',
        contact_number: '',
        bio: '',
        location: '',
        profile_image: new File([], ""),
    });

    let error_msg = $state("")
    let success_msg = $state("")
    let isLocationLoading = $state(false);
    let isSignupLoading = $state(false);

    const getLocation = async (event: MouseEvent) => {
        event.preventDefault();
        isLocationLoading = true;
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            formData.location = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (error) {
            error_msg = `location error: ${error as string}`;
        } finally {
            isLocationLoading = false;
        }
    }

    function validateForm() {
        if (formData.password.length < 8) {
            error_msg = "Password must be atleas 8 characters."
            return false
        }
        if (formData.password !== formData.confirm_password) {
            error_msg = "Passwords do not match."
            return false
        }
        if (!validateDOB()) { return false }
        if (!validatePhone()) { return false }
        if (!validateLocation()) { return false }
        if (formData.profile_image.size <= 0) {
            error_msg = "Must upload a profile picture";
            return false
        }
        error_msg = ""
        return true
    }
    function validateLocation() {
        const regex = /^[-+]?\d{1,3}\.\d+,\s?[-+]?\d{1,3}\.\d+$/;
        console.log(formData.location)
        if (!regex.test(formData.location)) {
            error_msg = "Invalid location format"
            return false;
        }
        return true
    }

    function validatePhone() {
        try {
            const parsedNumber = parsePhoneNumberFromString(formData.contact_number)
            error_msg = "Invalid contact number";
            return parsedNumber ? parsedNumber.isValid() : false;
        } catch (error) {
            return false;
        }
        // const regex = /^\+?\d{9,15}$/;
        // if (!regex.test(formData.contact_number)) {
        //     error_msg = "Invalid contact number"
        //     return false;
        // }
        // return true
    }

    function validateDOB() {
        const dob = new Date(formData.dob);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff == 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (formData.user_type === "volunteer") {
            if (age < 18 || age > 40) {
                error_msg = "Volunteer's age have to between 18 and 40"
                return false
            }
        } else {
            if (age < 50 || age > 120) {
                error_msg = "Elder's age have to between 50 and 120"
                return false
            }
        }
        return true
    }

    async function onsubmit(event: SubmitEvent) {
        isSignupLoading = true;
        if (user_data.serverIP === "" && user_data.searchingIP === false) {
            let serverIP = await get_server_ip();
            if (!serverIP) {
                isSignupLoading = false;
                error_msg = "Failed to find the IP of server.";
                return
            }
        }
        if (validateForm()) {
            const signup_url = `${user_data.serverURL}/signup`;
            try {
                const formDataRequest = new FormData(event.target as HTMLFormElement);
                const response = await fetch(signup_url, {
                // const response = await fetch(`http://localhost:1420/signup`, {
                    method: "POST",
                    body: formDataRequest
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("Signup successfull:", data);
                    error_msg = "";
                    success_msg = "Registration successful. redirecting to login";
                    await sleep(1000);
                    goto('/')
                } else {
                    const error = await response.json();
                    if (error.detail !== undefined) {
                        error_msg = `${error.detail}`;
                        // error_msg = `2: ${error.detail}: ${signup_url}`;
                    } else {
                        error_msg = `Signup failed: Invalid request to the server: ${signup_url}`;
                    }
                    console.error("Signup failed:", error.detail);
                }
            } catch (error: any) {
                error_msg = `${error}: ${error.message}: ${signup_url}`;
                console.error("Error during login:", error.message);
            } finally {
                isSignupLoading = false;
            }
        } else {
            isSignupLoading = false;
        }
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : null;
        if (file) {
            if (file.type.startsWith("image/")) {
                if (file.size <= 500 * 1024 ) {
                    formData.profile_image = file;
                    error_msg = "";
                } else {
                    formData.profile_image = new File([], "") ,
                    error_msg = "Image size must be less than 500KB."
                }
            } else {
                formData.profile_image = new File([], "") ,
                error_msg = "Invalid file format. only support image types."
            }
        }
    }
</script>

<main>
    <Background z_index={-1}/>
    <Navigation/>
    <div class="background1"></div>
    <div class="background2"></div>
        <a href="/" class="back-link">←</a>
        <form class="signup-form" {onsubmit}>
            <div class="form-group">
                <label for="">User Type</label>
                <div class="radio-group">
                    <div class="radio-option">
                        <input 
                            type="radio" 
                            bind:group={formData.user_type} 
                            value="volunteer" 
                            id="volunteer" 
                            name="user_type"
                            required
                        >
                        <label for="volunteer">Volunteer</label>
                    </div>
                    <div class="radio-option">
                        <input 
                            type="radio" 
                            bind:group={formData.user_type} 
                            value="elder" 
                            id="elder"
                            name="user_type"
                        >
                        <label for="elder">Elder</label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="full_name">Full Name</label>
                <input 
                    type="text" 
                    id="full_name" 
                    name="full_name"
                    bind:value={formData.full_name}
                    placeholder="Enter your full name" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email"
                    bind:value={formData.email}
                    placeholder="Enter your email address" 
                    required
                >
            </div>
            <div class="form-group">
                <label for="password">Password (atleast 8 characters.)</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password"
                    bind:value={formData.password}
                    placeholder="Enter your password" 
                    required
                >
            </div>
            <div class="form-group">
                <label for="confirm_password">Confirm Password</label>
                <input 
                    type="password" 
                    id="confirm_password" 
                    name="confirm_password" 
                    bind:value={formData.confirm_password}
                    placeholder="Confirm your password" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="dob">Date of Birth</label>
                <input 
                    type="date" 
                    id="dob" 
                    name="dob" 
                    bind:value={formData.dob}
                    required
                >
            </div>

            <div class="form-group">
                <label for="contact_number">Contact number with country code</label>
                <input 
                    type="tel" 
                    id="contact_number" 
                    name="contact_number" 
                    bind:value={formData.contact_number}
                    placeholder="Enter your phone number"
                    required
                >
            </div>
            <div class="form-group">
                <label for="location">Location (format: latitude,longitude)</label>
                <input
                    type="text"
                    id="location"
                    bind:value={formData.location}
                    name="location"
                    placeholder="eg: 10.123,76.123"
                    required
                >
                <div class="get-location-button">
                    <LoadingButton type="button" isLoading={isLocationLoading} onclick={getLocation} content="Get current location"/>
                </div>
            </div>
            <div class="form-group">
                <label for="profile_image">Profile Image</label>
                <input 
                    type="file" 
                    id="profile_image" 
                    name="profile_image" 
                    onchange={handleFileChange}
                    accept="image/*"
                    required
                >
            </div>
            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea 
                    id="bio" 
                    name="bio" 
                    bind:value={formData.bio}
                    placeholder="Tell us about yourself" 
                    rows="5"
                    required
                ></textarea>
            </div>
            <div class="form-group">
                <p class="error-msg" style="color: red;">{error_msg}</p>
            </div>
            {#if success_msg !== ""}
                <p class="success-msg" style="color: green;">{success_msg}</p>
            {/if}
            <button class="submit-button" type="submit">
            {#if isSignupLoading}
                <LoadingSpinner size="1rem" thickness_needle="0.1rem" thickness_outer="0.1rem" color="#ffffff"/>
            {:else}
                Sign Up
            {/if}
            </button>
        </form>
</main>

<style>
    :global(*) {
        font-family: 'Inter';
    }

    .signup-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-width: 600px;
        margin: 2rem auto;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .radio-group {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .radio-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="date"],
    input[type="tel"],
    textarea {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    button {
        background: #0066cc;
        color: white;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }

    button:hover {
        background: #0052a3;
    }

    .back-link {
        margin: 5%;
        display: inline-block;
        padding: 0.5rem 1rem;
        background-color: var(--primary-color, #007BFF); /* Use your primary color */
        color: white;
        text-decoration: none;
        font-size: 1rem;
        font-weight: bold;
        border: none;
        border-radius: 5px;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .back-link:hover {
        background-color: var(--primary-hover-color, #0056b3); /* Adjust for hover */
    }

    .back-link:active {
        background-color: var(--primary-active-color, #003f7f); /* Adjust for active */
    }

    label {
        font-weight: 500;
    }

    .get-location-button {
        background-color: var(--primary-color);
        align-self: self-end;
        border-radius: 4rem;
    }

    .submit-button {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        height: 3rem;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        background-color: var(--primary-color);
        color: white;
        cursor: pointer;
    }

    .error-msg {
        color: red;
        border: none;
        align-self: center;
        margin: 0 0;
        height: auto;
        font-weight: 700;
    }
    .success-msg {
        color: green;
        border: none;
        align-self: center;
        margin: 0 0;
        height: auto;
        font-weight: 700;
    }
</style>