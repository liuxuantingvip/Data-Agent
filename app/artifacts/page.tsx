import { Suspense } from "react";
import { FavoritesWorkspace } from "@/components/favorites-workspace";

export default function ArtifactsPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesWorkspace />
    </Suspense>
  );
}
