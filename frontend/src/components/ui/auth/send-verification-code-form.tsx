"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { handleSendEmailVerificationCode } from "@/lib/cognitoActions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconRefresh, IconAlertCircle, IconCheck } from "@tabler/icons-react";

export default function SendVerificationCode() {
  const [response, dispatch] = useActionState(handleSendEmailVerificationCode, {
    message: "",
    errorMessage: "",
  });

  return (
    <div className="space-y-3">
      <ResendButton dispatch={dispatch} />
      
      {/* Success Message */}
      {response?.message && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <IconCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            {response.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Message */}
      {response?.errorMessage && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            {response.errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ResendButton({ dispatch }: { dispatch: any }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      formAction={dispatch}
      variant="outline"
      size="sm"
      disabled={pending}
      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          Sending...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <IconRefresh className="h-4 w-4" />
          Resend verification code
        </div>
      )}
    </Button>
  );
}
