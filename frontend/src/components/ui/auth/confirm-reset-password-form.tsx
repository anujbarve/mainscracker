"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { handleConfirmResetPassword } from "@/lib/cognitoActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconMail, IconLock, IconKey, IconAlertCircle, IconArrowLeft, IconShieldLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";

export default function ConfirmResetPasswordForm() {
  const [errorMessage, dispatch] = useActionState(handleConfirmResetPassword, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <IconShieldLock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Set new password
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Enter your new password and the verification code
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

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New password
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your new password"
                  className="pl-10 pr-10 h-11"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <IconEye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Must be at least 8 characters long
              </p>
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
                Enter the code sent to your email
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
            <ResetPasswordButton />

            {/* Back to Login */}
            <div className="space-y-3 pt-2">
              <Separator />
              
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ResetPasswordButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Resetting password...
        </div>
      ) : (
        "Reset password"
      )}
    </Button>
  );
}
