import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Combobox } from "@headlessui/react";
import { format } from "date-fns";
import AppointmentOverviewModal from "./AppointmentOverviewModal"; // ✅ UPDATED IMPORT

interface Patient {
  id: string;
  full_name: string;
  phone_number: string;
}

interface Props {
  prefill?: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    reason?: string;
  };
  onSuccess?: (appointment: { appointment_time: string }) => void;
}

export default function AppointmentSchedulerApp({ prefill, onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [query, setQuery] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastScheduledTime, setLastScheduledTime] = useState<string | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [showOverview, setShowOverview] = useState(false); // ✅ MODAL TOGGLE

  useEffect(() => {
    supabase
      .from("patient_data")
      .select("id, full_name, phone_number")
      .then(({ data, error }) => {
        if (error) {
          console.error("[FETCH] Error fetching patients:", error);
        } else if (data) {
          setPatients(data);

          if (prefill && !prefillApplied) {
            const match = data.find((p) => p.id === prefill.patientId);
            if (match) {
              setSelectedPatient(match);
              setQuery(match.full_name);
              setPrefillApplied(true);
            } else {
              console.warn("[PREFILL] No matching patient found for ID:", prefill.patientId);
            }
            if (prefill.reason && notes.trim() === "") {
              setNotes(prefill.reason);
            }
          }
        }
      });
  }, [prefill, prefillApplied, notes]);

  const filteredPatients =
    query === ""
      ? patients
      : patients.filter((p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !appointmentTime) return;

    setSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      patient_id: selectedPatient.id,
      appointment_time: new Date(appointmentTime).toISOString(),
      location,
      notes,
    });

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
      setLastScheduledTime(appointmentTime);

      setSelectedPatient(null);
      setAppointmentTime("");
      setLocation("");
      setNotes("");
      setQuery("");
      setPrefillApplied(false);

      if (onSuccess) {
        onSuccess({ appointment_time: new Date(appointmentTime).toISOString() });
      }
    } else {
      alert("Error adding appointment: " + error.message);
    }
  };

  useEffect(() => {
    if (success && !onSuccess) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setLastScheduledTime(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, onSuccess]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Schedule Appointment</h1>

      <button
        onClick={() => setShowOverview(true)}
        className="mb-4 bg-[#01a695] hover:bg-[#018f84] text-white text-sm px-4 py-2 rounded"
      >
        📅 View Appointments
      </button>

      {showOverview && (
        <AppointmentOverviewModal visible={true} onClose={() => setShowOverview(false)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Select Patient</label>
          <Combobox value={selectedPatient} onChange={setSelectedPatient} by="id">
            <div className="relative">
              <Combobox.Input
                className="w-full border rounded px-3 py-2"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(person: Patient) => person?.full_name || ""}
                placeholder="Search patient..."
              />
              <Combobox.Options className="absolute z-10 w-full border rounded bg-white shadow mt-1 max-h-60 overflow-y-auto">
                {filteredPatients.map((p) => (
                  <Combobox.Option
                    key={p.id}
                    value={p}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {p.full_name} ({p.phone_number})
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        <div>
          <label className="block font-medium mb-1">Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Location (optional)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Notes (optional)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Add Appointment"}
        </button>

        <button
          onClick={async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
              alert("Error: " + error.message);
            } else {
              alert("Your user ID is: " + data?.user?.id);
              console.log("Logged in user ID:", data?.user?.id);
            }
          }}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded text-sm"
        >
          🧪 Show My User ID
        </button>

        {success && lastScheduledTime && (
          <div className="text-green-600 mt-2">
            Appointment scheduled for{" "}
            <span className="font-semibold">
              {format(new Date(lastScheduledTime), "PPpp")}
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
