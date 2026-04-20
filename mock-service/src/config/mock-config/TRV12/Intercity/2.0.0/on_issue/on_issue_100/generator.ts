import { Input, SessionData } from "../../../../session-types";

export const onIssueStatusGenerator_100 = async (
  existingPayload: any,
  sessionData: SessionData,
  inputs?: Input
) => {
  const newDate = existingPayload?.context?.timestamp;

  switch (sessionData.igm_action) {
    case "on_issue_processing":
      existingPayload.message.issue.id = sessionData?.issue_id ?? "I1";
      existingPayload.message.issue.issue_actions = {
        respondent_actions: [
          {
            respondent_action: "PROCESSING",
            short_desc: "Complaint is being processed",
            updated_at: newDate,
            updated_by: {
              org: {
                name: `${existingPayload?.context?.bpp_id}::${existingPayload?.context?.domain}`,
              },
              contact: {
                phone: "9450394140",
                email: "respondentapp@respond.com",
              },
              person: {
                name: "Jane Doe",
              },
            },
            cascaded_level: 1,
          },
        ],
      };
      existingPayload.message.issue.created_at = sessionData?.issue_created_at ?? newDate;
      existingPayload.message.issue.updated_at = newDate
      break;

    case "on_issue_resolved":
      existingPayload.message.issue.id = sessionData?.issue_id ?? "I1";
      existingPayload.message.issue.issue_actions = {
        respondent_actions: [
          ...sessionData?.on_issue_actions?.respondent_actions,
          {
            respondent_action: "RESOLVED",
            short_desc: "Complaint resolved",
            updated_at: newDate,
            updated_by: {
              org: {
                name: `${existingPayload?.context?.bpp_id}::${existingPayload?.context?.domain}`,
              },
              contact: {
                phone: "9450394140",
                email: "respondentapp@respond.com",
              },
              person: {
                name: "Jane Doe",
              },
            },
            cascaded_level: 1,
          },
        ],
      };
      existingPayload.message.issue.resolution_provider = {
        respondent_info: {
          type: "TRANSACTION-COUNTERPARTY-NP",
          organization: {
            org: {
              name: `${existingPayload?.context?.bpp_id}::${existingPayload?.context?.domain}`,
            },
            contact: {
              phone: "9059304940",
              email: "email@resolutionproviderorg.com",
            },
            person: {
              name: "resolution provider org contact person name",
            },
          },
          resolution_support: {
            chat_link: "http://chat-link/respondent",
            contact: {
              phone: "9949595059",
              email: "respondantemail@resolutionprovider.com",
            },
            gros: [
              {
                person: {
                  name: "Sam D",
                },
                contact: {
                  phone: "9605960796",
                  email: "email@gro.com",
                },
                gro_type: "TRANSACTION-COUNTERPARTY-NP-GRO",
              },
            ],
          },
        },
      };
      existingPayload.message.issue.resolution = {
        short_desc: "Refund to be initiated",
        long_desc: "For this complaint, refund is to be initiated",
        action_triggered: "REFUND",
        refund_amount: sessionData?.quote?.price?.value ?? "100",
      };
      existingPayload.message.issue.created_at = sessionData?.issue_created_at ?? newDate;
      existingPayload.message.issue.updated_at = newDate

      break;

    default:
      break;
  }

  return existingPayload;
};
