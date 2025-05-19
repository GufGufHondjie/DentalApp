import { useState } from "react";

interface NewPatientFormProps {
  onSuccess: () => void;
}

const NewPatientForm: React.FC<NewPatientFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    sedula_nr: "",
    phone_number: "",
    preferred_lang: "en",
    notes: "",
    address: "",
    date_of_birth: "",
    gender: "female",
  });

  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Registering...");

    try {
      const response = await fetch(
        "https://pdkdbmoxoauvcdppadde.functions.supabase.co/register-patient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            secret_token: import.meta.env.VITE_REGISTER_PATIENT_SECRET,
            ...form,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unknown error");
      }

      setStatus("Patient registered successfully!");
      setForm({
        email: "",
        password: "",
        full_name: "",
        sedula_nr: "",
        phone_number: "",
        preferred_lang: "en",
        notes: "",
        address: "",
        date_of_birth: "",
        gender: "female",
      });

      onSuccess(); // ✅ Notify parent
    } catch (err: any) {
      setStatus("Registration failed: " + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Register New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="sedula_nr"
          value={form.sedula_nr}
          onChange={handleChange}
          placeholder="Sedula Number"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-[#01a695] text-white py-2 rounded hover:bg-[#018f84] transition-colors"
        >
          Register Patient
        </button>
      </form>
      {status && <p className="text-sm mt-4">{status}</p>}
    </div>
  );
};

export default NewPatientForm;
