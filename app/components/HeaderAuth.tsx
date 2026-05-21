"use client";

import { useEffect, useState } from "react";
import supabaseBrowserClient from "../lib/supabaseBrowserClient";

export default function HeaderAuth(props: { onOpenAuth: () => void }) {
  const { onOpenAuth } = props;

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabaseBrowserClient.auth.getSession().then(({ data }) => {
      if (!active) return;
      setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabaseBrowserClient]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur shadow-sm shadow-black/5 dark:border-gray-800 dark:bg-gray-950/80 dark:shadow-black/30">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Azure Quiz AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden text-sm text-gray-700 dark:text-gray-300 sm:inline">
                {email}
              </span>
              <button
                type="button"
                onClick={async () => {
                  const {error} = await supabaseBrowserClient.auth.signOut();
                  if (error) {
                    throw error;
                  }
                }}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm shadow-black/5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:shadow-black/20 dark:hover:bg-gray-900 dark:focus-visible:ring-gray-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-black/10 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-gray-600"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}