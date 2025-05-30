import { Suspense } from "react";
import PresaleClientContent from "./PresaleClientContent";

export const dynamic = "force-dynamic";

export default function PresalePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PresaleClientContent />
    </Suspense>
  );
}
