import { redirect } from "next/navigation";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  resendSignUpCode,
  autoSignIn,
  updateUserAttribute,
  type UpdateUserAttributeOutput,
  confirmUserAttribute,
  updatePassword,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import { getErrorMessage } from "@/utils/get-error-message";

export async function handleSignUp(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: String(formData.get("email")),
      password: String(formData.get("password")),
      options: {
        userAttributes: {
          email: String(formData.get("email")),
          name: String(formData.get("name")),
        },
        // optional
        autoSignIn: true,
      },
    });
  } catch (error) {
    return getErrorMessage(error);
  }
  redirect("/confirm-signup");
}

export async function handleSendEmailVerificationCode(
  prevState: { message: string; errorMessage: string },
  formData: FormData
) {
  let currentState;
  try {
    await resendSignUpCode({
      username: String(formData.get("email")),
    });
    currentState = {
      ...prevState,
      message: "Code sent successfully",
    };
  } catch (error) {
    currentState = {
      ...prevState,
      errorMessage: getErrorMessage(error),
    };
  }

  return currentState;
}

export async function handleConfirmSignUp(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: String(formData.get("email")),
      confirmationCode: String(formData.get("code")),
    });
    await autoSignIn();
  } catch (error) {
    return getErrorMessage(error);
  }
  redirect("/login");
}

export async function handleSignIn(
  prevState: string | undefined,
  formData: FormData
) {
  let redirectLink = "/dashboard";
  
  try {
    // Check if user is already signed in - more thorough check
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        console.log("User is already signed in, redirecting to dashboard");
        // User is already signed in, redirect to dashboard
        redirect("/dashboard");
      }
    } catch (error) {
      console.log("User is not signed in, proceeding with sign in");
      // User is not signed in, continue with sign in process
    }

    // Additional check - try to get current user
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log("Current user found, redirecting to dashboard");
        redirect("/dashboard");
      }
    } catch (error) {
      console.log("No current user found, proceeding with sign in");
    }

    console.log("Attempting to sign in user:", String(formData.get("email")));
    
    // Suppress console errors for already authenticated users
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes("UserAlreadyAuthenticatedException") || 
          message.includes("There is already a signed in user")) {
        // Suppress this specific error
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: String(formData.get("email")),
        password: String(formData.get("password")),
      });
      
      console.log("Sign in result:", { isSignedIn, nextStep });
      
      if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        await resendSignUpCode({
          username: String(formData.get("email")),
        });
        redirectLink = "/confirm-signup";
      }
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  } catch (error) {
    console.error("Sign in error:", error);
    const errorMessage = getErrorMessage(error);
    
    // Check for various "already signed in" error messages
    if (errorMessage.includes("already a signed in user") || 
        errorMessage.includes("already signed in") ||
        errorMessage.includes("UserAlreadyAuthenticatedException") ||
        errorMessage.includes("There is already a signed in user")) {
      console.log("User already signed in, redirecting to dashboard");
      redirect("/dashboard");
    } else {
      return errorMessage;
    }
  }

  redirect(redirectLink);
}

// Utility function to force sign out and clear any existing session
export async function forceSignOut() {
  console.log("Force sign out initiated");
  try {
    // Try to sign out normally first
    await signOut();
    console.log("Normal sign out successful");
  } catch (error) {
    console.log("Normal sign out failed, attempting to clear session:", error);
    // If normal sign out fails, we might need to clear the session manually
    // This could happen if the user is in an inconsistent state
  }
  
  // Clear any stored tokens or session data
  if (typeof window !== "undefined") {
    console.log("Clearing browser storage");
    // Clear any localStorage or sessionStorage items related to auth
    localStorage.removeItem("amplify-signin-with-hostedUI");
    localStorage.removeItem("amplify-signin-with-hostedUI");
    localStorage.removeItem("amplify-signin-with-hostedUI");
    sessionStorage.clear();
    
    // Clear any Amplify-related cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  }
  console.log("Force sign out completed");
}

export async function handleUpdateUserAttribute(
  prevState: string,
  formData: FormData
) {
  let attributeKey = "name";
  let attributeValue;
  let currentAttributeValue;

  if (formData.get("email")) {
    attributeKey = "email";
    attributeValue = formData.get("email");
    currentAttributeValue = formData.get("current_email");
  } else {
    attributeValue = formData.get("name");
    currentAttributeValue = formData.get("current_name");
  }

  if (attributeValue === currentAttributeValue) {
    return "";
  }

  try {
    const output = await updateUserAttribute({
      userAttribute: {
        attributeKey: String(attributeKey),
        value: String(attributeValue),
      },
    });
    return handleUpdateUserAttributeNextSteps(output);
  } catch (error) {
    console.log(error);
    return "error";
  }
}

function handleUpdateUserAttributeNextSteps(output: UpdateUserAttributeOutput) {
  const { nextStep } = output;

  switch (nextStep.updateAttributeStep) {
    case "CONFIRM_ATTRIBUTE_WITH_CODE":
      const codeDeliveryDetails = nextStep.codeDeliveryDetails;
      return `Confirmation code was sent to ${codeDeliveryDetails?.deliveryMedium}.`;
    case "DONE":
      return "success";
  }
}

export async function handleUpdatePassword(
  prevState: "success" | "error" | undefined,
  formData: FormData
) {
  const currentPassword = formData.get("current_password");
  const newPassword = formData.get("new_password");

  if (currentPassword === newPassword) {
    return;
  }

  try {
    await updatePassword({
      oldPassword: String(currentPassword),
      newPassword: String(newPassword),
    });
  } catch (error) {
    console.log(error);
    return "error";
  }

  return "success";
}

export async function handleConfirmUserAttribute(
  prevState: "success" | "error" | undefined,
  formData: FormData
) {
  const code = formData.get("code");

  if (!code) {
    return;
  }

  try {
    await confirmUserAttribute({
      userAttributeKey: "email",
      confirmationCode: String(code),
    });
  } catch (error) {
    console.log(error);
    return "error";
  }

  return "success";
}

export async function handleResetPassword(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await resetPassword({ username: String(formData.get("email")) });
  } catch (error) {
    return getErrorMessage(error);
  }
  redirect("/reset-password/confirm");
}

export async function handleConfirmResetPassword(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await confirmResetPassword({
      username: String(formData.get("email")),
      confirmationCode: String(formData.get("code")),
      newPassword: String(formData.get("password")),
    });
  } catch (error) {
    return getErrorMessage(error);
  }
  redirect("/login");
}