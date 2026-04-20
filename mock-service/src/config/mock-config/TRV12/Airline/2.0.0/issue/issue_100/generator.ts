import { Input, SessionData } from "../../../../session-types";

export const issueStatusGenerator_100 = async (
  existingPayload: any,
  sessionData: SessionData,
  inputs?: Input
) => {
  const newDate = existingPayload?.context?.timestamp;
  existingPayload.message.issue.created_at = newDate;
  existingPayload.message.issue.updated_at = newDate;
  const provider = sessionData?.on_confirm_provider
  let fulfillment = "F1";
  if (sessionData.on_confirm_fulfillments) {
    fulfillment = sessionData?.on_confirm_fulfillments?.flat()?.[0]?.id;
  }
  const item = sessionData?.on_confirm_items?.flat()?.[0]?.id
  const itemCount = sessionData?.on_confirm_items?.flat()?.[0]?.quantity?.selected?.count
  const order = sessionData?.on_confirm_orderID;

  switch (sessionData.igm_action) {
    case "issue_open":
      existingPayload.message.issue.id = "ISSUE-1";
      existingPayload.message.issue.category = "FULFILLMENT";
      existingPayload.message.issue.sub_category = "FLM121";
      existingPayload.message.issue.complainant_info = {
        person: {
          name: sessionData?.on_confirm_billing?.name ?? "John Doe",
        },
        contact: {
          phone: sessionData?.on_confirm_billing?.phone ?? "+91-9897867564",
          email: "john.doe@example.com",
        },
      };
      existingPayload.message.issue.order_details = {
        id: order ?? "4597f703-e84f-431e-a96a-d147cfa142f9",
        state: "Completed",
        items: [
          {
            id: item ?? "18275-ONDC-1-9",
            quantity: itemCount ?? 1,
          },
        ],
        fulfillments: [
          {
            id: fulfillment ?? "Fulfillment1",
            state: "CLAIMED",
          },
        ],
        provider_id: provider?.id ?? "Provider1",
      };
      existingPayload.message.issue.description = {
        short_desc: "Issue with E-ticket not sent to the buyer after booking.",
        long_desc:
          "Issue with E-ticket not sent to the buyer after booking.",
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
                phone: sessionData?.on_confirm_billing?.phone ?? "9450394039",
                email: "buyerapp@interface.com",
              },
              person: {
                name: sessionData?.on_confirm_billing?.name ?? "John Doe",
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
                phone: sessionData?.on_confirm_billing?.phone ?? "9450394039",
                email: "interfacingapp@interface.com",
              },
              person: {
                name: sessionData?.on_confirm_billing?.name ?? "John Doe",
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
