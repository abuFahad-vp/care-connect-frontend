<script lang="ts">
  import { Button } from "flowbite-svelte";
  import parsePhoneNumberFromString from 'libphonenumber-js';
  import { get_server_ip, user_data } from "../../user.svelte";
  import LoadingSpinner from "../../LoadingSpinner.svelte";
  import LoadingButton from "../../LoadingButton.svelte";

  let showModal = $state(false);
  let isLocationLoading = $state(false);
  let isUpdateLoading = $state(false);
  let error_msg = $state("");
  let success_msg = $state("");
  let ping_timeout = $state(150);

  let formData = $state({
    full_name: '',
    email: '',
    contact_number: '',
    bio: '',
    location: '',
    profile_changed: '',
  });

  let profile_image: File | null = $state(null);

  // Function to get current location
  const getLocation = async (event: MouseEvent) => {
    event.preventDefault();
    isLocationLoading = true;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      formData.location = `${position.coords.latitude},${position.coords.longitude}`;
    } catch (error) {
      error_msg = `Location error: ${error as string}`;
    } finally {
      isLocationLoading = false;
    }
  }

  function validateLocation() {
    const regex = /^[-+]?\d{1,3}\.\d+,\s?[-+]?\d{1,3}\.\d+$/;
    if (formData.location && !regex.test(formData.location)) {
      error_msg = "Invalid location format";
      return false;
    }
    return true;
  }

  function validatePhone() {
    if (!formData.contact_number) return true;
    try {
      const parsedNumber = parsePhoneNumberFromString(formData.contact_number);
      if (!parsedNumber || !parsedNumber.isValid()) {
        error_msg = "Invalid contact number";
        return false;
      }
      return true;
    } catch (error) {
      error_msg = "Invalid contact number";
      return false;
    }
  }

  function validateForm() {
    error_msg = "";
    const isFormEmpty = Object.values(formData).every(value => value.trim() === '');
    if (isFormEmpty) { error_msg="Nothing to Update!!!"; return false };
    if (!validatePhone()) return false;
    if (!validateLocation()) return false;
    return true;
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    formData.profile_changed = "true";

    if (file) {
      if (file.type.startsWith("image/")) {
        if (file.size <= 500 * 1024) {
          profile_image = file;
          error_msg = "";
        } else {
          profile_image = null;
          error_msg = "Image size must be less than 500KB.";
        }
      } else {
        profile_image = null;
        error_msg = "Invalid file format. Only support image types.";
      }
    }
  }

  async function updateProfile() {
    if (!validateForm()) return;
    
    isUpdateLoading = true;
    error_msg = "";
    success_msg = "";

    if (user_data.serverIP === "") {
      let count = 0;
      while (user_data.serverIP === "" && count < 5) {
        await get_server_ip(ping_timeout);
        count += 1;
      }
    }

    if (user_data.serverIP === "") {
      isUpdateLoading = false;
      error_msg = "Failed to find the IP of server.";
      return;
    }

    try {
      const update_url = `http://${user_data.serverIP}:8000/user/update/${user_data.data.email}`;
      
      const formDataRequest = new FormData();
      
      // Only add fields that have values
      if (formData.full_name) formDataRequest.append("full_name", formData.full_name);
      if (formData.contact_number) formDataRequest.append("contact_number", formData.contact_number);
      if (formData.location) formDataRequest.append("location", formData.location);
      if (formData.bio) formDataRequest.append("bio", formData.bio);
      
      if (profile_image) {
        formDataRequest.append("profile_image", profile_image);
      }

      const response = await fetch(update_url, {
        method: "POST",
        body: formDataRequest,
      });

      if (response.ok) {
        const data = await response.json();
        success_msg = "Profile updated successfully!";
        await get_me();

        setTimeout(async () => {
          formData =  {
            full_name: '',
            email: '',
            contact_number: '',
            bio: '',
            location: '',
            profile_changed: '',
          } 
          showModal = false;
          success_msg = "";
        }, 2000);
      } else {
        const error = await response.json();
        if (error.detail !== undefined) {
          error_msg = `${error.detail}`;
        } else {
          error_msg = `Update failed: Invalid request to the server: ${update_url}`;
        }
      }
    } catch (error: any) {
      error_msg = `${error}: ${error.message}`; 
    } finally {
      isUpdateLoading = false;
    }
  }

  async function get_me() {
    try {
      let response = await fetch(`${user_data.serverURL}/user/me`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${user_data.sessionToken}`
          },
      });
      if (response.ok) {
        let data = await response.json();
        user_data.data = data;
      }
    } catch (e) {
      console.log("ERROR: ", e);
    }
  }

  function closeModal() {
    showModal = false;
    error_msg = "";
    success_msg = "";
  }
</script>

<main>
  <Button size="xs" color="alternative" onclick={() => showModal = true}>Update Profile</Button>
  
  {#if showModal}
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Update Profile</h3>
          <button class="close-button" onclick={closeModal}>&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input 
              type="text" 
              id="full_name" 
              name="full_name"
              bind:value={formData.full_name}
              placeholder="Enter your full name" 
            />
          </div>

          <div class="form-group">
            <label for="contact_number">Contact number with country code</label>
            <input 
              type="tel" 
              id="contact_number" 
              name="contact_number" 
              bind:value={formData.contact_number}
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group">
            <label for="location">Location (format: latitude,longitude)</label>
            <input
              type="text"
              id="location"
              bind:value={formData.location}
              name="location"
              placeholder="eg: 10.123,76.123"
            />
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
            />
            <small>Max size: 500KB. Supported formats: JPG, PNG</small>
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio" 
              name="bio" 
              bind:value={formData.bio}
              placeholder="Tell us about yourself" 
              rows="4"
            ></textarea>
          </div>
          
        </div>
        
        <div class="modal-footer">
          <div class="messages">
            {#if error_msg}
              <p class="error-msg">{error_msg}</p>
            {/if}
            
            {#if success_msg}
              <p class="success-msg">{success_msg}</p>
            {/if}
          </div>
          <Button color="alternative" onclick={closeModal} size="xs">Cancel</Button>
          <Button onclick={updateProfile} size="xs">
            {#if isUpdateLoading}
              <LoadingSpinner size="1rem" thickness_needle="0.1rem" thickness_outer="0.1rem" color="#ffffff"/>
            {:else}
              Update
            {/if}
          </Button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .modal {
    display: flex;
    justify-content: center;
    align-items: top;
    position: fixed;
    top: 0;
    left: 200%;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .close-button {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem;
    padding-bottom: 5rem;
    border-top: 1px solid #e5e7eb;
    position: sticky;
    bottom: 0;
    background-color: white;
    border-radius: 0 0 8px 8px;
    z-index: 10;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  label {
    font-weight: 500;
  }

  input[type="text"],
  input[type="tel"],
  textarea {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  small {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .get-location-button {
    align-self: flex-end;
  }

  .error-msg {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
  }

  .success-msg {
    color: green;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
  }

  @media (max-width: 640px) {
    .modal-content {
      width: 95%;
      max-height: 80vh;
    }
  }
</style>
