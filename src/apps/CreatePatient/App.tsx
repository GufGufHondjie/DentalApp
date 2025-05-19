import NewPatientForm from "./NewPatientForm";

export default function CreatePatientApp({ onSuccess }: { onSuccess?: () => void }) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess(); // ✅ use external callback
    } else {
      alert("New patient registered successfully!"); // ✅ fallback
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register New Patient</h1>
      <NewPatientForm onSuccess={handleSuccess} />
    </div>
  );
}
