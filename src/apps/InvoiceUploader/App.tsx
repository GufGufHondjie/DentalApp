import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function InvoiceUploader() {
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    supabase
      .from("patient_data")
      .select("id, email")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading users:", error.message);
        } else if (data) {
          setUsers(data);
        }
      });
  }, []);

  const handleUpload = async () => {
    setStatus("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Inserting invoice as user:", user?.id, user?.email);

    if (!selectedUser || !file) {
      setStatus("Please select a user and a file.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `pdfs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setStatus("Upload failed: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    console.log("Insert payload:", {
      patient_id: selectedUser,
      file_url: fileUrl,
      description: file.name,
    });

    const { error: insertError } = await supabase.from("invoices").insert([
      {
        patient_id: selectedUser,
        file_url: fileUrl,
        description: file.name,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setStatus("Failed to save record: " + insertError.message);
    } else {
      setStatus("✅ Invoice uploaded successfully.");
      setSelectedUser("");
      setFile(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload Invoice PDF</h2>

      <label className="block mb-2">Select user:</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">-- Choose user --</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.email}
          </option>
        ))}
      </select>

      <label className="block mb-2">Upload PDF:</label>
      <input
        type="file"
        accept="application/pdf"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
