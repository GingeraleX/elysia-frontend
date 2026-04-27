"use client";

import { TextPayload, ResultPayload } from "@/app/types/chat";
import MarkdownFormat from "../../components/MarkdownFormat";
import { motion } from "framer-motion";
import BoringGenericDisplay from "./BoringGeneric";
import AggregationDisplay from "../ChartTable/AggregationDisplay";
import BarDisplay from "../ChartTable/BarDisplay";
import ScatterOrLineDisplay from "../ChartTable/ScatterOrLineDisplay";
import HistogramDisplay from "../ChartTable/HistogramDisplay";
import {
  AggregationPayload,
  BarPayload,
  ScatterOrLinePayload,
} from "@/app/types/displays";

interface TextDisplayProps {
  payload: TextPayload[];
}

// All payload type values we can render inline
const DISPLAY_TYPES = new Set([
  "table",
  "mapped",
  "generic",
  "document",
  "ticket",
  "product",
  "ecommerce",
  "aggregation",
  "bar_chart",
  "histogram_chart",
  "scatter_or_line_chart",
  "conversation",
  "message",
]);

/**
 * Parse ```display_payload``` and ```chart_payload``` fenced code blocks
 * out of the markdown text the LLM streams.
 *
 * Returns the cleaned text (blocks removed) plus an array of ResultPayloads
 * that can be rendered by RenderInlinePayload below.
 *
 * During streaming the closing fence hasn't arrived yet so the regex won't
 * match — we leave the partial block in the text (renders as a code block).
 * Once the stream is complete the block is fully formed, the regex matches,
 * and it morphs into the proper component. This produces a clean UX
 * transition: the user sees the JSON build up then it renders as a table/chart.
 */
function extractDisplayBlocks(text: string): {
  cleanText: string;
  payloads: ResultPayload[];
} {
  const payloads: ResultPayload[] = [];

  // ── 1. ```display_payload … ``` ──────────────────────────────────────────
  let cleanText = text.replace(
    /```display_payload\s*\n([\s\S]*?)\n?\s*```/g,
    (_, jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        if (
          parsed.type &&
          DISPLAY_TYPES.has(parsed.type) &&
          Array.isArray(parsed.objects)
        ) {
          payloads.push({
            type: parsed.type,
            objects: parsed.objects,
            metadata: parsed.metadata ?? null,
            code: parsed.code ?? (null as any),
          } as ResultPayload);
          return ""; // strip from text
        }
      } catch {
        /* malformed JSON – keep as generic code block */
      }
      return `\`\`\`json\n${jsonStr}\n\`\`\``;
    }
  );

  // ── 2. ```chart_payload … ``` ────────────────────────────────────────────
  cleanText = cleanText.replace(
    /```chart_payload\s*\n([\s\S]*?)\n?\s*```/g,
    (_, jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        if (
          parsed.type === "bar_chart" &&
          parsed.x_labels &&
          parsed.y_values
        ) {
          // chart_payload bar format → BarPayload wrapped in ResultPayload
          const barPayload: BarPayload = {
            title: parsed.title ?? "",
            description: parsed.description ?? "",
            x_axis_label: parsed.x_axis_label ?? "",
            y_axis_label: parsed.y_axis_label ?? "",
            data: { x_labels: parsed.x_labels, y_values: parsed.y_values },
          };
          payloads.push({
            type: "bar_chart",
            objects: [barPayload],
            metadata: null,
            code: null as any,
          } as ResultPayload);
          return "";
        }

        if (parsed.type === "scatter_or_line_chart" && parsed.series) {
          const scatterPayload: ScatterOrLinePayload = {
            title: parsed.title ?? "",
            description: parsed.description ?? "",
            x_axis_label: parsed.x_axis_label ?? "",
            y_axis_label: parsed.y_axis_label ?? "",
            data: {
              x_axis: [],
              y_axis: (parsed.series as any[]).map((s) => ({
                label: s.label,
                kind: s.kind as "scatter" | "line",
                data_points: ((s.y as (number | string)[]) ?? []).map(
                  (v, i) => ({
                    value: v,
                    label: s.x ? String(s.x[i]) : null,
                  })
                ),
              })),
              normalize_y_axis: false,
            },
          };
          payloads.push({
            type: "scatter_or_line_chart",
            objects: [scatterPayload],
            metadata: null,
            code: null as any,
          } as ResultPayload);
          return "";
        }

        // Fallback: chart_payload that looks like a display_payload
        if (
          parsed.type &&
          DISPLAY_TYPES.has(parsed.type) &&
          Array.isArray(parsed.objects)
        ) {
          payloads.push({
            type: parsed.type,
            objects: parsed.objects,
            metadata: null,
            code: null as any,
          } as ResultPayload);
          return "";
        }
      } catch {
        /* malformed */
      }
      return `\`\`\`json\n${jsonStr}\n\`\`\``;
    }
  );

  // ── 3. Plain ```json or ``` blocks that look like display payloads ────────
  // Handles the case where the LLM emits raw JSON without the special language
  // tag — e.g. ```\n{"type":"table","objects":[…]}\n```
  cleanText = cleanText.replace(
    /```(?:json)?\s*\n(\{[\s\S]*?})\s*\n```/g,
    (match, jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        if (
          parsed.type &&
          DISPLAY_TYPES.has(parsed.type) &&
          Array.isArray(parsed.objects)
        ) {
          payloads.push({
            type: parsed.type,
            objects: parsed.objects,
            metadata: null,
            code: null as any,
          } as ResultPayload);
          return ""; // strip
        }
      } catch {
        /* not a display payload */
      }
      return match; // leave unchanged
    }
  );

  return { cleanText: cleanText.trim(), payloads };
}

/** Render a parsed ResultPayload as the right inline display component */
function RenderInlinePayload({
  payload,
}: {
  payload: ResultPayload;
  index: number;
}) {
  switch (payload.type) {
    case "table":
    case "mapped":
    case "generic":
      return (
        <BoringGenericDisplay
          payload={payload.objects as { [key: string]: string }[]}
        />
      );
    case "aggregation":
      return (
        <AggregationDisplay
          aggregation={payload.objects as AggregationPayload[]}
        />
      );
    case "bar_chart":
      return <BarDisplay result={payload} />;
    case "scatter_or_line_chart":
      return <ScatterOrLineDisplay result={payload} />;
    case "histogram_chart":
      return <HistogramDisplay result={payload} />;
    default:
      // document, ticket, product, conversation, message — fall back to
      // a flat table view since those rich components need router context
      if (
        Array.isArray(payload.objects) &&
        payload.objects.length > 0 &&
        typeof payload.objects[0] === "object"
      ) {
        return (
          <BoringGenericDisplay
            payload={payload.objects as { [key: string]: string }[]}
          />
        );
      }
      return null;
  }
}

const TextDisplay: React.FC<TextDisplayProps> = ({ payload }) => {
  // Backend already strips <think>...</think> blocks char-by-char during streaming.
  // No frontend stripping needed — doing it here risks corrupting partial streamed text.
  const fullText = payload.map((p) => p.text).join("");
  const { cleanText, payloads } = extractDisplayBlocks(fullText);

  return (
    <motion.div
      className="w-full flex flex-col items-start justify-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {cleanText && <MarkdownFormat text={cleanText} />}
      {payloads.map((p, i) => (
        <RenderInlinePayload key={`inline-payload-${i}`} payload={p} index={i} />
      ))}
    </motion.div>
  );
};

export default TextDisplay;
