import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "./components/AppLayout";
import FleetOverview from "./pages/FleetOverview";
import OrchestrationGraph from "./pages/OrchestrationGraph";
import MemoryTiers from "./pages/MemoryTiers";
import ReflexionMetrics from "./pages/ReflexionMetrics";
import HITLInbox from "./pages/HITLInbox";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<FleetOverview />} />
          <Route path="orchestration" element={<OrchestrationGraph />} />
          <Route path="memory" element={<MemoryTiers />} />
          <Route path="reflexion" element={<ReflexionMetrics />} />
          <Route path="hitl" element={<HITLInbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}