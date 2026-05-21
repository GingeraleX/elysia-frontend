import { ModelProvider } from "@/app/types/objects";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaTachometerAlt, FaBullseye } from "react-icons/fa";

// Model Badges Component
export default function ModelBadges({
  modelsData,
  provider,
  model,
}: {
  modelsData: { [key: string]: ModelProvider } | null;
  provider: string;
  model: string;
}) {
  if (
    !modelsData ||
    !provider ||
    !model ||
    !modelsData[provider] ||
    !modelsData[provider][model]
  ) {
    return null;
  }

  const modelData = modelsData[provider][model];

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-xs bg-alt_color_a/10 text-alt_color_a border border-alt_color_a hover:bg-alt_color_a/20 flex items-center gap-1 cursor-help px-2 py-1 rounded-md">
            <FaTachometerAlt size={10} />
            {modelData.speed}
          </TooltipTrigger>
          <TooltipContent>
            <p>Velocità: quanto rapidamente il modello elabora le richieste</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-xs bg-highlight/10 text-highlight border border-highlight hover:bg-highlight/20 flex items-center gap-1 cursor-help px-2 py-1 rounded-md">
            <FaBullseye size={10} />
            {modelData.accuracy}
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Accuratezza: quanto sono precise e corrette le risposte del modello
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
