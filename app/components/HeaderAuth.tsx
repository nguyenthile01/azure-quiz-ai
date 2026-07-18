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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {session.user.user_metadata?.avatar_url && (
          <img
            src={session.user.user_metadata.avatar_url}
            alt="Avatar"
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="">
          <span className="text-gray-600 dark:text-gray-400">{session.user.email}</span>
          <button
            onClick={async () => {
              await fetch("/api/authenticated/sign-out", { method: "POST" });
              window.location.reload();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}