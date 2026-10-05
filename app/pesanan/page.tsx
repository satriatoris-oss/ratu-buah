"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Order = {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  created_at: string;
  customer_lat: number | null;
  customer_lng: number | null;
  driver_id: string | null;
};

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

        console.log("USER LOGIN:", session.user.id);
        console.log("DATA PESANAN:", data);
        console.log("ERROR PESANAN:", error);

      if (error) {
        console.error("Gagal mengambil pesanan:", error);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const formatRupiah = (value: number | string) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const formatTanggal = (value: string) => {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pesanan Baru":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Diproses":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "Delivery":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Selesai":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getOrderStep = (status: string) => {
  switch (status) {
    case "Pesanan Baru":
      return 1;

    case "Diproses":
      return 2;

    case "Delivery":
      return 3;

    case "Selesai":
      return 4;

    default:
      return 1;
  }
};

  return (
    <main className="min-h-screen bg-[#f8faf6] text-[#243629]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#24583F] bg-[#16452F] shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white"
          >
            <img
              src="/ratu-buah-logo.png"
              alt="Ratu Buah"
              className="h-12 w-auto object-contain"
            />

            <div className="hidden sm:block">
              <p className="text-sm font-black">Pesanan Saya</p>
              <p className="text-xs text-white/70">
                Riwayat pesanan kamu
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#16452F] shadow-sm transition hover:bg-gray-100 sm:text-sm"
          >
            ← Kembali Belanja
          </Link>
        </div>
      </header>

      {/* Isi */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#16452F] sm:text-3xl">
            Pesanan Saya
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Lihat status dan perjalanan pesanan kamu.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Memuat pesanan...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-5xl">🛒</div>

            <h2 className="mt-4 text-lg font-black text-[#16452F]">
              Belum ada pesanan
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Yuk mulai belanja buah dan produk segar favorit kamu.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-2xl bg-[#16452F] px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F]"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* Bagian atas */}
                  <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-400">
                        Nomor Pesanan
                      </p>

                      <p className="mt-0.5 text-sm font-black text-[#16452F]">
                        {order.order_id}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatTanggal(order.created_at)}
                      </p>
                    </div>

                    <div
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold ${getStatusStyle(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </div>
                  </div>

                  {/* Timeline Pesanan */}
<div className="border-b border-gray-100 px-5 py-5 sm:px-6">
  <div className="mb-4">
    <p className="text-sm font-black text-[#16452F]">
      Perjalanan Pesanan
    </p>

    <p className="mt-1 text-xs text-gray-500">
      Status pesanan kamu saat ini
    </p>
  </div>

  {(() => {
    const currentStep = getOrderStep(order.order_status);

    const steps = [
      {
        number: 1,
        icon: "🛒",
        title: "Pesanan Dibuat",
        description: "Pesanan berhasil diterima",
      },
      {
        number: 2,
        icon: "📦",
        title: "Pesanan Diproses",
        description: "Pesanan sedang disiapkan",
      },
      {
        number: 3,
        icon: "🚚",
        title: "Sedang Diantar",
        description: "Pesanan sedang menuju alamat kamu",
      },
      {
        number: 4,
        icon: "✅",
        title: "Pesanan Selesai",
        description: "Pesanan sudah diterima",
      },
    ];

    return (
      <div className="grid grid-cols-4 gap-1 sm:gap-3">
        {steps.map((step) => {
          const active = step.number <= currentStep;

          return (
            <div
              key={step.number}
              className="relative text-center"
            >
              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                  active
                    ? "bg-[#16452F] text-white shadow-md"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.icon}
              </div>

              <p
                className={`mt-2 text-[10px] font-extrabold leading-tight sm:text-xs ${
                  active
                    ? "text-[#16452F]"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </p>

              <p className="mt-1 hidden text-[10px] leading-tight text-gray-400 sm:block">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  })()}
</div>

                  {/* Produk */}
                  <div className="space-y-3 px-5 py-5 sm:px-6">
                    {items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Produk"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl">
                              🍎
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-800">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.quantity} × {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total + pembayaran */}
                  <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Status Pembayaran
                        </p>

                        <p className="mt-1 text-xs font-bold text-gray-700">
                          {order.payment_status}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Total Pesanan
                        </p>

                        <p className="mt-1 text-lg font-black text-[#16452F]">
                          {formatRupiah(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                    <p className="text-xs font-bold text-gray-400">
                      Alamat Pengiriman
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      📍 {order.customer_address}
                    </p>
                  </div>

                  {/* Delivery */}
                  {order.order_status === "Delivery" && (
                    <div className="border-t border-orange-100 bg-orange-50 px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                          🚚
                        </div>

                        <div>
                          <p className="text-sm font-black text-orange-800">
                            Pesanan sedang diantar
                          </p>

                          <p className="mt-0.5 text-xs text-orange-700">
                            Driver sedang membawa pesanan kamu.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}