export function generateGroqPrompt(endpoints) {
  return `
    You are an AI that generates structured JSON test cases based on OpenAPI endpoints.
    
    ### Instructions:
    - Respond **only** in JSON format.
    - **Do not include** explanations or additional text.
    - Follow this output format strictly:

    \`\`\`json
    {
      "testCases": [
        {
          "endpoint": "/pets",
          "method": "GET",
          "description": "Retrieve a paginated list of pets",
          "testType": "Valid",
          "parameters": {
            "page": 1,
            "pageNum": 10
          },
          "expectedResponse": {
            "status": 200,
            "body": A JSON object with paginated list of pets
          }
        },
        {
          "endpoint": "/pets",
          "method": "GET",
          "description": "Invalid case: Non-integer page parameter",
          "testType": "Invalid",
          "parameters": {
            "page": "abc"
          },
          "expectedResponse": {
            "status": 400,
            "body": { "message": "Invalid page or pageNum" }
          }
        }
      ]
    }
    \`\`\`

    Now generate test cases for the following OpenAPI endpoints in JSON format:

    ${JSON.stringify(endpoints, null, 2)}
  `;
}
