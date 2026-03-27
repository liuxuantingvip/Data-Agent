import { Suspense } from "react";
import { SchedulesWorkspace } from "@/components/schedules-workspace";

export default function SchedulesPage() {
  return (
    <Suspense fallback={null}>
      <SchedulesWorkspace />
    </Suspense>
  );
}
