"use client";
import { useMemo, useState } from "react";
import { validateSignupPassword } from "../lib/password";
import { useAuth } from "../lib/authContext";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

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
}) {
  const { open, onClose, notice } = props;
  const { refreshSession } = useAuth();
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
      if (mode === "signIn") {
        const res = await fetch("/api/authenticated/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error ?? `Failed to sign in: ${res.status}`);
        }

        await refreshSession();
        onClose();
      } else {
        const validation = validateSignupPassword(password);
        if (!validation.ok) {
          setError(validation.errors[0] ?? "Password does not meet requirements.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/authenticated/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error ?? `Failed to sign up: ${res.status}`);
        } else {
          setInfo("Account created. Check your email to confirm your account, then sign in.");
          onClose();
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const signInWithOAuth = async (provider: "google" | "github" | "linkedin_oidc") => {
    try {
      const res = await fetch(`/api/authenticated/sign-in-with-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Failed to start OAuth sign-in (${res.status})`);
      }

      const body = await res.json();
      if (!body?.url) {
        throw new Error("No redirect URL returned from server.");
      }
      // ✅ Redirect to Google - user will return to /api/authenticated/sign-in-with-google
      await (window.location.href = body.url);

    } catch (err) {
      setError(getErrorMessage(err));
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

        <form className="space-y-3">
          {/* <div>
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
          </div> */}

          {/* <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gray-900 px-3 py-2 text-white shadow-sm shadow-black/10 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-gray-600"
          >
            {loading ? "Please wait..." : mode === "signIn" ? "Sign in" : "Create account"}
          </button> */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              setInfo(null);
              await signInWithOAuth("google");
            }}
            className="w-full rounded bg-gray-100 px-3 py-2 text-gray-900 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-600"
          >
            <div className="flex items-center justify-center gap-2">
              <FcGoogle size={20} />
              Sign in with Google
            </div>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              setInfo(null);
              await signInWithOAuth("github");
            }}
            className="w-full rounded bg-gray-100 px-3 py-2 text-gray-900 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-600"
          >
            <div className="flex items-center justify-center gap-2">
              <FaGithub size={20} />
              Sign in with GitHub
            </div>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              setInfo(null);
              await signInWithOAuth("linkedin_oidc");
            }}
            className="w-full rounded bg-gray-100 px-3 py-2 text-gray-900 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-600"
          >
            <div className="flex items-center justify-center gap-2">
              <FaLinkedin size={20} color="#02a3f9ff" />
              Sign in with LinkedIn
            </div>
          </button>
        </form>

        {/* <div className="mt-4 flex items-center justify-between">
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
        </div> */}
      </div>
    </div>
  );
}