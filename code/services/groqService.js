import fetch from "node-fetch"; // Ensure node-fetch is installed
import { generateGroqPrompt } from "../Prompts/groqPrompt";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set. Please provide a valid API key.");
}

export async function getGroqChatCompletion(endpoints) {
  const prompt = generateGroqPrompt(endpoints); // Ensure this uses the fixed version
  // return prompt;
  const groqRequestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  };

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(groqRequestBody),
      }
    );
    
    if (!groqResponse.ok) {
      throw new Error(
        `Groq API request failed with status ${groqResponse.status}`
      );
    }

    // Get the raw response text
    let rawResponse = await groqResponse.text();
    // console.log("Raw Groq Response:", rawResponse);

    // ✅ Strip Markdown code block formatting (` ```json ... ``` `)
    rawResponse = rawResponse.replace(/```json\n?|```/g, "").trim();

    // Attempt to parse the response as JSON
    let responseData;
    
    try {
      responseData = JSON.parse(
        JSON.parse(rawResponse).choices[0].message.content
      );
    } catch (parseError) {
      throw new Error(`Failed to parse Groq response as JSON: ${rawResponse}`);
    }

    // Ensure response has valid test cases
    if (!responseData?.testCases) {
      throw new Error("Groq API response did not include test cases");
    }

    return responseData;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}
