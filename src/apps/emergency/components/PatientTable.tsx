/**
 * PatientTable Component
 *
 * Renders a responsive and styled table of patients with filtering, contact info, triage score, and action buttons.
 * Now includes:
 * - Sticky headers
 * - Zebra striping
 * - Responsive text sizing
 * - Touch-friendly spacing on mobile
 * - Row-based triage color
 * - Triage level + score display
 */

import React from "react";
import { Info } from "lucide-react";
import Tooltip from "./Tooltip";

interface Patient {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  preferred_time: string[] | string;
  availability: string[];
  reason: string;
  triage_level?: string;
  triage_score?: number;
  scheduled_time?: string;
  preferred_dentist?: string;
}

interface PatientTableProps {
  patients: Patient[];
  contactCounts: Record<string, number>;
  contactLogsByPatient: Record<string, any[]>;
  filters: {
    preferredTime: string[];
    availability: string[];
    status: string;
    triageLevel?: string;
    preferredDentist?: string;
  };
  openFormFor: string | null;
  setOpenFormFor: (id: string | null) => void;
  onMarkScheduled: (id: string) => void;
  onDeleteScheduled: (id: string) => void;
  onContactLogged: () => void;
  LogContactForm: React.FC<{
    patientId: string;
    onClose: () => void;
    onContactLogged: () => void;
  }>;
}

const triageColor = (level: string | undefined) => {
  switch (level) {
    case "1":
      return "bg-red-700 text-white";
    case "2":
      return "bg-red-500 text-white";
    case "3":
      return "bg-yellow-400 text-black";
    case "4":
      return "bg-green-300 text-black";
    case "5":
      return "bg-green-100 text-black";
    default:
      return "";
  }
};

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  contactCounts,
  contactLogsByPatient,
  filters,
  openFormFor,
  setOpenFormFor,
  onMarkScheduled,
  onDeleteScheduled,
  onContactLogged,
  LogContactForm,
}) => {
  const filtered = patients.filter((p) => {
    const matchesPreferredTime =
      filters.preferredTime.length === 0 ||
      filters.preferredTime.some((time) =>
        Array.isArray(p.preferred_time)
          ? p.preferred_time.includes(time)
          : p.preferred_time === time
      );

    const matchesAvailability =
      filters.availability.length === 0 ||
      filters.availability.some((day) => p.availability.includes(day));

    const matchesStatus =
      !filters.status ||
      (filters.status === "waiting" &&
        contactLogsByPatient[p.id]?.length &&
        !p.scheduled_time) ||
      (filters.status === "scheduled" && p.scheduled_time);

    const matchesTriage =
      !filters.triageLevel || p.triage_level === filters.triageLevel;

    const matchesDentist =
      !filters.preferredDentist ||
      p.preferred_dentist === filters.preferredDentist;

    return (
      matchesPreferredTime &&
      matchesAvailability &&
      matchesStatus &&
      matchesTriage &&
      matchesDentist
    );
  });

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Preferred</th>
            <th className="px-3 py-2">Availability</th>
            <th className="px-3 py-2">Reason</th>
            <th className="px-3 py-2">Triage</th>
            <th className="px-3 py-2">Dentist</th>
            <th className="px-3 py-2 flex items-center gap-1">
              <span>Attempts</span>
              <Tooltip content="Hover to view full history">
                <Info size={14} className="text-gray-400" />
              </Tooltip>
            </th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((patient) => {
            const status = patient.scheduled_time
              ? "scheduled"
              : contactLogsByPatient[patient.id]?.length
              ? "waiting"
              : "";

            let preferredTimes: string[] = [];
            try {
              preferredTimes = Array.isArray(patient.preferred_time)
                ? patient.preferred_time
                : JSON.parse(patient.preferred_time);
            } catch {
              preferredTimes = [patient.preferred_time as string];
            }

            const displayPreferredTime = preferredTimes
              .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
              .join(", ");

            return (
              <tr
                key={patient.id}
                className={`even:bg-gray-50 hover:bg-blue-50 transition ${triageColor(
                  patient.triage_level
                )}`}
              >
                <td className="px-3 py-2 whitespace-nowrap">{patient.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{patient.phone}</td>
                <td className="px-3 py-2 whitespace-nowrap capitalize">
                  {displayPreferredTime}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {patient.availability?.join(", ")}
                </td>
                <td className="px-3 py-2 max-w-[200px] truncate">
                  {patient.reason}
                </td>
                <td className="px-3 py-2 font-semibold text-center">
                  {patient.triage_level || "-"}
                  {typeof patient.triage_score === "number" &&
                    ` (${patient.triage_score})`}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {patient.preferred_dentist}
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center items-center gap-1 relative group">
                    {contactCounts[patient.id] || 0}
                    {contactCounts[patient.id] > 0 && (
                      <span className="text-gray-400 text-xs">⋮</span>
                    )}
                    {contactLogsByPatient[patient.id] && (
                      <div className="absolute z-10 hidden group-hover:block bg-white shadow-lg rounded p-2 border w-64 text-xs text-gray-700">
                        <ul>
                          {contactLogsByPatient[patient.id].map((log, idx) => (
                            <li key={idx} className="mb-1">
                              📞 <strong>{log.method}</strong> –{" "}
                              {new Date(log.timestamp).toLocaleString()}
                              <br />
                              <span className="text-gray-500">{log.notes}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-center capitalize">
                  {status === "scheduled"
                    ? new Date(patient.scheduled_time!).toLocaleString()
                    : status === "waiting"
                    ? "waiting"
                    : ""}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setOpenFormFor(patient.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Log Contact
                    </button>
                    {status === "waiting" && (
                      <button
                        onClick={() => onMarkScheduled(patient.user_id)}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Mark as Scheduled
                      </button>
                    )}
                    {status === "scheduled" && (
                      <button
                        onClick={() => onDeleteScheduled(patient.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {openFormFor === patient.id && (
                    <div className="mt-2">
                      <LogContactForm
                        patientId={patient.id}
                        onClose={() => setOpenFormFor(null)}
                        onContactLogged={onContactLogged}
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
