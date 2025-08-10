"use client";

import { signOut } from "aws-amplify/auth";
import { getErrorMessage } from "@/utils/get-error-message";

export async function clientSignOut() {
  try {
    await signOut();
    // Clear any stored tokens or session data
    if (typeof window !== "undefined") {
      // Clear any localStorage or sessionStorage items related to auth
      localStorage.removeItem("amplify-signin-with-hostedUI");
      sessionStorage.clear();
      
      // Clear any Amplify-related cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.log("Sign out error:", getErrorMessage(error));
    // Even if signOut fails, clear storage and redirect
    if (typeof window !== "undefined") {
      localStorage.removeItem("amplify-signin-with-hostedUI");
      sessionStorage.clear();
      
      // Clear any Amplify-related cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      window.location.href = "/login";
    }
  }
} 