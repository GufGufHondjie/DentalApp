import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import FilterPanel from "./components/FilterPanel";
import PatientTable from "./components/PatientTable";
import AddEmergencyModal from "./components/AddEmergencyModal";
import LogContactForm from "./components/LogContactForm";
import ScheduleAppointmentModal from "./components/ScheduleAppointmentModal";
import type { FilterPreset } from "./types";

interface Patient {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  preferred_time: string[] | string;
  availability: string[];
  reason: string;
  triage_level?: string;
  scheduled_time?: string;
  preferred_dentist?: string;
}

function App() {
  const [user, setUser] = useState<any>(undefined);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [preferredTime, setPreferredTime] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [triageLevel, setTriageLevel] = useState("");
  const [preferredDentist, setPreferredDentist] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [openFormFor, setOpenFormFor] = useState<string | null>(null);
  const [contactCounts, setContactCounts] = useState<Record<string, number>>({});
  const [contactLogsByPatient, setContactLogsByPatient] = useState<Record<string, any[]>>({});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);
  const [scheduleModalPatient, setScheduleModalPatient] = useState<Patient | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from("patients").select("*, user_id");
    if (!error) setPatients(data);
    else console.error("❌ Error fetching patients:", error.message);
  };

  const fetchContactLogs = async () => {
    const { data, error } = await supabase.from("contact_logs").select("*");
    if (!error) {
      const counts: Record<string, number> = {};
      const logs: Record<string, any[]> = {};
      data.forEach((log) => {
        if (!counts[log.patient_id]) counts[log.patient_id] = 0;
        counts[log.patient_id]++;
        if (!logs[log.patient_id]) logs[log.patient_id] = [];
        logs[log.patient_id].push(log);
      });
      setContactCounts(counts);
      setContactLogsByPatient(logs);
    } else {
      console.error("❌ Error fetching contact logs:", error.message);
    }
  };

  const fetchPresets = async () => {
    const { data, error } = await supabase.from("filter_presets").select("*");
    if (!error) setSavedPresets(data);
  };

  const savePreset = async () => {
    const name = prompt("Enter a name for this preset:");
    if (!name) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("You must be logged in to save presets.");
      return;
    }

    const { error: insertError } = await supabase.from("filter_presets").insert({
      name,
      filters: {
        preferredTime,
        availability,
        status,
        triageLevel,
        preferredDentist,
      },
      user_id: user.id,
    });

    if (insertError) {
      console.error("❌ Error saving preset:", insertError.message);
      alert("Error saving preset: " + insertError.message);
      return;
    }

    await fetchPresets();
  };

  const deletePreset = async (id: string) => {
    const { error } = await supabase.from("filter_presets").delete().eq("id", id);
    if (!error) {
      setSavedPresets(savedPresets.filter((p) => p.id !== id));
      if (id === loadedPresetId) clearFilters();
    }
  };

  const applyPreset = (preset: FilterPreset) => {
    const preferred = preset.filters.preferredTime;
    const avail = preset.filters.availability;
    setPreferredTime(preferred ? (Array.isArray(preferred) ? preferred : [preferred]) : []);
    setAvailability(avail ? (Array.isArray(avail) ? avail : [avail]) : []);
    setStatus(preset.filters.status || "");
    setTriageLevel(preset.filters.triageLevel || "");
    setPreferredDentist(preset.filters.preferredDentist || "");
    setLoadedPresetId(preset.id);
  };

  const clearFilters = () => {
    setPreferredTime([]);
    setAvailability([]);
    setStatus("");
    setTriageLevel("");
    setPreferredDentist("");
    setLoadedPresetId(null);
  };

  const onMarkScheduled = (userId: string) => {
    const patient = patients.find((p) => p.user_id === userId);
    if (patient) {
      setScheduleModalPatient(patient);
    } else {
      console.warn("❌ No patient found with user_id:", userId);
    }
  };

  const onDeleteScheduled = async (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;
    const { error: archiveError } = await supabase.from("archived_patients").insert(patient);
    if (!archiveError) {
      await supabase.from("patients").delete().eq("id", id);
      fetchPatients();
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchContactLogs();
      fetchPresets();
    }
  }, [user]);

  if (user === undefined) {
    return <div className="p-8 text-gray-500">Checking session...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="w-full max-w-md">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              view="sign_in"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-sm">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Emergency List</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#01a695] text-white text-sm font-medium px-4 py-2 rounded hover:bg-[#018f84] transition-colors"
          >
            ➕ Add Emergency
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <select
            value={loadedPresetId || ""}
            onChange={(e) => {
              const preset = savedPresets.find((p) => p.id === e.target.value);
              if (preset) applyPreset(preset);
            }}
            className="p-2 border rounded text-sm"
          >
            <option value="">🔽 Load Filter</option>
            {savedPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          <button
            onClick={savePreset}
            className="bg-[#01a695] text-white text-xs font-medium px-3 py-1 rounded hover:bg-[#018f84] transition-colors"
          >
            💾 Save Preset
          </button>

          {loadedPresetId && (
            <button
              onClick={() => deletePreset(loadedPresetId)}
              className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              🗑️ Delete Preset
            </button>
          )}
        </div>

        <FilterPanel
          preferredTime={preferredTime}
          availability={availability}
          status={status}
          triageLevel={triageLevel}
          preferredDentist={preferredDentist}
          setPreferredTime={setPreferredTime}
          setAvailability={setAvailability}
          setStatus={setStatus}
          setTriageLevel={setTriageLevel}
          setPreferredDentist={setPreferredDentist}
          onClear={clearFilters}
        />

        <div className="mt-6">
          <PatientTable
            patients={patients}
            contactCounts={contactCounts}
            contactLogsByPatient={contactLogsByPatient}
            filters={{
              preferredTime,
              availability,
              status,
              triageLevel,
              preferredDentist,
            }}
            openFormFor={openFormFor}
            setOpenFormFor={setOpenFormFor}
            onMarkScheduled={onMarkScheduled}
            onDeleteScheduled={onDeleteScheduled}
            onContactLogged={fetchContactLogs}
            LogContactForm={LogContactForm}
          />
        </div>
      </main>

      <AddEmergencyModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={() => {
          setShowAddModal(false);
          fetchPatients();
        }}
      />

      {scheduleModalPatient && (
        <ScheduleAppointmentModal
          visible={!!scheduleModalPatient}
          onClose={() => {
            setScheduleModalPatient(null);
            fetchPatients();
          }}
          patient={scheduleModalPatient}
        />
      )}
    </div>
  );
}

export default App;
