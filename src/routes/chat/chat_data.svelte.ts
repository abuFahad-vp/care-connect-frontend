export let chatData = $state<ChatData>({
  partner_profile: {
    full_name: "",
    email: "",
    profile_image: "",
  },
  service_id: "",
  ip: "",
})

export interface PartnerProfile {
  full_name: string;
  email: string;
  profile_image: string;
}

export interface ChatData {
  partner_profile: PartnerProfile;
  service_id: string
  ip: string
}
