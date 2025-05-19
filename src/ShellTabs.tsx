import { useState, Suspense, lazy } from "react";
import type { JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "./apps/emergency/assets/KDvE Logo NGI 500x100.png";

const EmergencyApp = lazy(() => import("./apps/EmergencyApp"));
const OtherApp = lazy(() => import("./apps/OtherApp"));
const InvoiceUploader = lazy(() => import("./apps/InvoiceUploader/App"));
const CreatePatientApp = lazy(() => import("./apps/CreatePatient/App"));
import AppointmentSchedulerApp from "./apps/AppointmentScheduler/App"; // ✅ normal import (not lazy)

type TabId = "emergency" | "other" | "upload" | "create_patient" | "appointments";

interface ShellTabsProps {
  user: { email: string };
  onLogout: () => void;
}

export default function ShellTabs({ user, onLogout }: ShellTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("emergency");

  const renderTabContent = (tab: TabId): JSX.Element => {
    switch (tab) {
      case "emergency":
        return (
          <Suspense fallback={<div className="p-4 text-gray-400">Loading emergency...</div>}>
            <EmergencyApp />
          </Suspense>
        );
      case "other":
        return (
          <Suspense fallback={<div className="p-4 text-gray-400">Loading other...</div>}>
            <OtherApp />
          </Suspense>
        );
      case "upload":
        return (
          <Suspense fallback={<div className="p-4 text-gray-400">Loading uploader...</div>}>
            <InvoiceUploader />
          </Suspense>
        );
      case "create_patient":
        return (
          <Suspense fallback={<div className="p-4 text-gray-400">Loading form...</div>}>
            <CreatePatientApp onSuccess={() => {}} />
          </Suspense>
        );
      case "appointments":
        return (
          <AppointmentSchedulerApp
            prefill={undefined}
            onSuccess={() => {}}
          />
        );
      default:
        return <div className="p-4 text-gray-400">Unknown tab</div>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Klinika Dental van Egmond"
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-700 hidden sm:block">{user.email}</span>
          <button
            onClick={onLogout}
            className="bg-gray-100 border px-3 py-1 rounded text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex px-4 sm:px-6 pt-2 bg-white gap-2 border-b">
        {(["emergency", "other", "upload", "create_patient", "appointments"] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium shadow-sm transition-colors ${
              activeTab === tab
                ? "bg-[#01a695] text-white border border-b-0 rounded-t-md px-4 py-2 hover:bg-[#018f84]"
                : "bg-gray-100 text-gray-500 border border-b rounded-t-md px-4 py-2 hover:bg-gray-200"
            }`}
          >
            {tab === "emergency"
              ? "Emergency App"
              : tab === "other"
              ? "Other App"
              : tab === "upload"
              ? "Upload Invoice"
              : tab === "create_patient"
              ? "Create Patient"
              : "Appointments"}
          </button>
        ))}
      </nav>

      {/* Tab content area with animation */}
      <div className="relative p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
            {renderTabContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
