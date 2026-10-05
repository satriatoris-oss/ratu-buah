"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);

      setErrorMessage(
        "Email atau password salah. Silakan coba lagi."
      );

      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-5">

      <div className="w-full max-w-md">

        {/* LOGO / BRAND */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#24583F] text-3xl shadow-lg">
            🍎
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#183b29]">
            Ratu Buah
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Admin Dashboard
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-xl">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-[#243629]">
              Login Admin
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Masuk untuk mengelola toko Ratu Buah.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ratubuah.com"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#24583F] focus:ring-2 focus:ring-[#24583F]/10"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#24583F] focus:ring-2 focus:ring-[#24583F]/10"
              />

            </div>

            {/* ERROR */}

            {errorMessage && (

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>

            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#24583F] py-3.5 font-semibold text-white transition hover:bg-[#183b29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>

          </form>

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Ratu Buah Admin System
        </p>

      </div>

    </main>
  );
}