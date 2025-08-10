"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { handleConfirmSignUp } from "@/lib/cognitoActions";
import SendVerificationCode from "./send-verification-code-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconMail, IconKey, IconAlertCircle, IconCheck } from "@tabler/icons-react";

export default function ConfirmSignUpForm() {
  const [errorMessage, dispatch] = useActionState(handleConfirmSignUp, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
              <IconCheck className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Verify your email
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            We've sent a verification code to your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form action={dispatch} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Verification Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification code
              </Label>
              <div className="relative">
                <IconKey className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  type="text"
                  name="code"
                  placeholder="Enter 6-digit code"
                  className="pl-10 h-11 text-center text-lg font-mono tracking-widest"
                  required
                  minLength={6}
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <ConfirmButton />

            {/* Resend Code Section */}
            <div className="space-y-3 pt-2">
              <Separator />
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Didn't receive the code?
                </p>
                <SendVerificationCode />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Verifying...
        </div>
      ) : (
        "Verify email"
      )}
    </Button>
  );
}
