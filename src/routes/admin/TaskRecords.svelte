<script lang="ts">
    import { onMount } from "svelte";
    import { user_data } from "../user.svelte";
    import { Tabs, TabItem } from 'flowbite-svelte';
    import TaskForm from "../TaskForm.svelte";
    import HealthDataCard from "../HealthDataCard.svelte";

    let forms = $state([] as any);
    let records = $state([] as any);

    let elders_records = $state({} as any);
    let volunteers_records = $state({} as any);

    let volunteers_forms = $state({} as any);
    let elders_forms = $state({} as any);

    async function getRecords() {
        const signup_url = `http://${user_data.serverIP}:8000/admin/get_weekend_records`;
        const response = await fetch(signup_url, { method: "GET"});
        if (response.ok) {
          let rawRecords = await response.json();
          
          // Filter forms based on institution match
          let filteredRecords = [];
          if (user_data.data.user_type === "elder") {
            for (const task of rawRecords) {
              if (task.user_email === user_data.data.email) {
                elders_records[task.id] = user_data.data;
                volunteers_records[task.id] = await getUser(task.volunteer_email);
                filteredRecords.push(task);
              }
            }
          } else if (user_data.data.user_type === "volunteer") {
            for (const task of rawRecords) {
              if (task.volunteer_email === user_data.data.email) {
                volunteers_records[task.id] = user_data.data;
                elders_records[task.id] = await getUser(task.user_email);
                filteredRecords.push(task);
              }
            }
          } else {
            for (const task of rawRecords) {
              if (task.volunteer_email !== undefined) {
                const volunteer = await getUser(task.volunteer_email);
                if (volunteer.institution === user_data.data.institution) {
                  volunteers_records[task.id] = await getUser(task.volunteer_email);
                  elders_records[task.id] = await getUser(task.user_email);
                  filteredRecords.push(task);
                }
              }
            }
          }
          records = filteredRecords;
          records.sort((a: any, b: any) => b.id - a.id);
          console.log($state.snapshot(forms));
        }
    }

    async function getTasks() {
        const signup_url = `http://${user_data.serverIP}:8000/admin/get_services`;
        const response = await fetch(signup_url, { method: "GET"});
        if (response.ok) {
          let rawForms = await response.json();
          
          // Process all forms
          let processedForms = rawForms.map((form: any) => {
            let tmp = JSON.parse(form.data)
            let realForm = tmp.service_form;
            realForm.status = tmp.status;
            realForm.elder_email = tmp.elder_email;
            realForm.volunteer_email = tmp.volunteer_email;
            realForm.created_at = tmp.created_at;
            return realForm;
          });
          
          // Filter forms based on institution match
          let filteredForms = [];
          if (user_data.data.user_type === "elder") {
            for (const task of processedForms) {
              if (task.elder_email === user_data.data.email) {
                elders_forms[task.service_id] = user_data.data;
                if (task.volunteer_email !== undefined) {
                  volunteers_forms[task.service_id] = await getUser(task.volunteer_email);
                }
                filteredForms.push(task);
              }
            }
          } else if (user_data.data.user_type === "volunteer") {
            for (const task of processedForms) {
              if (task.volunteer_email === user_data.data.email) {
                volunteers_forms[task.service_id] = user_data.data;
                elders_forms[task.service_id] = await getUser(task.elder_email);
                filteredForms.push(task);
              }
            }
          } else {
            for (const task of processedForms) {
              if (task.volunteer_email !== undefined) {
                const volunteer = await getUser(task.volunteer_email);
                if (volunteer.institution === user_data.data.institution) {
                  volunteers_forms[task.service_id] = await getUser(task.volunteer_email);
                  elders_forms[task.service_id] = await getUser(task.elder_email);
                  filteredForms.push(task);
                }
              }
            }
          }
          forms = filteredForms;

          // don't mind the error
          forms.sort((a: any, b: any) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
          });
          console.log($state.snapshot(forms));
        }
    }

    user_data.websocket.addListener(async (msg) => {
        if (msg.type === "Text") {
            const incomingData = JSON.parse(msg.data)
            console.log("INCOMING WEB SOCKET DATA: ", msg.data);
            if (incomingData.message === "task_updated") {
                try {
                    await getTasks();
                } catch (e: any) {
                    console.log("ERROR: ", e)
                }
            } else if (incomingData.message === "record_updated") {
                try {
                    await getRecords();
                } catch (e: any) {
                    console.log("ERROR: ", e)
                }
            }
        }
    })

    onMount(async () => {
      try {
        await getTasks();
        await getRecords();
      } catch (e) {
        console.log("ERROR: ", e)
      }
    });
    
    async function getUser(email: string) {
        try {
            let response = await fetch(`${user_data.serverURL}/admin/users/${email}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user_data.sessionToken}`
                },
            });
            if (response.ok) {
                let responseData = await response.json();
                return responseData;
            }
        } catch (e: any) {
            console.log("ERROR: ", e);
            return {}
        }
    }
</script>

<main class="main-container">
  <Tabs tabStyle="underline">
      <TabItem open title="Services">
        {#each forms as form (form.service_id)}
          <TaskForm taskForm={form} volunteer={volunteers_forms[form.service_id]} elder={elders_forms[form.service_id]}/>
        {/each}
      </TabItem>
    <TabItem title="Weekend Records">
        {#each records as record (record.id)}
          <HealthDataCard record={record} volunteer={volunteers_records[record.id]} elder={elders_records[record.id]} />
        {/each}
    </TabItem>
  </Tabs>
</main>

<style>
    .main-container {
        position: static;
        bottom: 20%;
        width: 100%;
        height: 100vh;
        overflow-y:auto;
        border: 1px solid #000;;
        border-width: 0px;
        border-color: black;
        touch-action: pan-y;
    }
</style>
