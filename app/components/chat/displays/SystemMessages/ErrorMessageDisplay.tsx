"use client";

import React from "react";
import MarkdownFormat from "../../components/MarkdownFormat";
import { IoWarningOutline, IoKeyOutline, IoTimeOutline } from "react-icons/io5";
import { MdOutlineCloudOff } from "react-icons/md";

interface ErrorMessageDisplayProps {
  error: string;
}

const ErrorMessageDisplay: React.FC<ErrorMessageDisplayProps> = ({ error }) => {
  const isRateLimit = /rate limit|429|quota/i.test(error);
  const isAuthError = /authentication failed|api key|401|403|missing_api_key/i.test(error);
  const isUnavailable = /unavailable|500|503/i.test(error);

  const Icon = isRateLimit
    ? IoTimeOutline
    : isAuthError
    ? IoKeyOutline
    : isUnavailable
    ? MdOutlineCloudOff
    : IoWarningOutline;

  const title = isRateLimit
    ? "Rate Limited"
    : isAuthError
    ? "API Key Error"
    : isUnavailable
    ? "Service Unavailable"
    : "Error";

  return (
    <div className="w-full flex flex-col justify-start items-start ">
      <div className="max-w-3/5">
        <div className="flex flex-col justify-start items-start gap-2 chat-animation border border-error p-4 rounded-lg">
          <div className="flex gap-2 items-center">
            <Icon className="text-error text-lg" />
            <p className="text-error text-sm font-bold">{title}</p>
          </div>
          <MarkdownFormat text={error} />
          {(isAuthError || isRateLimit) && (
            <a
              href="/?page=settings"
              className="text-xs text-primary underline mt-1 hover:opacity-80 transition-opacity"
            >
              → Open Settings → AI Configuration
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageDisplay;
