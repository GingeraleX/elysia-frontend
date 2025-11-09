﻿"use client";

import React, { useContext, useEffect, useState } from "react";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { CollectionContext } from "../components/contexts/CollectionContext";
import { LoadingSpinner } from "../components/loading/LoadingSpinner";

// Import components
import DataImportHub from "../components/data-import/DataImportHub";

/**
 * Import Data Page - Main entry point for data import feature
 * Uses Elysia design system throughout
 */
export default function ImportDataPage() {
  const { id, userConfig } = useContext(SessionContext);
  const { showErrorToast } = useContext(ToastContext);
  const { collections, fetchCollections } = useContext(CollectionContext);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!id || !userConfig) {
      showErrorToast("Not authenticated", "Please log in to use data import");
      return;
    }
    setIsReady(true);
  }, [id, userConfig, showErrorToast]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden fade-in">
      <DataImportHub
        tenantId={id}
        userConfig={userConfig}
        collections={collections}
        onCollectionsUpdated={fetchCollections}
      />
    </div>
  );
}

