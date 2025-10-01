import type { ApiResponse } from "./types/api-types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

/**
 * Generic API client for making requests to the backend
 */
export async function apiClient<TResponse, TInput = undefined>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: TInput,
): Promise<ApiResponse<TResponse>> {
  const url = `${API_BASE_URL}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for authentication if needed
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // Try to parse error message if available
      let errorMessage = `API Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          errorMessage = errorData.detail
        }
      } catch (e) {
        // Ignore parsing error
      }
      throw new Error(errorMessage)
    }

    const responseData = await response.json()
    return responseData as ApiResponse<TResponse>
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error)
    throw error
  }
}
