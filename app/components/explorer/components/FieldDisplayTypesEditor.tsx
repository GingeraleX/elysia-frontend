"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaEdit } from "react-icons/fa";
import { MdOutlineSchema } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisplayIcon } from "@/app/types/displayIcons";
import SaveCancelButtons from "./SaveCancelButtons";

/** All recognised display types — must stay in sync with MAPPING_TYPES in collections.ts */
const DISPLAY_TYPES = [
  { value: "text",          label: "Testo" },
  { value: "image",         label: "Immagine" },
  { value: "table",         label: "Tabella" },
  { value: "chart_bar",     label: "Grafico — Barre" },
  { value: "chart_line",    label: "Grafico — Linee" },
  { value: "chart_scatter", label: "Grafico — Dispersione" },
  { value: "entity",        label: "Entità" },
  { value: "document",      label: "Documento" },
  { value: "product",       label: "Prodotto" },
  { value: "person",        label: "Persona" },
  { value: "event",         label: "Evento" },
  { value: "link",          label: "Collegamento" },
] as const;

interface FieldDisplayTypesEditorProps {
  /** Current (saved) mapping: { fieldName: displayType } */
  fieldDisplayTypes: Record<string, string>;
  /** Draft being edited: { fieldName: displayType } */
  fieldDisplayTypesDraft: Record<string, string>;
  editing: boolean;
  saving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, displayType: string) => void;
}

const FieldDisplayTypesEditor: React.FC<FieldDisplayTypesEditorProps> = ({
  fieldDisplayTypes,
  fieldDisplayTypesDraft,
  editing,
  saving,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
  onChange,
}) => {
  const displayData = editing ? fieldDisplayTypesDraft : fieldDisplayTypes;
  const fieldNames = Object.keys(displayData);

  if (fieldNames.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border border-foreground p-4 rounded-md">
      {/* Header */}
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-accent/10 border border-accent rounded-md p-1">
            <MdOutlineSchema className="text-accent" />
          </div>
          <p className="font-bold">Tipi di visualizzazione campi</p>
          <span className="text-xs text-secondary bg-foreground border border-border rounded-full px-2 py-0.5">
            rilevati automaticamente · modificabili
          </span>
        </div>
        {!editing && (
          <Button onClick={onEdit}>
            <FaEdit className="text-secondary" />
            <p className="text-secondary">Modifica</p>
          </Button>
        )}
        {editing && (
          <SaveCancelButtons
            saving={saving}
            hasChanges={hasChanges}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      </div>

      {/* Field rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
        {fieldNames.map((field) => {
          const currentType = displayData[field] ?? "text";
          return (
            <div
              key={field}
              className="flex items-center gap-2 bg-background rounded-md px-3 py-2 border border-border"
            >
              {/* Display type icon */}
              <div className="flex-shrink-0">{getDisplayIcon(currentType)}</div>

              {/* Field name */}
              <p
                className="flex-1 text-sm text-primary font-medium truncate"
                title={field}
              >
                {field}
              </p>

              {/* Selector (edit mode) or badge (read mode) */}
              {editing ? (
                <Select
                  value={currentType}
                  onValueChange={(value) => onChange(field, value)}
                >
                  <SelectTrigger className="w-[130px] h-7 text-xs border-background_alt bg-background_alt">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background_alt border-background_alt">
                    {DISPLAY_TYPES.map(({ value, label }) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-primary text-xs focus:bg-primary/20 focus:text-primary"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs text-secondary bg-foreground border border-border rounded-full px-2 py-0.5 whitespace-nowrap">
                  {currentType.replace(/_/g, " ")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FieldDisplayTypesEditor;
