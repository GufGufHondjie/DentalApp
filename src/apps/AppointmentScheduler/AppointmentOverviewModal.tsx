import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { format } from "date-fns";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  location?: string;
  notes?: string;
  patient_data?: {
    full_name: string;
  };
}

interface Patient {
  id: string;
  full_name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AppointmentOverviewModal({ visible, onClose }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (!visible) return;

    console.log("[LOAD] Fetching appointments and patients...");

    supabase
      .from("appointments")
      .select("*, patient_data(full_name)")
      .then(({ data, error }) => {
        if (error) {
          console.error("[ERROR] Fetching appointments:", error.message);
        } else {
          console.log("[OK] Appointments fetched:", data);
          setAppointments(data || []);
        }
      });

    supabase
      .from("patient_data")
      .select("id, full_name")
      .then(({ data, error }) => {
        if (error) {
          console.error("[ERROR] Fetching patients:", error.message);
        } else {
          console.log("[OK] Patients fetched:", data);
          setPatients(data || []);
        }
      });

    // Auth checks
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("[AUTH ERROR] getUser failed:", error.message);
      } else {
        console.log("[AUTH] Logged-in user ID:", data?.user?.id);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("[AUTH ERROR] getSession failed:", error.message);
      } else {
        console.log("[AUTH] Access token being used:", data?.session?.access_token);
      }
    });
  }, [visible]);

  const filteredAppointments = appointments.filter((appt) => {
    const matchesPatient = selectedPatient ? appt.patient_id === selectedPatient : true;
    const matchesDate = selectedDate ? appt.appointment_time.startsWith(selectedDate) : true;
    return matchesPatient && matchesDate;
  });

  const deleteAppointment = async (id: string) => {
    console.log("[DELETE] Attempting to delete appointment ID:", id);

    const { data: userData } = await supabase.auth.getUser();
    console.log("[DEBUG] Current user attempting delete:", userData?.user?.id);

    const { data: sessionData } = await supabase.auth.getSession();
    console.log("[DEBUG] Current access token:", sessionData?.session?.access_token);

    const { error, status } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.error("[DELETE ERROR] Failed to delete appointment:", error.message, error);
      alert("Failed to delete appointment: " + error.message);
    } else {
      console.log("[DELETE SUCCESS] Status:", status);
      console.log("[DELETE] Filtering out deleted appointment from state.");
      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
    }

    // Also log current appointments for debug
    console.log("[STATE] Appointments after delete attempt:", appointments);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Appointment Overview</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="p-2 border rounded text-sm w-full sm:w-auto"
          >
            <option value="">Filter by Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded text-sm"
          />
        </div>

        <ul className="divide-y">
          {filteredAppointments.map((appt) => (
            <li key={appt.id} className="py-3 flex justify-between items-start">
              <div>
                <div className="font-semibold">
                  {appt.patient_data?.full_name || "Unknown"}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(appt.appointment_time), "PPpp")}
                  <br />
                  {appt.location || "No location"} – {appt.notes || "No notes"}
                </div>
              </div>
              <button
                onClick={() => deleteAppointment(appt.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
              >
                Delete
              </button>
            </li>
          ))}

          {filteredAppointments.length === 0 && (
            <li className="text-sm text-gray-500 py-4 text-center">
              No appointments found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
