"use server";

import { redirect } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { getErrorMessage } from "@/utils/get-error-message";

export async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.log(getErrorMessage(error));
    // Even if signOut fails, we should still redirect to login
  }
  redirect("/login");
} 