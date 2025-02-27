<script lang="ts">
    import { user_data } from "../../../user.svelte";
    import { pageData } from "../../page_state.svelte";
    import { formatMilliseconds, getTimeDifference, parseDate } from "../../util.svelte";
    import ServiceRequestCard from "../ServiceRequestCard.svelte";

    // function onclick_accept(email: string, service_id: string) {
    //     const jsonResponse = {
    //        type: "service_message",
    //        status: "accepted",
    //        service_id: service_id,
    //        message: "request_accepted"
    //     }
    //     user_data.websocket.send(JSON.stringify(jsonResponse))
    //     console.log("Response successfully sented.")
    // }

    // function onclick_reject(email: string, service_id: string) {
    //     console.log("Rejected")
    //     const decision = `new_service_request:reject:${email}:${service_id}`
    //     const jsonResponse = {
    //         type: decision
    //     }
    //     user_data.websocket.send(JSON.stringify(jsonResponse))
    //     console.log("Response successfully sented.")
    // }

    try {
      user_data.websocket.addListener((msg) => {
          // console.log("New Web Socket Msg: ", msg);
          if (msg.type == "Text") {
              const incomingData = JSON.parse(msg.data)
              if (incomingData.type === "new_service_request") {
                  console.log(incomingData);
                  incomingData.service_form.status = "pending";

                  incomingData.service_form.time_period_from = incomingData.service_form.time_period_from.replace(" ", "T");
                  incomingData.service_form.time_period_to = incomingData.service_form.time_period_to.replace(" ", "T");

                  incomingData.expanded = false;
                  pageData.serviceRequestsArray.push(incomingData);
              }

              if (incomingData.type === "service_message") {
                  console.log(incomingData);
                  pageData.serviceRequestsArray.forEach((request) => {
                      if (request.service_form.service_id === incomingData.service_id) {
                          request.service_form.status = incomingData.status;
                      }
                  })

                  if (incomingData.status == "accepted" && incomingData.message == "elder_request_accepted") {
                      pageData.serviceRequestsArray.forEach(request => {
                          if (request.service_form.service_id === incomingData.service_id) {

                              // console.log("HERRE", request.service_form);

                              if (getTimeDifference(request.service_form.time_period_to) < 0) {
                                  request.service_form.status = "cancelled";
                                  return
                              }

                              request.elder_accepted = true;
                              request.isTaskStarted = false;
                              request.progress = 0;
                              request.remainingTime = getTimeDifference(request.service_form.time_period_to);
                              request.timeExceeded = false;
                              // request.startTimeRemaining = 0;

                              console.log("remaining time", request.remainingTime)
                              // startTime();
                              let progressSize = 0;

                              setInterval(() => {
                                  if (!request.isTaskStarted && parseDate(request.service_form.time_period_from).getTime() < new Date().getTime()) {
                                      request.isTaskStarted = true;
                                      request.remainingTime = getTimeDifference(request.service_form.time_period_to);
                                      progressSize = 100 * 1000 / request.remainingTime;
                                  }

                                  if (!request.isTaskStarted) {
                                      request.startTimeRemaining = formatMilliseconds(
                                          parseDate(request.service_form.time_period_from).getTime() - new Date().getTime())
                                  }

                                  if (request.isTaskStarted) {
                                      if (request.remainingTime > 0 && request.timeExceeded === false) {
                                          request.remainingTime -= 1000;
                                          request.progress += progressSize;
                                          // console.log("progress: ", request.progress)
                                      } else {
                                          request.remainingTime += 1000;
                                          request.timeExceeded = true;
                                      }
                                  }
                              }, 1000);
                          }
                      })
                  }
              }
          }
      });
    } catch (error) {
      console.log("ERROR: ",error)
    }

    function getTimeDifferenceInSeconds(timestamp: string) {
        const parsedDate = new Date(timestamp);

        const currentDate = new Date();

        const differenceMs = parsedDate.getTime() - currentDate.getTime();
        const differenceSeconds = Math.floor(differenceMs / 1000);

        return differenceSeconds;
    }
</script>

<main class="main-container">
    {#if pageData.serviceRequestsArray.length === 0}
        <div class="no-service-label">
            <h4>No service request yet.</h4>
        </div>
    {:else}
        <div class="request-card">
            {#each pageData.serviceRequestsArray.toReversed() as request, id (request.service_id)}
                {#if request.expanded || pageData.serviceRequestsArray.every(request => !request.expanded)}
                    {#if getTimeDifferenceInSeconds(request.timeout) > 0}
                        <ServiceRequestCard 
                            requestForm={request}
                            {id}
                        />
                    {/if}
                {/if}
            {/each}
        </div>
    {/if}
</main>

<style>
    .main-container {
        position: static;
        bottom: 20%;
        width: 100%;
        height: 82vh;
        overflow-y: auto;
        border: 1px solid #000;
        border-width: 0px;
        border-color: black;
    }

    .main-container::-webkit-scrollbar {
        width: 0px;
    }

    @media (max-height: 700px) {
        .main-container {
            height: 73vh;
        }
    }

    .request-card {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .no-service-label {
        position: absolute;
        top: 45%;
        left: 20%;
        opacity: 0.5;
        z-index: 0;
    }
</style>
