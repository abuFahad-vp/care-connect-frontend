//import { user_data } from '../../../user.svelte';
import type { PageServerLoad } from './$types';
import { chatData } from './chat_data.svelte';

export const ssr = false;

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const service_id = params.service_id;
    const partner_email = params.partner_email;
    const ip = params.ip;
    console.log("partner_email: ", partner_email, "service_id: ", service_id, "ip: ", ip);

    let response = await fetch(`http://${ip}:8000/admin/users/${partner_email}`);
    //let response = await fetch(`http://192.168.1.3:8000/admin/users/${partner_email}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch the partner_email with ${partner_email}`);
    }

    let partner_profile = await response.json();
    console.log("partner_profile: ", chatData.partner_profile.full_name);

    //chatData.partner_profile = partner_profile;
    //if (service_id !== null ) {
    //  chatData.service_id = service_id;
    //}

    return {
      service_id: service_id,
      partner_profile: partner_profile,
      ip: ip
    }
  } catch (error) {
    console.error('Fetch error: ', error);
  }
}
