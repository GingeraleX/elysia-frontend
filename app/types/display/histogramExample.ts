/* eslint-disable @typescript-eslint/no-explicit-any */
export const histogramResponse: any = {
  id: "12345",
  query: "Show me a histogram of wind speeds",
  messages: [
    {
      type: "User",
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      query_id: "b2c3d4e5-f6a7-8901-bcde-f01234567891",
      conversation_id: "c3d4e5f6-a7b8-9012-cdef-012345678902",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      payload: {
        type: "text",
        metadata: {},
        code: { language: "", title: "", text: "" },
        objects: ["Show me a histogram of wind speeds"],
      },
    },
    {
      type: "text",
      id: "tex-d1e2f3a4-b5c6-7890-1234-567890abcdef",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "c3d4e5f6-a7b8-9012-cdef-012345678902",
      query_id: "b2c3d4e5-f6a7-8901-bcde-f01234567891",
      payload: {
        type: "response",
        metadata: {},
        objects: [
          {
            text: "I'll retrieve all wind speed values from the Weather collection and visualize them as a histogram.",
          },
        ],
      },
    },
    {
      type: "result",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "c3d4e5f6-a7b8-9012-cdef-012345678902",
      query_id: "b2c3d4e5-f6a7-8901-bcde-f01234567891",
      id: "res-e4f5a6b7-c8d9-0123-4567-89abcdef0123",
      payload: {
        type: "histogram_chart",
        objects: [
          {
            title: "Wind Speed Distribution",
            description: "Distribution of wind speeds across all weather records.",
            data: {
              "Wind Speed (km/h)": {
                distribution: [
                  2.7, 4.1, 5.3, 6.8, 8.2, 9.4, 10.1, 11.5, 12.3, 13.7,
                  14.9, 16.2, 17.4, 18.8, 20.1, 22.3, 24.5, 26.7, 29.1, 32.4,
                  35.2, 38.6, 41.0, 44.3, 46.6, 3.5, 7.9, 15.1, 23.8, 31.0,
                ],
              },
            },
            _REF_ID: "visualise_histogram_0_0",
          },
        ],
        metadata: {
          chart_title: "Wind Speed Histogram",
          chart_type: "histogram",
        },
        code: {
          language: "python",
          title: "Query",
          text: "collection.query.fetch_objects(limit=1000)",
        },
      },
    },
    {
      type: "text",
      id: "tex-f5a6b7c8-d9e0-1234-5678-90abcdef0124",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "c3d4e5f6-a7b8-9012-cdef-012345678902",
      query_id: "b2c3d4e5-f6a7-8901-bcde-f01234567891",
      payload: {
        type: "response",
        metadata: {},
        objects: [
          {
            text: "The histogram shows the distribution of wind speeds. Most readings cluster between 5–20 km/h, with a long tail towards higher gusts.",
          },
        ],
      },
    },
    {
      type: "suggestion",
      id: "a6b7c8d9-e0f1-2345-6789-0abcdef01234",
      conversation_id: "c3d4e5f6-a7b8-9012-cdef-012345678902",
      query_id: "b2c3d4e5-f6a7-8901-bcde-f01234567891",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      payload: {
        error: "",
        suggestions: [
          "Show temperature distribution as a histogram",
          "What is the average wind speed?",
          "Which days had the highest wind speeds?",
        ],
      },
    },
  ],
  finished: true,
  query_start: new Date(),
  query_end: new Date(new Date().getTime() + 1000),
  NER: {
    text: "Show me a histogram of wind speeds",
    noun_spans: [[28, 39]],
    entity_spans: [],
  },
  feedback: 0,
  index: 0,
};

