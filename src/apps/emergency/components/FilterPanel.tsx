/**
 * FilterPanel Component
 *
 * Displays a set of filters to narrow down the patient list based on various criteria.
 * Allows multi-select options for preferred time and availability.
 * Includes dropdowns for status, triage level, and preferred dentist.
 *
 * Props:
 * - preferredTime: selected preferred time slots
 * - availability: selected available days
 * - status: filter by 'waiting', 'scheduled', or ''
 * - triageLevel: filter by urgency level (1-5)
 * - preferredDentist: filter by assigned dentist
 * - setPreferredTime, setAvailability, setStatus, setTriageLevel, setPreferredDentist: setter functions
 * - onClear: clears all filters
 */

import React from "react";

interface FilterPanelProps {
  preferredTime: string[];
  availability: string[];
  status: string;
  triageLevel: string;
  preferredDentist: string;
  setPreferredTime: (value: string[]) => void;
  setAvailability: (value: string[]) => void;
  setStatus: (value: string) => void;
  setTriageLevel: (value: string) => void;
  setPreferredDentist: (value: string) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  preferredTime,
  availability,
  status,
  triageLevel,
  preferredDentist,
  setPreferredTime,
  setAvailability,
  setStatus,
  setTriageLevel,
  setPreferredDentist,
  onClear,
}) => {
  const togglePreferredTime = (time: string) => {
    setPreferredTime(
      preferredTime.includes(time)
        ? preferredTime.filter((t) => t !== time)
        : [...preferredTime, time]
    );
  };

  const toggleAvailability = (day: string) => {
    setAvailability(
      availability.includes(day)
        ? availability.filter((d) => d !== day)
        : [...availability, day]
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-wrap gap-4 text-sm">
      {/* Preferred Time Filter */}
      <div>
        <label className="block font-medium mb-1">Preferred Time</label>
        <div className="flex gap-2">
          {["morning", "afternoon"].map((time) => (
            <label key={time} className="flex items-center gap-1 capitalize">
              <input
                type="checkbox"
                checked={preferredTime.includes(time)}
                onChange={() => togglePreferredTime(time)}
              />
              {time}
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <label className="block font-medium mb-1">Availability</label>
        <div className="flex flex-wrap gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
            <label key={day} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={availability.includes(day)}
                onChange={() => toggleAvailability(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All</option>
          <option value="waiting">Waiting</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Triage Level Filter */}
      <div>
        <label className="block font-medium mb-1">Triage Level</label>
        <select
          value={triageLevel}
          onChange={(e) => setTriageLevel(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All</option>
          <option value="1">Level 1 - Critical</option>
          <option value="2">Level 2 - Urgent</option>
          <option value="3">Level 3 - Semi-Urgent</option>
          <option value="4">Level 4 - Low Urgency</option>
          <option value="5">Level 5 - Routine</option>
        </select>
      </div>

      {/* Dentist Filter */}
      <div>
        <label className="block font-medium mb-1">Preferred Dentist</label>
        <select
          value={preferredDentist}
          onChange={(e) => setPreferredDentist(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All</option>
          <option value="Nerea">Nerea</option>
          <option value="Tamara">Tamara</option>
          <option value="Juley-Ann">Juley-Ann</option>
          <option value="Dominique">Dominique</option>
          <option value="Elia">Elia</option>
        </select>
      </div>

      {/* Clear Filter Button */}
      <div className="flex items-end">
        <button
          onClick={onClear}
          className="bg-gray-100 border text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
