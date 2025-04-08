<script>
    import { Button } from "flowbite-svelte";
import { displayImage } from "./util.svelte";

    let {formData} = $props();
</script>

<div class="profile-container">
    <div class="profile-header">
        <img src={displayImage(formData.profile_image)} alt="ProfileImage" class="profile-image" />
        <h2>{formData.full_name}</h2>
        <p class="bio">{formData.bio}</p>
    </div>
    <div class="profile-details">
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>User Type:</strong> {formData.user_type}</p>
        {#if formData.user_type === "volunteer"}
          <p><strong>Institution:</strong> {formData.institution}</p>
          <p><strong>Institution Id:</strong> {formData.institution_id}</p>
        {/if}
        <p><strong>Age:</strong> {new Date().getFullYear() - 1 - formData.dob.slice(0,4)}</p>
        <p><strong>Date of Birth:</strong> {formData.dob}</p>
        <p><strong>Contact:</strong> {formData.contact_number}</p>
        <a target="_blank" href={`https://google.com/maps?q=${formData.location}`}><strong>Location:</strong>
            open in google map
        </a>
    </div>
</div>

<style>
    .profile-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: white;
        padding: 20px;
        border-radius: 10px;
        /* box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); */
        /* max-width: 400px; */
        text-align: center;
    }
    /* .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    } */
    a {
        color: blue;
        text-decoration: underline;
    }
    .profile-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .profile-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 10px;
    }
    .profile-header h2 {
        margin: 5px 0;
    }
    .bio {
        font-style: italic;
        color: #666;
    }
    .profile-details p {
        margin: 5px 0;
        font-size: 14px;
    }
</style>
