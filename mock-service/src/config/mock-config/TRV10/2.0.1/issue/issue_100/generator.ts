import { Input, SessionData } from "../../../session-types";

export const issueStatusGenerator_100 = async (
  existingPayload: any,
  sessionData: SessionData,
  inputs?: Input
) => {
  const newDate = existingPayload?.context?.timestamp;
  existingPayload.message.issue.created_at = newDate;
  existingPayload.message.issue.updated_at = newDate;
  const provider = sessionData?.provider_id;
  let fulfillment = "F1";
  if (sessionData.fulfillments) {
    fulfillment = sessionData?.fulfillment_id;
  }
  const item = sessionData?.bap_items[0]?.id;
  const order = sessionData?.order_id;

  switch (sessionData.igm_action) {
    case "issue_open":
      existingPayload.message.issue.id = "ISSUE-1";
      existingPayload.message.issue.category = "FULFILLMENT";
      existingPayload.message.issue.sub_category = "FLM112";
      existingPayload.message.issue.complainant_info = sessionData?.fulfillments?.flat()?.[0]?.customer ?? {
        person: {
          name: "Sam Manuel",
        },
        contact: {
          phone: "9879879870",
          email: "sam@yahoo.com",
        },
      };
      existingPayload.message.issue.order_details = {
        id: order ?? "4597f703-e84f-431e-a96a-d147cfa142f9",
        state: "Completed",
        items: [
          {
            id: item ?? "18275-ONDC-1-9",
            quantity: 1,
          },
        ],
        fulfillments: [
          {
            id: fulfillment ?? "Fulfillment1",
            state: "CLAIMED",
          },
        ],
        provider_id: provider ?? "P1",
      };
      existingPayload.message.issue.description = {
        short_desc: "Issue with Fare Policy",
        long_desc:
          "Fare Policy is too high it should be calculated based on distance",
        additional_desc: {
          url: "https://buyerapp.com/additonal-details/desc.txt",
          content_type: "text/plain",
        },
        images: [
          "http://buyerapp.com/addtional-details/img1.png",
          "http://buyerapp.com/addtional-details/img2.png",
        ],
      };
      existingPayload.message.issue.source = {
        network_participant_id: existingPayload?.context?.bap_id ?? "buyerapp.com/ondc",
        type: "CONSUMER",
      };
      existingPayload.message.issue.expected_response_time = {
        duration: "PT2H",
      };
      existingPayload.message.issue.expected_resolution_time = {
        duration: "P1D",
      };
      existingPayload.message.issue.issue_actions = {
        complainant_actions: [
          {
            complainant_action: "OPEN",
            short_desc: "Complaint created",
            updated_at: newDate,
            updated_by: {
              org: {
                name: `${existingPayload?.context?.bap_id}::${existingPayload?.context?.domain}`,
              },
              contact: {
                phone: "9450394039",
                email: "buyerapp@interface.com",
              },
              person: {
                name: "John Doe",
              },
            },
          },
        ],
      };
      existingPayload.message.issue.status = "OPEN";
      existingPayload.message.issue.issue_type = "ISSUE";
      break;

    case "issue_close":
      existingPayload.message.issue.id = sessionData?.issue_id ?? "I1";
      existingPayload.message.issue.status = "CLOSED";
      existingPayload.message.issue.rating = inputs?.rating || "THUMBS_UP";
      existingPayload.message.issue.issue_actions = {
        complainant_actions: [
          ...sessionData?.issue_actions?.complainant_actions,
          {
            complainant_action: "CLOSE",
            short_desc: "Complaint closed",
            updated_at: newDate,
            updated_by: {
              org: {
                name: `${existingPayload?.context?.bap_id}::${existingPayload?.context?.domain}`,
              },
              contact: {
                phone: "9450394039",
                email: "interfacingapp@interface.com",
              },
              person: {
                name: "John Doe",
              },
            },
          },
        ],
      };
      existingPayload.message.issue.created_at =
        sessionData?.issue_created_at ?? newDate;
      existingPayload.message.issue.updated_at = newDate;

      break;

    default:
      break;
  }

  return existingPayload;
};
