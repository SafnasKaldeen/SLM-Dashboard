"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Zap,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Commented out Cognito auth import
// import { useAuth } from "@/hooks/use-auth.tsx";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  // const { signIn, signUp, signInWithGoogle, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Hardcoded sign-in redirect
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // try {
    //   await signIn(signInForm.email, signInForm.password);
    //   router.push("/dashboard");
    //   onClose();
    // } catch (error) {
    //   console.error("Sign in error:", error);
    //   setSignInForm({ ...signInForm, password: "" });
    //   setActiveTab("signin");
    // }

    router.push("http://localhost:3000/realtime");
    onClose();
  };

  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (signUpForm.password !== signUpForm.confirmPassword) {
  //     return;
  //   }
  //   try {
  //     await signUp(signUpForm.email, signUpForm.password, {
  //       name: signUpForm.name,
  //     });
  //     router.push("/dashboard");
  //     onClose();
  //   } catch (error) {
  //     console.error("Sign up error:", error);
  //   }
  // };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     await signInWithGoogle();
  //     router.push("/dashboard");
  //     onClose();
  //   } catch (error) {
  //     console.error("Google sign in error:", error);
  //   }
  // };

  // const handleDemoAccess = () => {
  //   router.push("/");
  //   onClose();
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SL-Mobility
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Welcome Back
          </DialogTitle>
          <p className="text-gray-300">Access your mobility dashboard</p>
        </DialogHeader>

        {/* {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )} */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-white/10">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="signin" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInForm.email}
                        onChange={(e) =>
                          setSignInForm({
                            ...signInForm,
                            email: e.target.value,
                          })
                        }
                        className="pl-10 bg-gray-900/50 border-white/10 text-white placeholder:text-gray-400 focus:border-cyan-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInForm.password}
                        onChange={(e) =>
                          setSignInForm({
                            ...signInForm,
                            password: e.target.value,
                          })
                        }
                        className="pl-10 pr-10 bg-gray-900/50 border-white/10 text-white placeholder:text-gray-400 focus:border-cyan-500/50"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-center text-gray-400">
                  Sign up is currently disabled in this version.
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <div className="mt-6">
          <Separator className="bg-white/10" />

          {/* <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
              onClick={handleDemoAccess}
            >
              Continue to Demo Dashboard
            </Button>
          </div> */}
        </div>

        <div className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
}
