import { Input, SessionData } from "../../../session-types";

export const issueStatusGenerator = async (
  existingPayload: any,
  sessionData: SessionData,
  inputs?: Input
) => {
  // console.log("existingPayload", JSON.stringify(existingPayload));
  const newDate = existingPayload.context.timestamp;
  existingPayload.message.issue.id =
    sessionData.latest_issue_payload?.id || "ISSUE-1";
  existingPayload.message.issue.created_at =
    sessionData.latest_issue_payload?.created_at || newDate;
  existingPayload.message.issue.updated_at = newDate;
  existingPayload.message.issue.expected_response_time = sessionData
    .latest_issue_payload?.expected_response_time || { duration: "PT2H" };
  existingPayload.message.issue.expected_resolution_time = sessionData
    .latest_issue_payload?.expected_resolution_time || { duration: "P1D" };
  // (existingPayload.message.issue.actors.info.contact ??= {}).email ??= "sim@yahoo.com";

  const provider = sessionData.provider_id;
  const item = sessionData?.selected_items[0]?.id;
  const order = sessionData?.order_id;
  const fulfillment = sessionData?.fulfillments[0]?.id;
  const refs = [
    {
      ref_id: order ?? "O1",
      ref_type: "ORDER",
    },
    {
      ref_id: provider ?? "P1",
      ref_type: "PROVIDER",
    },
    {
      ref_id: fulfillment ?? "F1",
      ref_type: "FULFILLMENT",
    },
    {
      ref_id: item ?? "I1",
      ref_type: "ITEM",
      tags: [
        {
          descriptor: {
            code: "message.order.items",
          },
          list: [
            {
              descriptor: {
                code: "quantity.selected.count",
              },
              value: "1",
            },
          ],
        },
      ],
    },
  ];
  existingPayload.message.issue.refs =
    sessionData.latest_issue_payload?.refs || refs;
  existingPayload.message.issue.actors =
    sessionData.latest_issue_payload?.actors ||
    existingPayload.message.issue.actors;
  existingPayload.message.issue.source_id =
    sessionData.latest_issue_payload?.source_id ||
    existingPayload.message.issue.source_id;
  existingPayload.message.issue.complainant_id =
    sessionData.latest_issue_payload?.complainant_id || "NP1";
  existingPayload.message.issue.descriptor.code =
    sessionData.latest_issue_payload?.descriptor?.code || "ITM004";
  existingPayload.message.issue.descriptor.short_desc =
    sessionData.latest_issue_payload?.descriptor?.short_desc ||
    "Issue with product quality";
  existingPayload.message.issue.descriptor.long_desc =
    sessionData.latest_issue_payload?.descriptor?.long_desc ||
    "Product quality is not correct. facing issues while using the product";
  existingPayload.message.issue.descriptor.additional_desc.url =
    sessionData.latest_issue_payload?.additional_desc?.url ||
    "https://example.com/issue-details";
  existingPayload.message.issue.descriptor.additional_desc.content_type =
    sessionData.latest_issue_payload?.additional_desc?.content_type ||
    "text/html";
  existingPayload.message.issue.descriptor.images.url =
    sessionData.latest_issue_payload?.descriptor?.image?.url ||
    "https://example.com/image.jpg";
  sessionData.latest_issue_payload?.descriptor?.images || [
    {
      url: "https://example.com/image.jpg",
      size_type: "2MB",
    },
  ];
  existingPayload.message.issue.descriptor.media.url =
    sessionData.latest_issue_payload?.descriptor?.media?.url ||
    "https://example.com/media.mp4";
  // existingPayload.message.issue.last_action_id =
  //   sessionData.last_action || "on_status";

  // Update status and descriptors
  existingPayload.message.issue.status = sessionData.status || "OPEN";
  switch (sessionData.igm_action) {
    case "issue_open":
      const lastActionId = crypto.randomUUID();
      existingPayload.message.issue.status = "OPEN";
      existingPayload.message.issue.descriptor.short_desc =
        "Issue with product quality";
      (existingPayload.message.issue.actions = [
        {
          id: lastActionId,
          descriptor: {
            code: "OPEN",
            short_desc: "Complaint created",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ]),
        (existingPayload.message.issue.last_action_id = lastActionId ?? "A1");
      break;

    case "issue_escalate":
      existingPayload.message.issue.status = "PROCESSING";
      existingPayload.message.issue.level = "GREVIENCE";
      existingPayload.message.issue.descriptor.short_desc =
        "Issue with product quality";
      existingPayload.message.issue.actions = [
        ...sessionData?.issue_action,
        {
          id: crypto.randomUUID(),
          descriptor: {
            code: "ESCALATED",
            short_desc: "Complaint Escalated",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ];
      existingPayload.message.issue.last_action_id =
        existingPayload.message.issue.actions[
          existingPayload.message.issue.actions.length - 1
        ]?.id ?? "A1";
      break;

    case "issue_open_2":
      const lastActionId2 = crypto.randomUUID();
      existingPayload.message.issue.descriptor.code = "PMT002";
      existingPayload.message.issue.status = "OPEN";
      existingPayload.message.issue.descriptor.short_desc =
        "The actual payout made is less than expected";
      // existingPayload.message.issue.last_action_id =
      //   sessionData.last_actions_id[sessionData.last_actions_id - 1]?.id ||
      //   "A1";
      existingPayload.message.issue.actions = [
        {
          id: lastActionId2,
          descriptor: {
            code: "OPEN",
            short_desc: "Complaint created",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ];

      existingPayload.message.issue.last_action_id = lastActionId2 ?? "A1";
      break;

    case "issue_info_provided":
      existingPayload.message.issue.status = "PROCESSING";
      existingPayload.message.issue.level = sessionData?.issue_level ?? "OPEN";
      // existingPayload.message.issue.last_action_id =
      //   sessionData.last_actions_id[sessionData.last_actions_id - 1]?.id ||
      //   "A4";
      existingPayload.message.issue.actions = [
        ...sessionData?.issue_action,
        {
          id: crypto.randomUUID(),
          ref_id:
            sessionData?.issue_action[sessionData?.issue_action.length - 1]
              ?.id || "A3",
          descriptor: {
            code: "INFO_PROVIDED",
            short_desc: "Info provided from buyer app",
            images: [
              {
                url: "http://buyerapp.com/addtional-details/img1.png",
                size_type: "xs",
              },
              {
                url: "http://buyerapp.com/addtional-details/img2.png",
                size_type: "xs",
              },
            ],
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ];
      existingPayload.message.issue.last_action_id =
        existingPayload.message.issue.actions[
          existingPayload.message.issue.actions.length - 1
        ]?.id ?? "A1";
      break;

    case "issue_resolution_accept":
    case "issue_resolution_accept_igm_3":
      existingPayload.message.issue.status = "PROCESSING";
      existingPayload.message.issue.level = sessionData?.issue_level ?? "OPEN";
      existingPayload.message.issue.actions = [
        ...sessionData?.issue_action,
        {
          id: crypto.randomUUID(),
          ref_id: "R2",
          ref_type: "RESOLUTIONS",
          descriptor: {
            code: "RESOLUTION_ACCEPTED",
            short_desc: "Resolution is accepted",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ];
      existingPayload.message.issue.last_action_id =
        existingPayload.message.issue.actions[
          existingPayload.message.issue.actions.length - 1
        ]?.id ?? "A1";
      existingPayload.message.issue.resolutions = sessionData.issue_resolution;
      const resolution_accept = inputs?.resolution_accept || "R2-Replacement";
      const refId = resolution_accept.split("-");
      let actions = existingPayload.message.issue.actions;
      actions[actions.length - 1].ref_id = refId[0];

      if (sessionData.igm_action === "issue_resolution_accept_igm_3") {
        existingPayload.message.issue.resolutions =
          sessionData?.issue_resolution ?? "";
      }

      break;

    case "issue_resolution_reject":
      existingPayload.message.issue.status = "PROCESSING";
      existingPayload.message.issue.actions = [
        ...sessionData?.issue_action,
        {
          id: crypto.randomUUID(),
          ref_id: "R2",
          ref_type: "RESOLUTIONS",
          descriptor: {
            code: "RESOLUTION_REJECTED",
            short_desc: "Resolution is rejected",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
        },
      ];
      existingPayload.message.issue.level = sessionData?.issue_level ?? "OPEN";
      existingPayload.message.issue.last_action_id =
        existingPayload.message.issue.actions[
          existingPayload.message.issue.actions.length - 1
        ]?.id ?? "A1";
      existingPayload.message.issue.resolutions = sessionData.issue_resolution;
      const resolution_accepts = inputs?.resolution_accept || "R2-Replacement";
      const refIds = resolution_accepts.split("-");
      let actionss = existingPayload.message.issue.actions;
      actionss[actionss.length - 1].ref_id = refIds[0];
      break;

    case "issue_close":
    case "issue_close_igm_3":
      existingPayload.message.issue.status = "CLOSED";
      existingPayload.message.issue.level = sessionData?.issue_level ?? "OPEN";
      existingPayload.message.issue.actions = [
        ...sessionData?.issue_action,
        {
          id: crypto.randomUUID(),
          descriptor: {
            code: "CLOSED",
            short_desc: "Closing the complaint",
          },
          updated_at: newDate,
          action_by: "NP1",
          actor_details: {
            name: "mock-person",
          },
          tags: [
            {
              descriptor: {
                code: "CLOSURE_DETAILS",
              },
              list: [
                {
                  descriptor: {
                    code: "RATING",
                  },
                  value: inputs?.rating || "THUMBS_UP",
                },
              ],
            },
          ],
        },
      ];
      existingPayload.message.issue.last_action_id =
        existingPayload.message.issue.actions[
          existingPayload.message.issue.actions.length - 1
        ]?.id ?? "A1";
      existingPayload.message.issue.resolutions = sessionData.issue_resolution;

      if (sessionData.igm_action === "issue_close_igm_3") {
        existingPayload.message.issue.resolutions =
          sessionData?.issue_resolution ?? "";
      }

      break;

      // case "issue_close_thumbs_Down":
      //   existingPayload.message.issue.status = "CLOSED";
      //   existingPayload.message.issue.actions = getActionsList(
      //     {
      //       id: "A9",
      //       descriptor: {
      //         code: "CLOSED",
      //         short_desc: "Closing the complaint",
      //       },
      //       updated_at: "2025-11-04T11:52:58.092Z",
      //       action_by: "NP1",
      //       actor_details: {
      //         name: "mock-person",
      //       },
      //       tags: [
      //         {
      //           descriptor: {
      //             code: "CLOSURE_DETAILS",
      //           },
      //           list: [
      //             {
      //               descriptor: {
      //                 code: "RATING",
      //               },
      //               value: "THUMBS_DOWN",
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     newDate,
      //     "issue_close"
      //   );
      existingPayload.message.issue.last_action_id =
        existingPayload?.message?.issue?.actions[
          existingPayload?.message?.issue?.actions?.length - 1
        ]?.id ?? "A22";
      existingPayload.message.issue.resolutions = sessionData.issue_resolution;
      break;

    default:
      break;
  }
  // let actions = existingPayload.message.issue.actions;
  // actions[actions.length - 1].updated_at = newDate;

  // const updatedAction = actions[actions.length - 1];
  // // console.log("sessionData.issue_action", sessionData.issue_action);
  // if (sessionData.issue_action.length > 0) {
  //   // console.log("sessionData.issue_action", sessionData.issue_action);
  //   let sessionDataActions = sessionData.issue_action;
  //   sessionDataActions.push(updatedAction);
  //   existingPayload.message.issue.actions = sessionDataActions;
  // }

  // const { start, end } = sessionData.fulfillments[0];

  // const extractedFulfillmentData = {
  //   start: {
  //     person: { name: start?.location?.descriptor?.name || "Mock Buyer" },
  //     contact: start.contact || {
  //       phone: "9450394039",
  //       email: "buyer@gmail.com",
  //     },
  //   },
  //   end: {
  //     person: end?.person || { name: "Mock Consumer" },
  //     contact: end?.contact || {
  //       phone: "9879879870",
  //       email: "consumer@gmail.com",
  //     },
  //   },
  // };
  const extractedFulfillmentData = {
    start: {
      person: { name: "Mock Buyer" },
      contact: {
        phone: "9450394039",
        email: "buyer@gmail.com",
      },
    },
    end: {
      person: { name: "Mock Consumer" },
      contact: {
        phone: "9879879870",
        email: "consumer@gmail.com",
      },
    },
  };

  existingPayload.message.issue.actors.forEach((actor: any) => {
    actor.info.org.name = `${existingPayload.context.bap_id}::${existingPayload.context.domain}`;
    switch (actor.type) {
      case "CONSUMER":
        actor.info.person = extractedFulfillmentData.end.person;
        actor.info.contact = {
          ...actor.info.contact,
          ...extractedFulfillmentData.end.contact,
        };
        break;
      case "INTERFACING_NP":
        actor.info.person = extractedFulfillmentData.start.person;
        actor.info.contact = {
          ...actor.info.contact,
          ...extractedFulfillmentData.end.contact,
        };
      default:
        break;
    }
  });

  return existingPayload;
};
