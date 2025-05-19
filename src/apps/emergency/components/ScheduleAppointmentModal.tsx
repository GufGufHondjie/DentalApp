import { supabase } from "../../../supabaseClient";
import AppointmentSchedulerApp from "../../AppointmentScheduler/App";

interface ScheduleAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  patient: {
    id: string; // this is patients.id
    user_id: string; // this is the actual id used in patient_data
    name: string;
    phone: string;
    reason?: string;
  };
}

export default function ScheduleAppointmentModal({
  visible,
  onClose,
  patient,
}: ScheduleAppointmentModalProps) {
  if (!visible) return null;

  const handleSuccess = async (appointment: { appointment_time: string }) => {
    const { error } = await supabase
      .from("patients")
      .update({ scheduled_time: appointment.appointment_time })
      .eq("id", patient.id);

    if (error) {
      alert("Failed to update patient scheduled status. Please try again.");
    }

    onClose(); // triggers fetchPatients() in parent
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✖
        </button>
        <AppointmentSchedulerApp
          prefill={{
            patientId: patient.user_id,
            patientName: patient.name,
            patientPhone: patient.phone,
            reason: patient.reason || "",
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
