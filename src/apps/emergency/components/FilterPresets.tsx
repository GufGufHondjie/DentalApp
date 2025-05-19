// src/components/FilterPresets.tsx

/**
 * FilterPresets Component
 *
 * Allows authenticated users to:
 * ✅ Save current filter combinations
 * ✅ Load a previously saved preset
 * ✅ Delete one of their own presets
 * ✅ See which preset is currently active
 *
 * Props:
 * - userId: logged-in user's Supabase ID
 * - filters: current filter state
 * - onLoadPreset: function to apply a loaded preset
 * - onClearFilters: function to reset filter state
 */

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

interface Preset {
  id: string;
  name: string;
  urgency: string | null;
  preferred_time: string | null;
  availability: string | null;
  status: string | null;
}

interface FilterPresetsProps {
  userId: string;
  filters: {
    urgency: string;
    preferredTime: string;
    availability: string;
    status: string;
  };
  onLoadPreset: (preset: Preset) => void;
  onClearFilters: () => void;
}

const FilterPresets: React.FC<FilterPresetsProps> = ({
  userId,
  filters,
  onLoadPreset,
  onClearFilters,
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");

  // Load user's presets from Supabase
  const fetchPresets = async () => {
    const { data, error } = await supabase
      .from("filter_presets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setPresets(data);
    } else {
      console.error("❌ Error loading presets:", error.message);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPresets();
    }
  }, [userId]);

  // Save current filter values as a new preset
  const savePreset = async () => {
    if (!newName.trim()) return;

    const { data, error } = await supabase
      .from("filter_presets")
      .insert([
        {
          user_id: userId,
          name: newName.trim(),
          urgency: filters.urgency || null,
          preferred_time: filters.preferredTime || null,
          availability: filters.availability || null,
          status: filters.status || null,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Error saving preset:", error.message);
      return;
    }

    if (data && data.length > 0) {
      const newPreset = data[0];
      setPresets((prev) => [newPreset, ...prev]);
      setSelectedPresetId(newPreset.id);
      onLoadPreset(newPreset);
      setNewName("");
    }
  };

  // Delete selected preset
  const deletePreset = async (id: string) => {
    await supabase.from("filter_presets").delete().eq("id", id);
    setPresets((prev) => prev.filter((p) => p.id !== id));

    if (selectedPresetId === id) {
      setSelectedPresetId("");
      onClearFilters();
    }
  };

  // Apply selected preset to filters
  const handleLoad = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      setSelectedPresetId(id);
      onLoadPreset(preset);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">Saved Filter Presets</h2>

      <div className="flex flex-wrap gap-4 items-end">
        <select
          value={selectedPresetId}
          onChange={(e) => handleLoad(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">-- Load Preset --</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>

        <button
          onClick={onClearFilters}
          className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400 transition"
        >
          Clear Filters
        </button>

        <button
          disabled={!selectedPresetId}
          onClick={() => deletePreset(selectedPresetId)}
          className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Delete Preset
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New preset name"
          className="border p-2 rounded w-full max-w-xs"
        />
        <button
          onClick={savePreset}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition text-sm"
        >
          Save Preset
        </button>
      </div>
    </div>
  );
};

export default FilterPresets;
