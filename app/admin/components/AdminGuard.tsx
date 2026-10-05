"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.replace("/admin/login");
    return;
  }

  const ADMIN_UID = "1513fe1f-ae50-4990-9e5a-be4818efffd2";

  if (session.user.id !== ADMIN_UID) {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    return;
  }

  setChecking(false);
};

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/admin/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#24583F]" />

          <p className="mt-4 text-sm text-gray-500">
            Memeriksa akses admin...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}