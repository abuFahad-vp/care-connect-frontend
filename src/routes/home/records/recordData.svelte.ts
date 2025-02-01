import { user_data } from "../../user.svelte";

export let record_contract = $state({
    partner_profile: undefined as any,
    is_assigned: false,
    is_requesting: false,
})

export async function unassign() {

    record_contract.is_assigned = false;
    record_contract.is_requesting = false;

    try {
        await fetch(`${user_data.serverURL}/user/unassign`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${user_data.sessionToken}`
            }
        })
    } catch (e: any) {
        console.log(e)
    }
}
export async function getPartner() {
    try {
        let response = await fetch(`${user_data.serverURL}/user/know_your_partner`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user_data.sessionToken}`
            },
        });
        if (response.ok) {
            let responseData = await response.json() as any;
            record_contract.is_assigned = true;
            record_contract.partner_profile = responseData.partner;
        }
    } catch (e: any) {
        console.log(e)
    }
}