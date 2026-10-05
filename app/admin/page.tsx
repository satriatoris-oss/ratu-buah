"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "./components/AdminGuard";
import { supabase } from "../../lib/supabase";

const menuItems = [
  { name: "Dashboard", icon: "▦" },
  { name: "Pesanan", icon: "🛒" },
  { name: "Produk", icon: "📦" },
  { name: "Delivery", icon: "🚚" },
  { name: "Pelanggan", icon: "👥" },
  { name: "Promo", icon: "🎁" },
  { name: "Laporan", icon: "📈" },
  { name: "Pengaturan", icon: "⚙️" },
];

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [newOrderCount, setNewOrderCount] = useState(0);


useEffect(() => {
  const fetchNewOrderCount = async () => {
    const { count, error } = await supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("order_status", "Pesanan Baru");

    if (error) {
      console.error(
        "Gagal mengambil jumlah pesanan baru:",
        error
      );
      return;
    }

    setNewOrderCount(count || 0);
  };

  fetchNewOrderCount();

  const interval = setInterval(() => {
    fetchNewOrderCount();
  }, 5000);

  return () => clearInterval(interval);
}, []);
  
  

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f5f7f5] text-[#243629]">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#16452F] text-white shadow-xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
            <span className="text-xl">🍎</span>
          </div>

          <div>
            <h1 className="text-lg font-black">
              Ratu Buah
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-green-200">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300">
            Menu Utama
          </p>

         {menuItems.map((item) => (
        <button
            key={item.name}
            type="button"
            onClick={() => {
            setActiveMenu(item.name);
            setSidebarOpen(false);

            if (item.name === "Produk") {
                window.location.href = "/admin/produk";
                return;
            }

            if (item.name === "Pesanan") {
                window.location.href = "/admin/pesanan";
                return;
            }

            if (item.name === "Delivery") {
                window.location.href = "/admin/delivery";
                return;
            }

            if (item.name === "Pelanggan") {
                window.location.href = "/admin/pelanggan";
                return;
            }

            if (item.name === "Promo") {
                window.location.href = "/admin/promo";
                return;
            }

            if (item.name === "Laporan") {
                window.location.href = "/admin/laporan";
                return;
            }

            if (item.name === "Pengaturan") {
                window.location.href = "/admin/pengaturan";
                return;
            }
            }}

            


            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
            activeMenu === item.name
                ? "bg-white text-[#16452F] shadow-sm"
                : "text-green-50 hover:bg-white/10"
            }`}
        >
            <span className="flex w-7 justify-center text-base">
            {item.icon}
            </span>

            <span>{item.name}</span>
        </button>
        ))}

        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-3">

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-green-50 transition hover:bg-white/10"
          >
            <span>↩</span>
            Kembali ke Toko
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <div className="lg:pl-64">

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-xs font-semibold text-gray-400">
                Admin Panel
              </p>

              <h2 className="text-lg font-black text-[#16452F]">
                {activeMenu}
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* Notification */}
          <button
            type="button"
            onClick={() => {
              if (newOrderCount > 0) {
                window.location.href = "/admin/pesanan";
              }
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg transition hover:bg-gray-50"
          >
            🔔

            {newOrderCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {newOrderCount > 99 ? "99+" : newOrderCount}
              </span>
            )}
          </button>

            {/* Admin */}
            <div className="hidden items-center gap-3 sm:flex">

              <div className="text-right">
                <p className="text-sm font-extrabold text-[#243629]">
                  Administrator
                </p>

                <p className="text-xs text-gray-400">
                  Admin Toko
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8EFAE] font-black text-[#16452F]">
                A
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8">

          {activeMenu === "Dashboard" ? (
            <Dashboard />
          ) : (
            <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white">
              <div className="text-center">

                <div className="text-5xl">
                  {menuItems.find(
                    (item) => item.name === activeMenu
                  )?.icon}
                </div>

                <h2 className="mt-4 text-xl font-black text-[#16452F]">
                  {activeMenu}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Halaman ini akan kita bangun pada tahap berikutnya.
                </p>

              </div>
            </div>
          )}

        </div>

      </div>

    </main>
    </AdminGuard>
  );
}
            function Dashboard() {
            const router = useRouter();
            const [orders, setOrders] = useState<
                {
                order_id: string;
                customer_name: string;
                total_amount: number;
                order_status: string;
                payment_status: string;
                created_at: string;
                }[]
            >([]);

            const [loading, setLoading] = useState(true);

            useEffect(() => {
                const fetchOrders = async () => {
                setLoading(true);

                const { data, error } = await supabase
                    .from("orders")
                   .select(
                    "order_id, customer_name, total_amount, order_status, payment_status, created_at"
                    )
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error(
                    "Gagal mengambil data dashboard:",
                    error
                    );
                    setLoading(false);
                    return;
                }

                setOrders(data || []);
                setLoading(false);
                };

                fetchOrders();
            }, []);

            // =========================
            // TANGGAL HARI INI
            // =========================

            const today = new Date();

            const startOfToday = new Date(today);
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date(today);
            endOfToday.setHours(23, 59, 59, 999);

            // =========================
            // PESANAN HARI INI
            // =========================

            const todayOrders = orders.filter((order) => {
            const createdAt = new Date(order.created_at);

            return (
                createdAt >= startOfToday &&
                createdAt <= endOfToday
            );
            });

            console.log("SEMUA PESANAN:", orders);
            console.log("PESANAN HARI INI:", todayOrders);

            // =========================
            // STATISTIK
            // =========================

            const todaySales = todayOrders
            .filter(
                (order) =>
                order.payment_status === "Terverifikasi" &&
                order.order_status !== "Dibatalkan"
            )
            .reduce(
                (total, order) =>
                total + Number(order.total_amount || 0),
                0
            );
            const processingOrders = todayOrders.filter(
                (order) => order.order_status === "Diproses"
            ).length;

            const deliveryOrders = todayOrders.filter(
                (order) => order.order_status === "Delivery"
            ).length;

            const completedOrders = todayOrders.filter(
                (order) => order.order_status === "Selesai"
            ).length;

            const newOrders = todayOrders.filter(
                (order) => order.order_status === "Pesanan Baru"
            ).length;

            const cancelledOrders = todayOrders.filter(
                (order) => order.order_status === "Dibatalkan"
                ).length;

                console.log("Pesanan dibatalkan hari ini:", cancelledOrders);

                console.log(
                "SEMUA PESANAN DIBATALKAN:",
                orders.filter(
                    (order) => order.order_status === "Dibatalkan"
                )
                );

            const weeklySales = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);

            date.setDate(today.getDate() - (6 - index));
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const total = orders
                .filter((order) => {
                const createdAt = new Date(order.created_at);

                return (
                createdAt >= date &&
                createdAt < nextDate &&
                order.payment_status === "Terverifikasi" &&
                order.order_status !== "Dibatalkan"
                );
             })
             
                .reduce(
                (sum, order) =>
                    sum + Number(order.total_amount || 0),
                0
                );

            return {
                date,
                day: date.toLocaleDateString("id-ID", {
                weekday: "short",
                }),
                total,
            };
            });

            const maxWeeklySales = Math.max(
            ...weeklySales.map((item) => item.total),
            1
            );

            return (
                <div>

                    

                {/* Welcome */}

                <div className="mb-7">

                    <p className="text-sm font-semibold text-green-700">
                    {today.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                    </p>

                    <h1 className="mt-1 text-2xl font-black tracking-tight text-[#243629] sm:text-3xl">
                    Selamat datang, Admin 👋
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                    Berikut ringkasan aktivitas toko Ratu Buah hari ini.
                    </p>

                </div>


                {/* STATISTICS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    <StatCard
                    title="Penjualan Hari Ini"
                    value={
                        loading
                        ? "..."
                        : formatRupiah(todaySales)
                    }
                    icon="💰"
                    description="Total nilai pesanan hari ini"
                    />

                    <StatCard
                    title="Total Pesanan"
                    value={
                        loading
                        ? "..."
                        : String(todayOrders.length)
                    }
                    icon="🛒"
                    description="Pesanan hari ini"
                    />

                    <StatCard
                    title="Pesanan Diproses"
                    value={
                        loading
                        ? "..."
                        : String(processingOrders)
                    }
                    icon="📦"
                    description="Perlu ditangani"
                    />

                    <StatCard
                    title="Delivery"
                    value={
                        loading
                        ? "..."
                        : String(deliveryOrders)
                    }
                    icon="🚚"
                    description="Sedang dikirim"
                    />

                    <StatCard
                    title="Pesanan Selesai"
                    value={
                        loading
                        ? "..."
                        : String(completedOrders)
                    }
                    icon="✓"
                    description="Selesai hari ini"
                    />

                    <StatCard
                    title="Pesanan Dibatalkan"
                    value={
                        loading
                        ? "..."
                        : String(cancelledOrders)
                    }
                    icon="×"
                    description="Dibatalkan hari ini"
                    />

                </div>


                {/* CHART + SUMMARY */}

                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

                    {/* CHART */}{/* CHART */}
                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                        <h2 className="text-lg font-black text-[#243629]">
                            Grafik Penjualan
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                            Performa penjualan 7 hari terakhir
                        </p>
                        </div>
                    </div>

                    <div className="mt-8 h-64">
                        <div className="flex h-full items-end gap-2 sm:gap-4">
                        {weeklySales.map((item) => {
                            const height =
                            (item.total / maxWeeklySales) * 100;

                            return (
                            <div
                                key={item.date.toISOString()}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                                <div className="relative flex w-full flex-1 items-end">
                                <div
                                    className="w-full rounded-t-xl bg-[#16452F] transition hover:bg-[#24583F]"
                                    style={{
                                    height: `${height}%`,
                                    minHeight:
                                        item.total > 0 ? "8px" : "0px",
                                    }}
                                    title={formatRupiah(item.total)}
                                />
                                </div>

                                <span className="text-[10px] font-bold text-gray-400">
                                {item.day}
                                </span>

                                <span className="text-[10px] font-black text-[#16452F]">
                                {item.total > 0
                                    ? `Rp ${Math.round(
                                        item.total / 1000
                                    )}K`
                                    : "Rp 0"}
                                </span>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    </section>


                    {/* SUMMARY */}
                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

                    <div>

                        <h2 className="text-lg font-black text-[#243629]">
                        Ringkasan Hari Ini
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                        Status pesanan
                        </p>

                    </div>


                    <div className="mt-6 space-y-5">

                        <ProgressRow
                        label="Pesanan Baru"
                        value={newOrders}
                        total={todayOrders.length}
                        />

                        <ProgressRow
                        label="Pesanan Dibatalkan"
                        value={cancelledOrders}
                        total={todayOrders.length}
                        />

                        <ProgressRow
                        label="Diproses"
                        value={processingOrders}
                        total={todayOrders.length}
                        />

                        <ProgressRow
                        label="Delivery"
                        value={deliveryOrders}
                        total={todayOrders.length}
                        />

                        <ProgressRow
                        label="Selesai"
                        value={completedOrders}
                        total={todayOrders.length}
                        />

                    </div>

                    </section>

                </div>


                {/* RECENT ORDERS */}

                <section className="mt-6 rounded-3xl border border-gray-100 bg-white shadow-sm">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">

                    <div>

                        <h2 className="text-lg font-black text-[#243629]">
                        Pesanan Terbaru
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                        Pesanan terbaru dari pelanggan
                        </p>

                    </div>

                    <button
                    type="button"
                    onClick={() => router.push("/admin/pesanan")}
                    className="rounded-xl bg-[#16452F] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#24583F]"
                    >
                    Lihat Semua Pesanan →
                    </button>

                    </div>


                    {/* Desktop Table */}

                    <div className="hidden overflow-x-auto md:block">

                    <table className="w-full text-left">

                        <thead className="bg-[#f8faf6] text-xs font-bold uppercase tracking-wider text-gray-400">

                        <tr>

                            <th className="px-6 py-4">
                            ID Pesanan
                            </th>

                            <th className="px-6 py-4">
                            Tanggal
                            </th>

                            <th className="px-6 py-4">
                            Pelanggan
                            </th>

                            <th className="px-6 py-4">
                            Total
                            </th>

                            <th className="px-6 py-4">
                            Status
                            </th>

                        </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-100">

                        {orders
                            .slice(0, 5)
                            .map((order) => (

                            <tr
                                key={order.order_id}
                                className="transition hover:bg-[#f8faf6]"
                            >

                                <td className="px-6 py-4">

                                <p className="text-sm font-black text-[#16452F]">
                                    {order.order_id}
                                </p>

                                </td>

                                <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-gray-500">
                                    {new Date(order.created_at).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    })}
                                </p>
                                </td>


                                <td className="px-6 py-4">

                                <p className="text-sm font-bold text-[#243629]">
                                    {order.customer_name}
                                </p>

                                </td>


                                <td className="px-6 py-4">

                                <p className="text-sm font-black text-[#16452F]">
                                    {formatRupiah(
                                    Number(order.total_amount || 0)
                                    )}
                                </p>

                                </td>


                                <td className="px-6 py-4">

                                <StatusBadge
                                    status={order.order_status}
                                />

                                </td>
                                <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                                </p>
                                </td>

                            </tr>

                            ))}

                        </tbody>

                    </table>

                    </div>


                    {/* Mobile */}

                    <div className="divide-y divide-gray-100 md:hidden">

                    {orders
                        .slice(0, 5)
                        .map((order) => (

                        <div
                            key={order.order_id}
                            className="p-5"
                        >

                            <div className="flex items-start justify-between gap-3">

                            <div>

                                <p className="text-xs font-black text-[#16452F]">
                                {order.order_id}
                                </p>

                                <p className="mt-1 text-sm font-bold">
                                {order.customer_name}
                                </p>

                            </div>

                            <StatusBadge
                                status={order.order_status}
                            />

                            </div>


                            <div className="mt-4">

                            <p className="text-sm font-black text-[#16452F]">
                                {formatRupiah(
                                Number(order.total_amount || 0)
                                )}
                            </p>

                            </div>

                        </div>

                        ))}

                    </div>


                    {orders.length === 0 && !loading && (

                    <div className="px-6 py-12 text-center">

                        <div className="text-4xl">
                        📦
                        </div>

                        <p className="mt-3 text-sm font-bold text-gray-500">
                        Belum ada pesanan.
                        </p>

                    </div>

                    )}

                </section>

                </div>
            );
            }

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-bold text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#16452F]">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6e7] text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[11px] font-semibold text-gray-400">
        {description}
      </p>

    </div>
  );
}


function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-bold text-gray-600">
          {label}
        </span>

        <span className="text-xs font-black text-[#16452F]">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">

        <div
          className="h-full rounded-full bg-[#16452F]"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    "Pesanan Baru":
      "bg-blue-50 text-blue-700 border-blue-100",
    Diproses:
      "bg-yellow-50 text-yellow-700 border-yellow-100",
    Delivery:
      "bg-purple-50 text-purple-700 border-purple-100",
    Selesai:
      "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
        styles[status] ||
        "bg-gray-50 text-gray-600 border-gray-100"
      }`}
    >
      {status}
    </span>
  );
}