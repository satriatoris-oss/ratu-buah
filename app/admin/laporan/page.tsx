"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Order = {
  id: number;
  order_id: string;
  customer_name: string;
  total_amount: number;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
};

export default function LaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [quickPeriod, setQuickPeriod] = useState<
  "7hari" | "1bulan" | "1tahun" | ""
>("");

  const handleQuickPeriod = (
    period: "7hari" | "1bulan" | "1tahun"
  ) => {
    const today = new Date();
    const start = new Date(today);

    if (period === "7hari") {
      start.setDate(today.getDate() - 6);
    }

    if (period === "1bulan") {
      start.setDate(today.getDate() - 29);
    }

    if (period === "1tahun") {
      start.setFullYear(today.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
    }

    const formatInputDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    setStartDate(formatInputDate(start));
    setEndDate(formatInputDate(today));
    setQuickPeriod(period);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_id,
          customer_name,
          total_amount,
          payment_status,
          order_status,
          created_at
        `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Gagal mengambil data laporan:",
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

  const filteredOrders = useMemo(() => {
  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);

      if (orderDate < start) {
        return false;
      }
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);

      if (orderDate > end) {
        return false;
      }
    }

    return true;
  });
}, [orders, startDate, endDate]);

  const totalOrders = filteredOrders.length;

  const salesByDate = useMemo(() => {
  const grouped: Record<string, number> = {};

  filteredOrders.forEach((order) => {
    const date = new Date(order.created_at);

    const dateKey = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    grouped[dateKey] =
      (grouped[dateKey] || 0) +
      Number(order.total_amount || 0);
  });

  return Object.entries(grouped).map(
    ([date, total]) => ({
      date,
      total,
    })
  );
}, [filteredOrders]);

  const totalSales = useMemo(() => {
  return filteredOrders.reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0
    );
  }, [filteredOrders]);

  const waitingOrders = filteredOrders.filter(
    (order) =>
      order.payment_status ===
        "Menunggu Verifikasi Admin" ||
      order.order_status === "Pesanan Baru"
  ).length;

  const completedOrders = filteredOrders.filter(
    (order) =>
      order.order_status === "Selesai"
  ).length;

  const deliveryOrders = filteredOrders.filter(
    (order) =>
      order.order_status === "Delivery"
  ).length;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#f8faf6] p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
<div className="mb-8 overflow-hidden rounded-3xl bg-[#16452F] shadow-md">
  <div className="flex flex-col gap-5 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
    
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-[#D8EFAE] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#16452F]">
          Admin Ratu Buah
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Laporan Penjualan
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
        Pantau transaksi, penjualan, dan perkembangan pesanan
        Ratu Buah dalam satu halaman.
      </p>
    </div>

    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">
      📊
    </div>

  </div>
</div>

        {/* FILTER TANGGAL */}
<div className="mb-6 rounded-2xl border border-gray-100 bg-[#EAF5DF] p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-base font-bold text-[#16452F]">
      Filter Laporan
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Pilih periode untuk melihat laporan penjualan.
    </p>

    <div className="mt-4 grid max-w-md grid-cols-3 gap-2">
  {/* 7 HARI */}
  <button
    type="button"
    onClick={() => handleQuickPeriod("7hari")}
    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
      quickPeriod === "7hari"
        ? "bg-[#16452F] text-white shadow-sm"
        : "bg-white text-[#16452F] hover:bg-[#D8EFAE]"
    }`}
  >
    7 Hari
  </button>

  {/* 1 BULAN */}
  <button
    type="button"
    onClick={() => handleQuickPeriod("1bulan")}
    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
      quickPeriod === "1bulan"
        ? "bg-[#16452F] text-white shadow-sm"
        : "bg-white text-[#16452F] hover:bg-[#D8EFAE]"
    }`}
  >
    1 Bulan
  </button>

  {/* 1 TAHUN */}
  <button
    type="button"
    onClick={() => handleQuickPeriod("1tahun")}
    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
      quickPeriod === "1tahun"
        ? "bg-[#16452F] text-white shadow-sm"
        : "bg-white text-[#16452F] hover:bg-[#D8EFAE]"
    }`}
  >
    1 Tahun
  </button>
</div>


  </div>

  <div className="flex flex-col gap-4 md:flex-row md:items-end">
    <div className="flex-1">
      <label className="mb-2 block text-sm font-medium text-[#243629]">
        Dari Tanggal
      </label>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#D8EFAE]"
      />
    </div>

    <div className="flex-1">
      <label className="mb-2 block text-sm font-medium text-[#243629]">
        Sampai Tanggal
      </label>

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#D8EFAE]"
      />
    </div>

    <button
      type="button"
      onClick={() => {
        setStartDate("");
        setEndDate("");
        setQuickPeriod("");
      }}
      className="rounded-xl bg-[#16452F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24583F]"
    >
      Reset
    </button>
  </div>
</div>

       {/* ================= STATISTIK ================= */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

  {/* OMZET */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-[#EAF5DF] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-green-50 blur-2xl" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Total Omzet
        </p>

        <p className="mt-2 text-xl font-black tracking-tight text-[#16452F] sm:text-2xl">
          {formatRupiah(totalSales)}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          Nilai seluruh transaksi
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
        💰
      </div>
    </div>
  </div>


  {/* PESANAN */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-[#EAF5DF] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-blue-50 blur-2xl" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Total Pesanan
        </p>

        <p className="mt-2 text-3xl font-black text-[#16452F]">
          {totalOrders}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          Pesanan pada periode ini
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
        🛒
      </div>
    </div>
  </div>


  {/* DELIVERY */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-[#EAF5DF] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-orange-50 blur-2xl" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Dalam Delivery
        </p>

        <p className="mt-2 text-3xl font-black text-orange-500">
          {deliveryOrders}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          Sedang diantar ke pelanggan
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
        🚚
      </div>
    </div>
  </div>


  {/* SELESAI */}
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-[#EAF5DF] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-50 blur-2xl" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Pesanan Selesai
        </p>

        <p className="mt-2 text-3xl font-black text-green-600">
          {completedOrders}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          Transaksi berhasil diselesaikan
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        ✅
      </div>
    </div>
  </div>

</div>

        {/* GRAFIK PENJUALAN */}
<div className="mt-8 rounded-2xl border border-[#D8EFAE] bg-[#EAF5DF] p-6 shadow-sm">
  <div className="mb-6">
    <h2 className="text-lg font-bold text-[#16452F]">
      Grafik Penjualan
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Total penjualan berdasarkan tanggal transaksi.
    </p>
  </div>

  {salesByDate.length === 0 ? (
    <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-400">
      Belum ada data penjualan pada periode ini.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <div className="flex min-w-[650px] items-end gap-5 border-b border-[#D8EFAE] px-3 pb-4 pt-8">
        {salesByDate.map((item) => {
          const maxTotal = Math.max(
            ...salesByDate.map((sale) => sale.total),
            1
          );

          const height =
            (item.total / maxTotal) * 180;

          return (
            <div
              key={item.date}
              className="flex min-w-[70px] flex-1 flex-col items-center justify-end"
            >
              <div className="mb-2 text-xs font-semibold text-[#16452F]">
                {formatRupiah(item.total)}
              </div>

              <div
                className="w-full max-w-[55px] rounded-t-xl bg-[#16452F] transition-all duration-300 hover:bg-[#24583F]"
                style={{
                  height: `${Math.max(height, 8)}px`,
                }}
              />

              <div className="mt-3 text-xs font-medium text-gray-500">
                {item.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

        {/* PESANAN SELESAI */}
        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pesanan Selesai
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                {completedOrders}
              </p>
            </div>

            <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              Selesai
            </div>
          </div>
        </div>

        {/* TABEL TRANSAKSI */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-[#16452F]">
              Daftar Transaksi
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Data pesanan terbaru.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-gray-500">
              Memuat laporan...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-500">
              Belum ada transaksi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">

                <thead className="bg-[#16452F]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Pelanggan
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Pembayaran
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-white">
                      Tanggal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map((order) => (
                    <tr
                        key={order.id}
                        className={`transition hover:bg-[#D8EFAE] ${
                            filteredOrders.indexOf(order) % 2 === 0
                            ? "bg-white"
                            : "bg-[#EAF5DF]"
                        }`}
                        >

                      <td className="px-6 py-4 font-semibold text-[#16452F]">
                        {order.order_id}
                      </td>

                      <td className="px-6 py-4 text-[#243629]">
                        {order.customer_name}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {formatRupiah(
                          Number(order.total_amount || 0)
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            order.payment_status === "Menunggu Verifikasi Admin"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.payment_status === "Lunas"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        >
                        {order.payment_status || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            order.order_status === "Pesanan Baru"
                            ? "bg-blue-100 text-blue-700"
                            : order.order_status === "Delivery"
                            ? "bg-orange-100 text-orange-700"
                            : order.order_status === "Selesai"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        >
                        {order.order_status || "-"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {formatDate(order.created_at)}
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}