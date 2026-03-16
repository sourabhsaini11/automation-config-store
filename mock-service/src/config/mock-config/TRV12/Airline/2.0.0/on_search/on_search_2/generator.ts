export async function onSearch_2_Generator(
  existingPayload: any,
  sessionData: any
) {

  const dateOfJourney = sessionData?.search_1_fulfillment?.stops?.find(
    (stop: any) => stop.type === "START"
  )?.time?.timestamp;

  // if (!dateOfJourney) return existingPayload;
  console.log("dateOfJourney", dateOfJourney);

  const addHours = (dateStr: string, hrs: number) => {
    const d = new Date(dateStr);
    d.setHours(d.getHours() + hrs);
    return d.toISOString();
  };

  const startTime = dateOfJourney;
  const endTime = addHours(startTime, 2);

  existingPayload.message.catalog.descriptor =
    sessionData?.on_search_1_catalog_descriptor ?? {};
  existingPayload.message.catalog.providers =
    sessionData?.on_search_1_providers ?? [];
  existingPayload.message.catalog.tags = sessionData?.on_search_1_tags ?? [];

  existingPayload.message.catalog.providers[0].fulfillments = [
    {
      id: "F1",
      type: "TRIP",
      stops: [
        {
          id: "S1",
          type: "START",
          location: { descriptor: { name: "Delhi", code: "DEL" } },
          time: { label: "DATE_TIME", timestamp: startTime },
        },
        {
          id: "S2",
          type: "END",
          location: { descriptor: { name: "Bengaluru", code: "BLR" } },
          time: { label: "DATE_TIME", timestamp: endTime },
        },
      ],
      vehicle: { category: "AIRLINE", code: "6E284" },
      tags: [
        {
          descriptor: { code: "INFO", name: "Info" },
          display: true,
          list: [{ descriptor: { code: "OPERATED_BY" }, value: "AirIndia" }],
        },
      ],
    },
    {
      id: "F2",
      type: "CONNECT",
      stops: [
        {
          id: "S1",
          type: "START",
          location: { descriptor: { name: "Delhi", code: "DEL" } },
          time: { label: "DATE_TIME", timestamp: startTime },
        },
        {
          id: "S2",
          type: "LAYOVER",
          location: { descriptor: { name: "Mumbai", code: "BOM" } },
          time: {
            label: "DATE_TIME",
            range: {
              start: addHours(startTime, 1), // +1h from START
              end: addHours(startTime, 2), // +2h from START
            },
            duration: "PT1H", // 1 hour layover
          },
        },
        {
          id: "S3",
          type: "END",
          location: { descriptor: { name: "Bengaluru", code: "BLR" } },
          time: { label: "DATE_TIME", timestamp: addHours(startTime, 3) },
        },
      ],
      vehicle: { category: "AIRLINE", code: "6E281" },
      tags: [
        {
          descriptor: { code: "INFO", name: "Info" },
          display: true,
          list: [
            { descriptor: { code: "FULFILLMENT_SEQUENCE" }, value: "F3, F4" },
            { descriptor: { code: "OPERATED_BY" }, value: "AirIndia" },
          ],
        },
      ],
    },
    {
      id: "F3",
      type: "TRIP",
      stops: [
        {
          id: "S1",
          type: "START",
          location: { descriptor: { name: "Delhi", code: "DEL" } },
          time: { label: "DATE_TIME", timestamp: startTime },
        },
        {
          id: "S2",
          type: "END",
          location: { descriptor: { name: "Mumbai", code: "BOM" } },
          time: { label: "DATE_TIME", timestamp: endTime },
        },
      ],
      vehicle: { category: "AIRLINE", code: "6E286" },
      tags: [
        {
          descriptor: { code: "INFO", name: "Info" },
          display: true,
          list: [
            { descriptor: { code: "PARENT_ID" }, value: "F2" },
            { descriptor: { code: "OPERATED_BY" }, value: "AirIndia" },
          ],
        },
      ],
    },
    {
      id: "F4",
      type: "TRIP",
      stops: [
        {
          id: "S1",
          type: "START",
          location: { descriptor: { name: "Mumbai", code: "BOM" } },
          time: { label: "DATE_TIME", timestamp: addHours(startTime, 4) },
        },
        {
          id: "S2",
          type: "END",
          location: { descriptor: { name: "Bengaluru", code: "BLR" } },
          time: { label: "DATE_TIME", timestamp: addHours(startTime, 6) },
        },
      ],
      vehicle: { category: "AIRLINE", code: "6E287" },
      tags: [
        {
          descriptor: { code: "INFO", name: "Info" },
          display: true,
          list: [
            { descriptor: { code: "PARENT_ID" }, value: "F2" },
            { descriptor: { code: "OPERATED_BY" }, value: "AirIndia" },
          ],
        },
      ],
    },
  ];

  const items = sessionData?.on_search_1_items?.map(
    (item: any) => {
      if (item?.descriptor?.code === "ADULT_TICKET") {
        return {
          ...item,
          fulfillment_ids:
            item?.id === "I1" || item?.id === "I2"
              ? ["F1"]
              : ["F2", "F3", "F4"],
          price: {
            currency: "INR",
            value: "9280",
          },
          tags: [
            ...item.tags,
            {
              descriptor: {
                code: "FARE_BREAK_UP",
                name: "Break up",
              },
              display: false,
              list: [
                {
                  descriptor: {
                    code: "TAX",
                    name: "GST",
                  },
                  value: "62",
                },
                {
                  descriptor: {
                    code: "OTHER_CHARGES",
                    name: "Fuel Charge",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "OTHER_CHARGES",
                    name: "Surcharge",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "TAX",
                    name: "cess",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "TAX",
                    name: "Fuel Tax",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "BASE_FARE",
                    name: "Base Fare",
                  },
                  value: "9280",
                },
              ],
            },
          ],
        };
      }
      if (item?.descriptor?.code === "CHILD_TICKET") {
        return {
          ...item,
          fulfillment_ids:
            item?.id === "I1" || item?.id === "I2"
              ? ["F1"]
              : ["F2", "F3", "F4"],
          price: {
            currency: "INR",
            value: "4280",
          },
          tags: [
            ...item.tags,
            {
              descriptor: {
                code: "FARE_BREAK_UP",
                name: "Break up",
              },
              display: false,
              list: [
                {
                  descriptor: {
                    code: "TAX",
                    name: "GST",
                  },
                  value: "62",
                },
                {
                  descriptor: {
                    code: "OTHER_CHARGES",
                    name: "Fuel Charge",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "OTHER_CHARGES",
                    name: "Surcharge",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "TAX",
                    name: "cess",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "TAX",
                    name: "Fuel Tax",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "BASE_FARE",
                    name: "Base Fare",
                  },
                  value: "4280",
                },
              ],
            },
          ],
        };
      }
    }
  );

  existingPayload.message.catalog.providers[0].items = items;

  existingPayload.message.catalog.tags[0]?.list.push({
    descriptor: {
      code: "CURRENT_PAGE_NUMBER",
    },
    value: "1",
  });
  return existingPayload;
}
