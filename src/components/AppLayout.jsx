import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}