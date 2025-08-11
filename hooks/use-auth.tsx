"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  type CognitoUserSession,
} from "amazon-cognito-identity-js"

// Cognito configuration
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
}

const userPool = new CognitoUserPool(poolData)

interface User {
  username: string
  email: string
  name?: string
  groups?: string[]
  attributes?: Record<string, any>
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, attributes?: Record<string, any>) => Promise<void>
  signOut: () => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  resendConfirmationCode: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current authenticated user
  const getCurrentUser = async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser()

      if (!cognitoUser) {
        resolve(null)
        return
      }

      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          resolve(null)
          return
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            resolve(null)
            return
          }

          const userAttributes: Record<string, any> = {}
          attributes?.forEach((attr) => {
            userAttributes[attr.getName()] = attr.getValue()
          })

          // Get user groups from token
          const payload = session.getAccessToken().getPayload()
          const groups = payload["cognito:groups"] || []

          const userData: User = {
            username: cognitoUser.getUsername(),
            email: userAttributes.email,
            name: userAttributes.name,
            groups,
            attributes: userAttributes,
          }

          resolve(userData)
        })
      })
    })
  }

  // Sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      })

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session) => {
          try {
            const userData = await getCurrentUser()
            setUser(userData)
            setIsLoading(false)
            resolve()
          } catch (error) {
            setError("Failed to get user data")
            setIsLoading(false)
            reject(error)
          }
        },
        onFailure: (err) => {
          setError(err.message || "Sign in failed")
          setIsLoading(false)
          reject(err)
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required
          setError("New password required")
          setIsLoading(false)
          reject(new Error("New password required"))
        },
      })
    })
  }

  // Sign up
  const signUp = async (email: string, password: string, attributes: Record<string, any> = {}): Promise<void> => {
    setIsLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: "email",
          Value: email,
        }),
      ]

      // Add additional attributes
      Object.entries(attributes).forEach(([key, value]) => {
        attributeList.push(
          new CognitoUserAttribute({
            Name: key,
            Value: value,
          }),
        )
      })

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        setIsLoading(false)

        if (err) {
          setError(err.message || "Sign up failed")
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
    }
    setUser(null)
  }

  // Confirm sign up
  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        setIsLoading(false)

        if (err) {
          setError(err.message || "Confirmation failed")
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  // Resend confirmation code
  const resendConfirmationCode = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          setError(err.message || "Failed to resend code")
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  // Forgot password
  const forgotPassword = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => {
          setError(err.message || "Failed to send reset code")
          reject(err)
        },
      })
    })
  }

  // Confirm password reset
  const confirmPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => {
          setError(err.message || "Failed to reset password")
          reject(err)
        },
      })
    })
  }

  // Sign in with Google (requires Cognito Identity Provider setup)
  const signInWithGoogle = async (): Promise<void> => {
    // This would require additional setup with Cognito Identity Providers
    // For now, we'll throw an error to indicate it needs implementation
    throw new Error("Google sign-in requires additional Cognito Identity Provider configuration")
  }

  // Refresh token
  const refreshToken = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser()

      if (!cognitoUser) {
        reject(new Error("No current user"))
        return
      }

      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          reject(err)
          return
        }

        if (session.isValid()) {
          resolve()
        } else {
          reject(new Error("Session is not valid"))
        }
      })
    })
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    checkAuth()
  }, [])

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmPassword,
    signInWithGoogle,
    getCurrentUser,
    refreshToken,
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
