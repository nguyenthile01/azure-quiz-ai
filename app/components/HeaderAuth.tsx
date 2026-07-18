"use client";

import { useAuth } from "../lib/authContext";

export default function HeaderAuth(props: { onOpenAuth: () => void }) {
  const { onOpenAuth } = props;
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />;
  }

  if (!session) {
    return (
      <button
        onClick={onOpenAuth}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <div className="flex items-center gap-2">
        {session.user.user_metadata?.avatar_url && (
          <img
            src={session.user.user_metadata.avatar_url}
            alt="Avatar"
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-gray-600 dark:text-gray-400">{session.user.email}</span>
      </div>
      <button
        onClick={async () => {
          await fetch("/api/authenticated/sign-out", { method: "POST" });
          window.location.reload();
        }}
        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}