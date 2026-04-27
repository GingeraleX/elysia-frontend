"use client";

import DataExplorer from "../components/explorer/DataExplorer";

export default function Home() {
  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <DataExplorer />
    </div>
  );
}
