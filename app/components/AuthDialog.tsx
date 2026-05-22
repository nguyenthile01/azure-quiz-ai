"use client";

import { useMemo, useState } from "react";
import supabaseBrowserClient from "../lib/supabaseBrowserClient";
import { validateSignupPassword } from "../lib/password";

type Mode = "signIn" | "signUp";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Authentication failed.";
}

export default function AuthDialog(props: {
  open: boolean;
  onClose: () => void;
  notice?: string;
  onAuthed?: () => void;
}) {
  const { open, onClose, notice, onAuthed } = props;
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const signupPasswordValidation = useMemo(() => {
    if (mode !== "signUp") return null;
    // Only show detailed rules once user starts typing.
    if (password.length === 0) return null;
    return validateSignupPassword(password);
  }, [mode, password]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signUp") {
        const validation = validateSignupPassword(password);
        if (!validation.ok) {
          setError(validation.errors[0] ?? "Password does not meet requirements.");
          setLoading(false);
          return;
        }
      }

      if (mode === "signIn") {
        const { error } = await supabaseBrowserClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        onAuthed?.();
        onClose();
      } else {
        const { data, error } = await supabaseBrowserClient.auth.signUp({ email, password });
        if (error) throw error;

        // Depending on Supabase settings, user may need email confirmation.
        if (data.user && data.user.identities?.length) {
          setInfo("Account created. You are signed in.");
          onAuthed?.();
          onClose();
        } else {
          setInfo("Check your email to confirm your account, then sign in.");
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/70">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-black/10 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/40">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {mode === "signIn" ? "Sign in" : "Sign up"}
            </h2>
            {notice ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notice}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {info ? (
          <div className="mb-3 rounded border border-blue-200 bg-blue-50 p-2 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
            {info}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">Email</label>
            <input
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">Password</label>
            <input
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 shadow-sm shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              required
              minLength={6}
              aria-invalid={mode === "signUp" && signupPasswordValidation ? !signupPasswordValidation.ok : undefined}
              aria-describedby={mode === "signUp" ? "password-requirements" : undefined}
            />

            {mode === "signUp" ? (
              <div id="password-requirements" className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                <p className="mb-1 font-medium text-gray-800 dark:text-gray-200">Password requirements:</p>
                <ul className="list-disc pl-4">
                  <li>Longer than 10 characters</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>

                {signupPasswordValidation && !signupPasswordValidation.ok ? (
                  <p className="mt-2 text-red-700 dark:text-red-300">
                    {signupPasswordValidation.errors[0]}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gray-900 px-3 py-2 text-white shadow-sm shadow-black/10 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-gray-600"
          >
            {loading ? "Please wait..." : mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {mode === "signIn" ? "No account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600"
            onClick={() => {
              setError(null);
              setInfo(null);
              setMode(mode === "signIn" ? "signUp" : "signIn");
            }}
          >
            {mode === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}