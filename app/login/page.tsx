"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  

  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  const checkLogin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.log("CUSTOMER SUDAH LOGIN:", session.user.email);
    }
  };

  checkLogin();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Silakan masukkan email.");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Silakan masukkan password.");
      setLoading(false);
      return;
    }

    if (isRegister && !name.trim()) {
      setErrorMessage("Silakan masukkan nama lengkap.");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          console.error("Gagal daftar:", error);
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          router.replace("/?checkout=1");
          return;
        }

        setMessage(
          "Pendaftaran berhasil. Silakan cek email untuk verifikasi akun."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error("Gagal login:", error);
          setErrorMessage("Email atau password salah.");
          setLoading(false);
          return;
        }

        router.replace("/?checkout=1");
        return;
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf6] px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/">
            <img
              src="/ratu-buah-logo.png"
              alt="Ratu Buah"
              className="mx-auto h-20 w-auto object-contain"
            />
          </Link>

          <h1 className="mt-3 text-2xl font-black text-[#16452F]">
            {isRegister ? "Buat Akun Ratu Buah" : "Masuk ke Ratu Buah"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isRegister
              ? "Daftar untuk mulai berbelanja di Ratu Buah."
              : "Masuk untuk melanjutkan pesanan kamu."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">

          {message && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama */}
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Tombol */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#16452F] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : isRegister
                  ? "Daftar Sekarang"
                  : "Masuk"}
            </button>
          </form>

          {/* Switch */}
          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-500">
              {isRegister
                ? "Sudah punya akun?"
                : "Belum punya akun?"}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
                setErrorMessage("");
              }}
              className="mt-1 text-sm font-extrabold text-[#16452F] hover:underline"
            >
              {isRegister ? "Masuk ke akun" : "Daftar akun baru"}
            </button>
          </div>

        </div>

        {/* Kembali */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-sm font-bold text-gray-500 transition hover:text-[#16452F]"
          >
            ← Kembali ke toko
          </Link>
        </div>

      </div>
    </main>
  );
}