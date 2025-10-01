"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTPForm } from "@/components/auth/OTP";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "@/components/misc/loading-screen";
import Socials from "@/components/auth/socials";

const formSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.coerce.string().email(),
  password: z.string().min(2).max(50),
});

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [otp, setOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const handleOtpSubmit = async (submittedOtp: string) => {
    setOtpValue(submittedOtp);

    if (submittedOtp === generatedOtp && formData) {
      setLoading(true);

      try {
        const data = {
          ...formData,
          name: formData.first_name + " " + formData.last_name,
        };
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          toast({
            variant: "default",
            title: "Sign up successful",
            description: "Your account has been created",
          });

          router.replace("/dashboard");
        } else if (response.status === 400) {
          toast({
            variant: "destructive",
            title: "An error occurred",
            description: "Email already exists",
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: error.message,
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
      });
    }
  };

  const handleGoBack = () => {
    setOtp(false);
    setFormData(null);
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, sessionStatus]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setFormData(data);
    setLoading(true);

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      await fetch("/api/auth/send-otp-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          otp: otp,
          username: data.first_name + " " + data.last_name,
        }),
      });

      setLoading(false);
      setOtp(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to send OTP. Please try again.",
      });
    }
  };

  if (sessionStatus === "loading" || sessionStatus === "authenticated") {
    return <Loading />;
  }

  return (
    <>
      {otp ? (
        <Card className="mx-auto w-full max-w-md shadow-lg z-10">
          <CardContent className="pt-6">
            <InputOTPForm
              onOtpSubmit={handleOtpSubmit}
              onGoBack={handleGoBack}
              loading={loading}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto w-full max-w-md shadow-lg z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to sign up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Socials loading={loading} />
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}