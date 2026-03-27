import { Suspense } from "react";
import { AgentWorkspace } from "@/components/agent-workspace";

export default function AgentPage() {
  return (
    <Suspense fallback={null}>
      <AgentWorkspace />
    </Suspense>
  );
}
