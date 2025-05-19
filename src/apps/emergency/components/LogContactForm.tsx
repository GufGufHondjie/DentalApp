// src/components/LogContactForm.tsx

/**
 * LogContactForm Component
 *
 * Allows staff to log a new contact attempt for a patient.
 * Styled to fit compactly inside a table row without overwhelming layout.
 *
 * Props:
 * - patientId: ID of the patient to log for
 * - onClose: callback to close the form
 * - onContactLogged: callback to refresh patient data after logging
 */

import { useState } from "react";
import { supabase } from "../../../supabaseClient";

interface LogContactFormProps {
  patientId: string;
  onClose: () => void;
  onContactLogged: () => void;
}

const LogContactForm: React.FC<LogContactFormProps> = ({
  patientId,
  onClose,
  onContactLogged,
}) => {
  const [method, setMethod] = useState("Phone");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      alert("Please enter notes.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contact_logs").insert({
      patient_id: patientId,
      method,
      notes,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      alert("Error logging contact: " + error.message);
    } else {
      setNotes("");
      onClose();
      onContactLogged();
    }
  };

  return (
    <div className="mt-2 w-full max-w-md text-sm bg-white text-black border border-gray-200 rounded p-2 shadow-sm">
      <div className="mb-2">
        <label className="block font-medium mb-1">Contact Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border rounded px-2 py-1 bg-white text-black"
        >
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="SMS">SMS</option>
          <option value="Email">Email</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded px-2 py-1 bg-white text-black"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#01a695] text-white text-sm px-3 py-1 rounded hover:bg-[#018f84]"
        >
          {loading ? "Saving..." : "Log Contact"}
        </button>
      </div>
    </div>
  );
};

export default LogContactForm;
