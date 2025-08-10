"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import { forceSignOut } from "@/lib/cognitoActions";

export default function DebugPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const user = await getCurrentUser();
      setAuthState({
        session: session.tokens ? "Authenticated" : "Not authenticated",
        user: user,
        tokens: session.tokens ? "Present" : "Not present",
      });
    } catch (error) {
      setAuthState({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      await checkAuthState();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleForceSignOut = async () => {
    try {
      await forceSignOut();
      await checkAuthState();
    } catch (error) {
      console.error("Force sign out error:", error);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={checkAuthState}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Auth State
          </button>
          
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
          >
            Sign Out
          </button>
          
          <button
            onClick={handleForceSignOut}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-2"
          >
            Force Sign Out
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Use this page to check your current authentication state</li>
            <li>If you're stuck in a signed-in state, try the "Force Sign Out" button</li>
            <li>Check the browser console for detailed logs</li>
            <li>After clearing the session, try logging in again</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 