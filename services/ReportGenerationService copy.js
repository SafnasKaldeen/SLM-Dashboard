import fetch from "node-fetch";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set. Please provide a valid API key.");
}

/**
 * Sends a prompt to Groq LLM and returns raw SQL string response
 * @param {string} prompt - The generated SQL prompt for LLM
 * @returns {Promise<string>} - Raw SQL query string from LLM
 */
export async function ReportGenerationService(prompt) {
  const requestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  };

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API request failed with status ${response.status}`);
    }

    let rawText = await response.text();

    // Remove any code fences like ``` or ```json
    rawText = rawText.replace(/```json\n?|```/g, "").trim();

    // Parse the outer JSON response from Groq API
    const data = JSON.parse(rawText);

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Groq API response missing choices or content");
    }

    // Return raw SQL text (string) from LLM response
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error; // propagate error to caller
  }
}
