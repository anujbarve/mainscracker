"use client";

import { Amplify, type ResourcesConfig } from "aws-amplify";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __AMPLIFY_CONFIGURED__?: boolean;
  }
}

export const authConfig: ResourcesConfig["Auth"] = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "placeholder-user-pool-id",
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "placeholder-user-pool-client-id",
  },
};

// Only configure Amplify once
if (typeof window !== "undefined" && !window.__AMPLIFY_CONFIGURED__) {
  Amplify.configure(
    {
      Auth: authConfig,
    },
    { ssr: true }
  );
  window.__AMPLIFY_CONFIGURED__ = true;
}

export default function ConfigureAmplifyClientSide() {
  return null;
}