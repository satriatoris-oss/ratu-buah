"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import { supabase } from "../../../lib/supabase";

type Order = {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_note: string;
  total_amount: number;
  payment_proof_url: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: {
    name: string;
    price: string;
    quantity: number;
    image: string;
  }[];
};

const tabs = [
  "Semua",
  "Pesanan Baru",
  "Menunggu Verifikasi",
  "Diproses",
  "Delivery",
  "Selesai",
  "Dibatalkan",
];

function formatRupiah(number: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pesanan Baru":
      "bg-blue-50 text-blue-700 border-blue-200",

    "Menunggu Verifikasi Admin":
      "bg-amber-50 text-amber-700 border-amber-200",

    "Terverifikasi":
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    "Diproses":
      "bg-purple-50 text-purple-700 border-purple-200",

    "Delivery":
      "bg-orange-50 text-orange-700 border-orange-200",

    "Selesai":
      "bg-green-50 text-green-700 border-green-200",

    "Dibatalkan":
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function PesananPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Signed URL bukti pembayaran
  const [paymentProofUrl, setPaymentProofUrl] =
    useState<string | null>(null);

  const [paymentProofLoading, setPaymentProofLoading] =
    useState(false);

  const [paymentProofError, setPaymentProofError] =
    useState("");

  // ================================
  // AMBIL DATA PESANAN
  // ================================

  useEffect(() => {
    const fetchOrders = async () => {
      console.log("FETCH ADMIN PESANAN BERJALAN");
      setLoading(true);
      setErrorMessage("");

      const { data: sessionData } = await supabase.auth.getSession();

      console.log(
        "SESSION ADMIN:",
        sessionData.session?.user?.id
      );

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
        console.log("JUMLAH ORDER DARI SUPABASE:", data?.length);

      if (error) {
        console.error(
          "Gagal mengambil pesanan:",
          error
        );

        setErrorMessage(
          "Pesanan gagal dimuat."
        );

        setLoading(false);
        return;
      }
      

      console.log(
  "DATA PESANAN ADMIN DETAIL:",
  JSON.stringify(data, null, 2)
);

      setOrders((data || []) as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // ================================
  // AMBIL BUKTI PEMBAYARAN
  // ================================

  useEffect(() => {
    const getPaymentProof = async () => {
      setPaymentProofUrl(null);
      setPaymentProofError("");

      if (
        !selectedOrder ||
        !selectedOrder.payment_proof_url
      ) {
        return;
      }

      setPaymentProofLoading(true);

if (!selectedOrder.payment_proof_url) {
  setPaymentProofUrl("");
  setPaymentProofError("Bukti pembayaran belum tersedia.");
  setPaymentProofLoading(false);
  return;
}

console.log(
  "PAYMENT PROOF PATH:",
  selectedOrder.payment_proof_url
);

const { data, error } =
  await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(
      selectedOrder.payment_proof_url,
      60 * 60
    );


        await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(
            selectedOrder.payment_proof_url,
            60 * 60
          );

      if (error) {
        console.error(
          "Gagal mengambil bukti pembayaran:",
          error
        );

        setPaymentProofError(
          "Bukti pembayaran gagal dimuat."
        );

        setPaymentProofLoading(false);
        return;
      }

      setPaymentProofUrl(data.signedUrl);
      setPaymentProofLoading(false);
    };

    getPaymentProof();
  }, [selectedOrder]);

  // ================================
  // VERIFIKASI PEMBAYARAN
  // ================================

  const verifyPayment = async (order: Order) => {
      if (order.payment_status === "Terverifikasi") {
    alert("Pembayaran pesanan ini sudah diverifikasi.");
    return;
  }
    const confirmed = window.confirm(
      `Verifikasi pembayaran untuk pesanan ${order.order_id}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "Terverifikasi",
      })
      .eq("order_id", order.order_id);

    if (error) {
      console.error(
        "Gagal verifikasi pembayaran:",
        error
      );

      alert(
        "Pembayaran gagal diverifikasi. Silakan coba lagi."
      );

      return;
    }


        // Kurangi stok produk setelah pembayaran terverifikasi
    for (const item of order.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, stock")
        .eq("name", item.name)
        .single();

      if (productError || !product) {
        console.error(
          "Produk tidak ditemukan saat mengurangi stok:",
          item.name
        );
        continue;
      }

      const newStock = Math.max(
        0,
        product.stock - item.quantity
      );

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (stockError) {
        console.error(
          "Gagal mengurangi stok:",
          item.name,
          stockError
        );
      }
    }

    const updatedOrder = {
      ...order,
      payment_status: "Terverifikasi",
    };

    setOrders((currentOrders) =>
      currentOrders.map((item) =>
        item.order_id === order.order_id
          ? updatedOrder
          : item
      )
    );

    setSelectedOrder(updatedOrder);

    alert("Pembayaran berhasil diverifikasi.");
  };

  const updateOrderStatus = async (
  order: Order,
  newStatus: string
) => {
  // Pesanan tidak boleh diproses sebelum pembayaran terverifikasi
  if (
    newStatus === "Diproses" &&
    order.payment_status !== "Terverifikasi"
  ) {
    alert(
      "Pesanan belum bisa diproses karena pembayaran belum terverifikasi."
    );
    return;
  }

  const confirmed = window.confirm(
    `Ubah status pesanan ${order.order_id} menjadi "${newStatus}"?`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("orders")
    .update({
      order_status: newStatus,
    })
    .eq("order_id", order.order_id);

  if (error) {
    console.error(
      "Gagal mengubah status pesanan:",
      error
    );

    alert(
      "Status pesanan gagal diubah. Silakan coba lagi."
    );

    return;
  }

  const updatedOrder = {
    ...order,
    order_status: newStatus,
  };

  setOrders((currentOrders) =>
    currentOrders.map((item) =>
      item.order_id === order.order_id
        ? updatedOrder
        : item
    )
  );

  setSelectedOrder(updatedOrder);

  alert(
    `Status pesanan berhasil diubah menjadi "${newStatus}".`
  );
};

const sendCustomerWhatsApp = (
  order: Order,
  message: string
) => {
  const phone = order.customer_phone.replace(/\D/g, "");

  if (!phone) {
    alert("Nomor WhatsApp pelanggan tidak tersedia.");
    return;
  }

  const whatsappUrl =
    `https://wa.me/${phone}?text=` +
    encodeURIComponent(message);

  window.open(whatsappUrl, "_blank");
};
const cancelOrder = async (order: Order) => {
  if (order.order_status === "Dibatalkan") {
    alert("Pesanan ini sudah dibatalkan.");
    return;
  }

  const confirmed = window.confirm(
    `Yakin ingin membatalkan pesanan ${order.order_id}?`
  );

  if (!confirmed) return;

  // Jika pembayaran sudah terverifikasi,
  // kembalikan stok produk.
  if (order.payment_status === "Terverifikasi") {
    for (const item of order.items) {
      const { data: product, error: productError } =
        await supabase
          .from("products")
          .select("id, stock")
          .eq("name", item.name)
          .single();

      if (productError || !product) {
        console.error(
          "Produk tidak ditemukan saat mengembalikan stok:",
          item.name
        );
        continue;
      }

      const newStock =
        product.stock + item.quantity;

      const { error: stockError } =
        await supabase
          .from("products")
          .update({
            stock: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

      if (stockError) {
        console.error(
          "Gagal mengembalikan stok:",
          item.name,
          stockError
        );
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      order_status: "Dibatalkan",
    })
    .eq("order_id", order.order_id);

  if (error) {
    console.error(
      "Gagal membatalkan pesanan:",
      error
    );

    alert(
      "Pesanan gagal dibatalkan. Silakan coba lagi."
    );

    return;
  }

  const updatedOrder = {
    ...order,
    order_status: "Dibatalkan",
  };

  setOrders((currentOrders) =>
    currentOrders.map((item) =>
      item.order_id === order.order_id
        ? updatedOrder
        : item
    )
  );

  setSelectedOrder(updatedOrder);

  alert(
    order.payment_status === "Terverifikasi"
      ? "Pesanan dibatalkan dan stok berhasil dikembalikan."
      : "Pesanan berhasil dibatalkan."
  );
};

  // ================================
  // FILTER PESANAN
  // ================================

  const filteredOrders = orders.filter((order) => {
    const searchValue =
      search.toLowerCase().trim();

    const matchesSearch =
      searchValue === "" ||
      order.order_id
        .toLowerCase()
        .includes(searchValue) ||
      order.customer_name
        .toLowerCase()
        .includes(searchValue) ||
      order.customer_phone.includes(searchValue);

    const matchesTab =
      activeTab === "Semua" ||
      (activeTab === "Menunggu Verifikasi" &&
        order.payment_status ===
          "Menunggu Verifikasi Admin") ||
      order.order_status === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <main className="min-h-screen bg-[#f6f8f6] text-[#243629]">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">

        <div className="flex h-20 items-center justify-between px-6 lg:px-8">

          <div>

            <h1 className="text-2xl font-bold text-[#183b29]">
              Pesanan
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola seluruh pesanan pelanggan Ratu Buah
            </p>

          </div>

          <div className="hidden rounded-xl bg-[#f1f7f3] px-4 py-2 text-sm font-medium text-[#24583F] md:block">
            Admin Ratu Buah
          </div>

        </div>

      </header>

      <div className="p-6 lg:p-8">

        {/* TAB */}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">

          <div className="flex min-w-max">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "border-[#24583F] text-[#24583F]"
                    : "border-transparent text-gray-500 hover:text-[#24583F]"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700">
            Memuat pesanan dari database...
          </div>

        )}

        {/* ERROR */}

        {errorMessage && (

          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>

        )}

        {/* SEARCH */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Cari ID pesanan, nama atau nomor HP..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#24583F] focus:ring-2 focus:ring-[#24583F]/10"
            />

          </div>

          <div className="text-sm text-gray-500">

            Menampilkan{" "}

            <span className="font-bold text-[#243629]">
              {filteredOrders.length}
            </span>{" "}

            pesanan

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Pesanan
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Pelanggan
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Pembayaran
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Waktu
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredOrders.map((order) => (

                  <tr
                    key={order.order_id}
                    className="transition hover:bg-[#f9fbf9]"
                  >

                    <td className="px-6 py-5">

                      <div className="font-bold text-[#243629]">
                        {order.order_id}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {order.items.length} produk
                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <div className="font-semibold">
                        {order.customer_name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {order.customer_phone}
                      </div>

                    </td>

                    <td className="px-6 py-5 font-bold">

                      {formatRupiah(
                        order.total_amount
                      )}

                    </td>

                    <td className="px-6 py-5">

                      <StatusBadge
                        status={
                          order.payment_status
                        }
                      />

                    </td>

                    <td className="px-6 py-5">

                      <StatusBadge
                        status={
                          order.order_status
                        }
                      />

                    </td>

                    <td className="px-6 py-5 text-sm text-gray-500">
                      {order.created_at}
                    </td>

                    <td className="px-6 py-5 text-right">

                      <button
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="rounded-lg border border-[#24583F] px-4 py-2 text-sm font-semibold text-[#24583F] transition hover:bg-[#24583F] hover:text-white"
                      >
                        Detail
                      </button>

                    </td>

                  </tr>

                ))}

                {filteredOrders.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >

                      <div className="text-4xl">
                        📦
                      </div>

                      <p className="mt-3 font-semibold text-gray-600">
                        Pesanan tidak ditemukan
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Coba gunakan kata kunci pencarian lain.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* DETAIL MODAL */}

      {selectedOrder && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Detail Pesanan
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#183b29]">
                  {selectedOrder.order_id}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* CUSTOMER */}

              <section className="rounded-2xl bg-gray-50 p-5">

                <h3 className="font-bold text-[#183b29]">
                  Informasi Pelanggan
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  <div>

                    <p className="text-xs text-gray-400">
                      Nama
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder.customer_name}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-400">
                      Nomor HP
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder.customer_phone}
                    </p>

                  </div>

                  <div className="md:col-span-2">

                    <p className="text-xs text-gray-400">
                      Alamat
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedOrder.customer_address}
                    </p>

                  </div>

                  {selectedOrder.customer_note && (

                    <div className="md:col-span-2">

                      <p className="text-xs text-gray-400">
                        Catatan
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedOrder.customer_note}
                      </p>

                    </div>

                  )}

                </div>

              </section>

              {/* ITEMS */}

              <section>

                <h3 className="mb-4 font-bold text-[#183b29]">
                  Produk Pesanan
                </h3>

                <div className="divide-y rounded-2xl border border-gray-200">

                  {selectedOrder.items.map(
                    (item, index) => (

                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center gap-4 p-4"
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />

                        <div className="flex-1">

                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.price}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm text-gray-400">
                            Qty
                          </p>

                          <p className="font-bold">
                            {item.quantity}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

              {/* TOTAL */}

              <div className="rounded-2xl bg-[#f1f7f3] p-5">

                <div className="flex items-center justify-between">

                  <span className="font-semibold text-gray-600">
                    Total Pesanan
                  </span>

                  <span className="text-2xl font-bold text-[#24583F]">
                    {formatRupiah(
                      selectedOrder.total_amount
                    )}
                  </span>

                </div>

              </div>

              {/* BUKTI PEMBAYARAN */}

              <section>

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-bold text-[#183b29]">
                    Bukti Pembayaran
                  </h3>

                  {selectedOrder.payment_status ===
                    "Menunggu Verifikasi Admin" && (

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Belum Diverifikasi
                    </span>

                  )}

                </div>

                {paymentProofLoading && (

                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">

                    <div className="text-center">

                      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#24583F]" />

                      <p className="mt-3 text-sm text-gray-500">
                        Memuat bukti pembayaran...
                      </p>

                    </div>

                  </div>

                )}

                {!paymentProofLoading &&
                  paymentProofUrl && (

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                      <img
                        src={paymentProofUrl}
                        alt="Bukti pembayaran"
                        className="max-h-[600px] w-full object-contain"
                      />

                    </div>

                  )}

                {!paymentProofLoading &&
                  !paymentProofUrl &&
                  !paymentProofError && (

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                      Pelanggan belum mengunggah bukti pembayaran.
                    </div>

                  )}

                {paymentProofError && (

                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {paymentProofError}
                  </div>

                )}

              </section>

              {/* STATUS */}

              <section>

                <h3 className="mb-4 font-bold text-[#183b29]">
                  Status Pesanan
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="rounded-2xl border border-gray-200 p-4">

                    <p className="text-xs text-gray-400">
                      Pembayaran
                    </p>

                    <div className="mt-2">

                      <StatusBadge
                        status={
                          selectedOrder.payment_status
                        }
                      />

                    </div>

                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">

                    <p className="text-xs text-gray-400">
                      Status Pesanan
                    </p>

                    <div className="mt-2">

                      <StatusBadge
                        status={
                          selectedOrder.order_status
                        }
                      />

                    </div>

                  </div>

                </div>

              </section>

              {/* ACTION */}

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 md:flex-row md:justify-end">

                {/* VERIFIKASI PEMBAYARAN */}

                {selectedOrder.payment_status ===
                  "Menunggu Verifikasi Admin" && (

                  <button
                    type="button"
                    className="rounded-xl bg-[#24583F] px-5 py-3 font-semibold text-white transition hover:bg-[#183b29]"
                    onClick={() =>
                      verifyPayment(selectedOrder)
                    }
                  >
                    ✓ Verifikasi Pembayaran
                  </button>

                )}

                

                {/* MULAI PROSES */}

                {selectedOrder.order_status === "Pesanan Baru" &&
                  selectedOrder.payment_status === "Terverifikasi" && (

                  <button
                    type="button"
                    className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder,
                        "Diproses"
                      )
                    }
                  >
                    📦 Mulai Proses
                  </button>

                )}
                

                {/* KIRIM PESANAN */}

                {selectedOrder.order_status === "Diproses" && (

                  <button
                    type="button"
                    className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder,
                        "Delivery"
                      )
                    }
                  >
                    🚚 Kirim Pesanan
                  </button>

                )}

                {selectedOrder.order_status !== "Selesai" &&
                  selectedOrder.order_status !== "Dibatalkan" && (
                    <button
                      type="button"
                      className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                      onClick={() =>
                        cancelOrder(selectedOrder)
                      }
                    >
                      Batalkan Pesanan
                    </button>
                  )}

                {selectedOrder.order_status === "Delivery" && (
                  <button
                    type="button"
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder,
                        "Selesai"
                      )
                    }
                  >
                    Selesai
                  </button>
                )}

                {/* WHATSAPP PELANGGAN */}

                <button
                  type="button"
                  className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
                  onClick={() => {
                    let message = "";

                    if (
                      selectedOrder.payment_status ===
                      "Menunggu Verifikasi Admin"
                    ) {
                      message = `Halo ${selectedOrder.customer_name},

                Kami menerima pesanan Anda dengan nomor ${selectedOrder.order_id} di Ratu Buah.

                Saat ini pembayaran Anda sedang menunggu verifikasi admin.

                Terima kasih. 🙏`;
                    } else if (
                      selectedOrder.order_status === "Pesanan Baru" &&
                      selectedOrder.payment_status === "Terverifikasi"
                    ) {
                      message = `Halo ${selectedOrder.customer_name},

                Pembayaran untuk pesanan ${selectedOrder.order_id} sudah terverifikasi.

                Pesanan Anda siap kami proses. 📦

                Terima kasih telah berbelanja di Ratu Buah. 🙏`;
                    } else if (
                      selectedOrder.order_status === "Diproses"
                    ) {
                      message = `Halo ${selectedOrder.customer_name},

                Pesanan ${selectedOrder.order_id} sedang kami proses. 📦

                Kami akan menginformasikan kembali ketika pesanan sudah dikirim.

                Terima kasih telah berbelanja di Ratu Buah. 🙏`;
                    } else if (
                      selectedOrder.order_status === "Delivery"
                    ) {
                      message = `Halo ${selectedOrder.customer_name},

                Pesanan ${selectedOrder.order_id} sedang dalam perjalanan menuju alamat Anda. 🚚

                Mohon menunggu pesanan Anda.

                Terima kasih telah berbelanja di Ratu Buah. 🙏`;
                    } else if (
                      selectedOrder.order_status === "Selesai"
                    ) {
                      message = `Halo ${selectedOrder.customer_name},

                Pesanan ${selectedOrder.order_id} telah selesai. ✅

                Terima kasih telah berbelanja di Ratu Buah. 🍎

                Kami tunggu pesanan Anda berikutnya. 🙏`;
                    }

                    sendCustomerWhatsApp(
                      selectedOrder,
                      message
                    );
                  }}
                >
                  📲 WhatsApp Pelanggan
                </button>

              </div>
            </div>

          </div>

        </div>

      )}

    </main>
  );
}