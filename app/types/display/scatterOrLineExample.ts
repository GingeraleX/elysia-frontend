/* eslint-disable @typescript-eslint/no-explicit-any */
export const scatterOrLineResponse: any = {
  id: "12345",
  query: "Plot temperature vs apparent temperature as a scatter chart",
  messages: [
    {
      type: "User",
      id: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
      query_id: "e2f3a4b5-c6d7-8901-bcde-f01234567891",
      conversation_id: "f3a4b5c6-d7e8-9012-cdef-012345678902",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      payload: {
        type: "text",
        metadata: {},
        code: { language: "", title: "", text: "" },
        objects: ["Plot temperature vs apparent temperature as a scatter chart"],
      },
    },
    {
      type: "text",
      id: "tex-f3a4b5c6-d7e8-9012-1234-567890abcdef",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "f3a4b5c6-d7e8-9012-cdef-012345678902",
      query_id: "e2f3a4b5-c6d7-8901-bcde-f01234567891",
      payload: {
        type: "response",
        metadata: {},
        objects: [
          {
            text: "I'll retrieve temperature and apparent temperature data from the Weather collection and plot them as a scatter chart.",
          },
        ],
      },
    },
    {
      type: "result",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "f3a4b5c6-d7e8-9012-cdef-012345678902",
      query_id: "e2f3a4b5-c6d7-8901-bcde-f01234567891",
      id: "res-a4b5c6d7-e8f9-0123-4567-89abcdef0123",
      payload: {
        type: "scatter_or_line_chart",
        objects: [
          {
            title: "Temperature vs Apparent Temperature",
            description:
              "Scatter plot comparing actual temperature against the apparent (feels-like) temperature.",
            x_axis_label: "Temperature (°C)",
            y_axis_label: "Apparent Temperature (°C)",
            data: {
              x_axis: [
                { value: 14.0, label: null },
                { value: 18.5, label: null },
                { value: 22.3, label: null },
                { value: 26.7, label: null },
                { value: 30.1, label: null },
                { value: 33.8, label: null },
                { value: 37.2, label: null },
                { value: 29.4, label: null },
                { value: 24.6, label: null },
                { value: 19.8, label: null },
              ],
              y_axis: [
                {
                  label: "Apparent Temperature (°C)",
                  kind: "scatter",
                  data_points: [
                    { value: 12.1, label: null },
                    { value: 17.4, label: null },
                    { value: 21.0, label: null },
                    { value: 25.9, label: null },
                    { value: 29.3, label: null },
                    { value: 35.1, label: null },
                    { value: 37.8, label: null },
                    { value: 28.6, label: null },
                    { value: 23.2, label: null },
                    { value: 18.9, label: null },
                  ],
                },
              ],
              normalize_y_axis: false,
            },
            _REF_ID: "visualise_scatter_0_0",
          },
        ],
        metadata: {
          chart_title: "Temp vs Apparent Temp",
          chart_type: "scatter",
        },
        code: {
          language: "python",
          title: "Query",
          text: "collection.query.fetch_objects(limit=10)",
        },
      },
    },
    {
      type: "text",
      id: "tex-b5c6d7e8-f9a0-1234-5678-90abcdef0124",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      conversation_id: "f3a4b5c6-d7e8-9012-cdef-012345678902",
      query_id: "e2f3a4b5-c6d7-8901-bcde-f01234567891",
      payload: {
        type: "response",
        metadata: {},
        objects: [
          {
            text: "The scatter chart shows a strong positive correlation between actual temperature and apparent (feels-like) temperature.",
          },
        ],
      },
    },
    {
      type: "suggestion",
      id: "c6d7e8f9-a0b1-2345-6789-0abcdef01234",
      conversation_id: "f3a4b5c6-d7e8-9012-cdef-012345678902",
      query_id: "e2f3a4b5-c6d7-8901-bcde-f01234567891",
      user_id: "c5163446-4eff-5c3f-b362-33932ca630d4",
      payload: {
        error: "",
        suggestions: [
          "Plot temperature over time as a line chart",
          "What is the correlation between humidity and temperature?",
          "Show me days with the highest apparent temperature",
        ],
      },
    },
  ],
  finished: true,
  query_start: new Date(),
  query_end: new Date(new Date().getTime() + 1000),
  NER: {
    text: "Plot temperature vs apparent temperature as a scatter chart",
    noun_spans: [[5, 16]],
    entity_spans: [],
  },
  feedback: 0,
  index: 0,
};

