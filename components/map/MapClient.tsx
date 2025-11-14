// components/map/MapClient.tsx
"use client";

import dynamic from "next/dynamic";

const MapClientInner = dynamic(() => import("./MapExplorer"), {
  ssr: false,
});

export default function MapClient(props: any) {
  return <MapClientInner {...props} />;
}
