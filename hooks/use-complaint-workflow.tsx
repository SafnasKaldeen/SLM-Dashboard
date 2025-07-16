import React, { useState } from "react";
import type {
  ComplaintFormInput,
  ComplaintCategory,
  ComplaintPriority,
} from "../ComplainCrew/types/complaint-types";

type ComplaintFormProps = {
  onSubmit: (data: ComplaintFormInput) => void;
  isProcessing: boolean;
};

const complaintCategories: ComplaintCategory[] = [
  "technical",
  "billing",
  "service",
  "general",
];
const complaintPriorities: ComplaintPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export function ComplaintForm({ onSubmit, isProcessing }: ComplaintFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ComplaintCategory>("technical");
  const [priority, setPriority] = useState<ComplaintPriority>("low");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, type, priority });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isProcessing}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={isProcessing}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ComplaintCategory)}
        disabled={isProcessing}
      >
        {complaintCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
        disabled={isProcessing}
      >
        {complaintPriorities.map((pri) => (
          <option key={pri} value={pri}>
            {pri.charAt(0).toUpperCase() + pri.slice(1)}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
