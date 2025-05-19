import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { Combobox } from "@headlessui/react";
import NewPatientForm from "../../CreatePatient/NewPatientForm";

interface AddEmergencyModalProps {
  visible: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddEmergencyModal: React.FC<AddEmergencyModalProps> = ({
  visible,
  onClose,
  onPatientAdded,
}) => {
  const [registeredPatients, setRegisteredPatients] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    phone: "",
    reason: "",
    preferred_time: [] as string[],
    availability: [] as string[],
    preferred_dentist: "",
    existing_patient: false,
    pain: 0,
    symptom: 0,
    systemic: 0,
    triage_level: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from("patient_data").select("id, full_name, phone_number");
    if (!error) setRegisteredPatients(data || []);
  };

  const filteredPatients =
    query === ""
      ? registeredPatients
      : registeredPatients.filter((p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase())
        );

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patient: any) => {
    setForm((prev) => ({
      ...prev,
      user_id: patient.id,
      name: patient.full_name,
      phone: patient.phone_number,
    }));
  };

  const toggleAvailability = (day: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  };

  const togglePreferredTime = (time: string) => {
    setForm((prev) => ({
      ...prev,
      preferred_time: prev.preferred_time.includes(time)
        ? prev.preferred_time.filter((t) => t !== time)
        : [...prev.preferred_time, time],
    }));
  };

  useEffect(() => {
    const score =
      Number(form.pain) +
      Number(form.symptom) +
      Number(form.systemic) +
      (form.existing_patient ? 1 : 0);

    let level = "";
    if (score >= 6) level = "1";
    else if (score >= 4) level = "2";
    else if (score === 3) level = "3";
    else if (score === 2) level = "4";
    else level = "5";

    setForm((prev) => ({ ...prev, triage_level: level }));
  }, [form.pain, form.symptom, form.systemic, form.existing_patient]);

  const handleSubmit = async () => {
    if (!form.user_id || !form.name || !form.phone || !form.reason) {
      alert("Please fill in all required fields.");
      return;
    }

    const triage_score =
      Number(form.pain) +
      Number(form.symptom) +
      Number(form.systemic) +
      (form.existing_patient ? 1 : 0);

    const { error } = await supabase
      .from("patients")
      .insert({
        user_id: form.user_id,
        name: form.name,
        phone: form.phone,
        reason: form.reason,
        preferred_time: form.preferred_time,
        availability: form.availability,
        preferred_dentist: form.preferred_dentist,
        existing_patient: form.existing_patient ? 1 : 0,
        pain_level: form.pain,
        symptom_score: form.symptom,
        systemic_risk_score: form.systemic,
        triage_level: form.triage_level,
        triage_score,
      })
      .select();

    if (error) {
      alert("Error adding patient: " + error.message);
    } else {
      setForm({
        user_id: "",
        name: "",
        phone: "",
        reason: "",
        preferred_time: [],
        availability: [],
        preferred_dentist: "",
        existing_patient: false,
        pain: 0,
        symptom: 0,
        systemic: 0,
        triage_level: "",
      });
      onPatientAdded();
    }
  };

  const handlePatientRegistered = async () => {
    setShowRegisterModal(false);
    await fetchPatients();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl relative">
        <h2 className="text-lg font-semibold mb-4">➕ Add Emergency Patient</h2>

        <div className="space-y-3">
          <div>
            <label className="block font-medium text-sm mb-1">Select Registered Patient</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox value={form.user_id} onChange={(id) => {
                  const patient = registeredPatients.find((p) => p.id === id);
                  if (patient) handlePatientSelect(patient);
                }}>
                  <div className="relative">
                    <Combobox.Input
                      className="w-full border rounded p-2"
                      onChange={(e) => setQuery(e.target.value)}
                      displayValue={(id: string) => registeredPatients.find(p => p.id === id)?.full_name || ""}
                      placeholder="Type to search..."
                    />
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border text-sm">
                      {filteredPatients.length === 0 && query !== "" ? (
                        <div className="px-4 py-2 text-gray-500">No match found</div>
                      ) : (
                        filteredPatients.map((p) => (
                          <Combobox.Option
                            key={p.id}
                            value={p.id}
                            className={({ active }) =>
                              `cursor-pointer px-4 py-2 ${active ? "bg-[#01a695] text-white" : "text-gray-900"}`
                            }
                          >
                            {p.full_name}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="bg-[#01a695] text-white px-4 py-2 rounded hover:bg-[#018f84] text-sm"
              >
                + Add Patient
              </button>
            </div>
          </div>

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full border rounded p-2"
            disabled
          />

          <textarea
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className="w-full border rounded p-2"
          />

          <div>
            <label className="block font-medium text-sm mb-1">Preferred Time</label>
            <div className="flex gap-4 text-sm">
              {["morning", "afternoon"].map((time) => (
                <label key={time} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.preferred_time.includes(time)}
                    onChange={() => togglePreferredTime(time)}
                  />
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Availability</label>
            <div className="flex flex-wrap gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                <label key={day} className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.availability.includes(day)}
                    onChange={() => toggleAvailability(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Pain Severity</label>
            <select
              value={form.pain}
              onChange={(e) => handleChange("pain", Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={0}>No pain or mild discomfort (0)</option>
              <option value={1}>Moderate, persistent pain (1)</option>
              <option value={2}>Severe, throbbing pain (2)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Symptom Type</label>
            <select
              value={form.symptom}
              onChange={(e) => handleChange("symptom", Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={0}>Filling/cosmetic/minor chip (0)</option>
              <option value={1}>Broken tooth, mild swelling (1)</option>
              <option value={2}>Swelling, exposed pulp (2)</option>
              <option value={3}>Facial swelling, fever, airway (3)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Systemic Involvement</label>
            <select
              value={form.systemic}
              onChange={(e) => handleChange("systemic", Number(e.target.value))}
              className="w-full border rounded p-2"
            >
              <option value={0}>None (0)</option>
              <option value={1}>Mild fever / immunocompromised (1)</option>
              <option value={2}>High fever / airway concern (2)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.existing_patient}
              onChange={(e) => handleChange("existing_patient", e.target.checked)}
            />
            Existing patient?
          </label>

          <div className="text-sm text-gray-500">
            Calculated Triage Level: <strong>{form.triage_level}</strong>
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Preferred Dentist</label>
            <select
              value={form.preferred_dentist}
              onChange={(e) => handleChange("preferred_dentist", e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Dentist</option>
              <option value="Nerea">Nerea</option>
              <option value="Tamara">Tamara</option>
              <option value="Juley-Ann">Juley-Ann</option>
              <option value="Dominique">Dominique</option>
              <option value="Elia">Elia</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-gray-600 hover:underline text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#01a695] text-white px-4 py-2 rounded hover:bg-[#018f84] text-sm"
          >
            Save
          </button>
        </div>

        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
              <NewPatientForm onSuccess={handlePatientRegistered} />
              <button
                onClick={() => setShowRegisterModal(false)}
                className="mt-4 text-sm text-gray-600 hover:underline"
              >
                ← Back to Emergency Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmergencyModal;
