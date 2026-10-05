"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DriverLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      console.error(
        "Login driver gagal:",
        error
      );

      setErrorMessage(
        "Email atau password driver salah."
      );

      setLoading(false);
      return;
    }

    console.log("LOGIN DRIVER BERHASIL");

    router.replace("/driver");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf6] p-5">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#16452F] text-4xl shadow-sm">
            🚚
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#16452F]">
            Ratu Buah
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Login Driver Delivery
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {/* EMAIL */}
          <div>
            <label className="text-sm font-bold text-[#243629]">
              Email Driver
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="driver@ratubuah.com"
              required
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/10 disabled:bg-gray-100"
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-5">
            <label className="text-sm font-bold text-[#243629]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Masukkan password"
              required
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/10 disabled:bg-gray-100"
            />
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#16452F] px-4 py-3 font-bold text-white shadow-sm transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sedang masuk..."
              : "Login Driver"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Ratu Buah • Driver Delivery
        </p>
      </div>
    </main>
  );
}