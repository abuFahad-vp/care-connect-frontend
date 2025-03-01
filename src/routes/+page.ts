import type { PageLoad } from './$types';
import { get_server_ip } from './user.svelte';
export const load: PageLoad = async () => {
     get_server_ip();
};
