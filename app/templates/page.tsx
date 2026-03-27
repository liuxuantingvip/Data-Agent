import { Suspense } from "react";
import { TemplatesWorkspace } from "@/components/templates-workspace";

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesWorkspace />
    </Suspense>
  );
}
