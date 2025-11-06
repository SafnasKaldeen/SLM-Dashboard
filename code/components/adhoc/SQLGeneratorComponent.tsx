import React, { useState } from "react";
import { useGenerateSQL } from "@/hooks/useGenerateSQL";

export function SQLGeneratorComponent() {
  const [queryInput, setQueryInput] = useState("");
  const { sql, loading, error, responses } = useGenerateSQL(queryInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The hook will automatically run when `queryInput` changes,
    // so just updating state triggers it
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <label htmlFor="query" className="block mb-2 font-semibold">
          Enter your natural language query:
        </label>
        <input
          id="query"
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          className="border rounded px-2 py-1 w-full mb-4"
          placeholder="e.g., List top 5 products by sales"
        />
        <button
          type="submit"
          disabled={loading || !queryInput.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Generate SQL
        </button>
      </form>

      {loading && <p className="mt-4 text-yellow-500">Generating SQL...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {sql && (
        <div className="mt-6 p-4 bg-gray-800 text-white rounded">
          <h3 className="font-semibold mb-2">Generated SQL:</h3>
          <pre className="whitespace-pre-wrap">{sql}</pre>
        </div>
      )}

      {responses.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Agent Responses:</h3>
          <ul className="space-y-4 max-h-64 overflow-y-auto bg-gray-900 p-4 rounded text-sm">
            {responses.map(({ step, data }, idx) => (
              <li key={idx}>
                <strong>{step}:</strong>{" "}
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
