 import { goto } from '$app/navigation';
import type { PageServerLoad } from './$types';
// import { get_server_ip, login, user_data} from './user.svelte';
// import { user_data } from './user.svelte';
// import { create, readTextFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';

export const load: PageServerLoad = async ({ fetch, params }) => {
    // console.log("Initial data loading...")
    // get_server_ip();
    // user_data.serverIP = "192.168.1.8";
    // await login("v1@v.com", "vvvvvvvv", "/home", fetch);
   //const service_id = "456-789";
   //const partner_email = "v1@v.com";
   //goto(`/chat/${service_id}/${partner_email}`);

    // let isDataFileExist = await exists('data.txt', { baseDir: BaseDirectory.AppData});
    // if (isDataFileExist) {
    //     const userDataTxt = await readTextFile('data.txt', { baseDir: BaseDirectory.AppData});
    //     const data = JSON.parse(userDataTxt)
    //     user_data.data = data;
    //     if (user_data.data.email !== undefined && user_data.data.password !== undefined) {
    //         let username = user_data.data.email;
    //         let password = user_data.data.password;
    //         if (response?.result) {
    //             console.log("Login successfull. redirecting to home page...")
    //         }
    //     }
    // }
};
