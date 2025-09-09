"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function InputOTPForm({ onOtpSubmit, onGoBack, loading }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data) {
    onOtpSubmit(data.pin);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center w-full"
      >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-xl mb-2">One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="p-4 pb-0">
                Enter the 6-digit OTP sent to your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between w-full gap-2 mt-6">
          <Button type="submit" className="flex flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit
          </Button>
          <Button
            className="flex flex-1"
            variant="outline"
            onClick={onGoBack}
            disabled={loading}
          >
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
}
