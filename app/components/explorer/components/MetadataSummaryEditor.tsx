import React from "react";
import { Button } from "@/components/ui/button";
import { FaEdit } from "react-icons/fa";
import MarkdownFormat from "../../chat/components/MarkdownFormat";
import SaveCancelButtons from "./SaveCancelButtons";
import { CiTextAlignJustify } from "react-icons/ci";

// Strip residual thinking content from stored summaries.
// The backend (CollectionAnalysisService) handles this at generation time,
// but this is a safety-net for old stored data and edge cases.
function stripThinkingFromSummary(text: string): string {
  // XML <think>/<thinking> blocks
  let out = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();

  // Plain-text reasoning headings (Qwen3 / DeepSeek chain-of-thought)
  const THINK_HEADING_RE = /^(Thinking(?: Process)?:|Analyze the Request:|Analyze the Input(?: Data)?:|Chain of Thought:|Reasoning:|Observations?:|Step \d+:|Now,? let'?s|Let me (?:analyze|think|break)|Consider(?:ing)?:|Given the above|Based on the|Summary of [Tt]hinking:|Final [Aa]nswer:)/im;

  let iterations = 0;
  let m = THINK_HEADING_RE.exec(out);
  while (m && iterations++ < 20) {
    const headingEnd = m.index + m[0].length;
    const after = out.slice(headingEnd);
    const boundaryIdx = after.search(/\n{2,}\S/);
    if (boundaryIdx !== -1) {
      out = (out.slice(0, m.index) + out.slice(headingEnd + boundaryIdx)).trim();
    } else {
      out = out.slice(0, m.index).trim();
      break;
    }
    m = THINK_HEADING_RE.exec(out);
  }

  return out;
}

interface MetadataSummaryEditorProps {
  summary: string;
  editing: boolean;
  summaryDraft: string;
  saving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const MetadataSummaryEditor: React.FC<MetadataSummaryEditorProps> = ({
  summary,
  editing,
  summaryDraft,
  saving,
  hasChanges,
  onEdit,
  onChange,
  onSave,
  onCancel,
}) => (
  <div className="flex flex-col gap-2 border border-foreground p-4 rounded-md">
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-highlight/10 border border-highlight rounded-md p-1">
          <CiTextAlignJustify className="text-highlight" />
        </div>
        <p className="font-bold">Summary</p>
      </div>

      {!editing && (
        <Button onClick={onEdit} className="">
          <FaEdit className="text-secondary" />
          <p className="text-secondary">Edit</p>
        </Button>
      )}
    </div>
    {editing ? (
      <div className="flex flex-col gap-2">
        <textarea
          className="w-full border rounded p-2 bg-background_alt min-h-[35vh]"
          rows={4}
          value={summaryDraft}
          onChange={(e) => onChange(e.target.value)}
          disabled={saving}
        />
        <SaveCancelButtons
          saving={saving}
          hasChanges={hasChanges}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    ) : (
      <MarkdownFormat text={stripThinkingFromSummary(summary)} />
    )}
  </div>
);

export default MetadataSummaryEditor;
