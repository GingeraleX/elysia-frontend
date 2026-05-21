import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/lib/auth-errors";

interface AuthErrorAlertProps {
  error: AuthError;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function AuthErrorAlert({ error, onRetry, isRetrying }: AuthErrorAlertProps) {
  const shouldShowRetry = onRetry && error.retryable && !error.userMessage.includes("already registered");

  return (
    <div className="rounded-md bg-destructive/15 px-4 py-3 flex items-start gap-3 border border-destructive/30">
      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">
          {error.userMessage}
        </p>
        {shouldShowRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-2 h-8 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Riprovo..." : "Riprova"}
          </Button>
        )}
      </div>
    </div>
  );
}
