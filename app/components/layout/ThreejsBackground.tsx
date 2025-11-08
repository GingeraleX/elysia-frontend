"use client";

import dynamic from "next/dynamic";

// Dynamically import Three.js component only when needed
const AbstractSphere = dynamic(
  () => import("../threejs/AbstractSphere").then((mod) => ({ default: mod.AbstractSphere })),
  {
    loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />,
    ssr: false,
  }
);

export function ThreejsBackground() {

  return (
    <div className="w-full h-full">
      <AbstractSphere />
    </div>
  );
}

