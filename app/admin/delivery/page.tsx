"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import dynamic from "next/dynamic";
const DeliveryMap = dynamic(
  () => import("./DeliveryMap"),
  {
    ssr: false,
  }
);

type DeliveryOrder = {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_note: string | null;
  customer_lat: number | null;
customer_lng: number | null;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  driver_id: string | null;
};

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
};

type CustomerLocation = {
  lat: number;
  lng: number;
};

export default function DeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState<DeliveryOrder | null>(null);

  const [customerLocation, setCustomerLocation] =
    useState<CustomerLocation | null>(null);

  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Gagal mengambil daftar driver:",
        error
      );

      return;
    }

    setDrivers(data || []);
    console.log("DATA DRIVER:", data);
  };

    fetchDrivers();
  fetchDeliveryOrders();

}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchDeliveryOrders();
  }, 5000);

  return () => clearInterval(interval);
}, []);

 const fetchDeliveryOrders = async () => {
  console.log("1. MULAI FETCH DELIVERY");

  setLoading(true);

  try {
    console.log("2. MENJALANKAN QUERY SUPABASE");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_status", "Delivery")
      .order("created_at", { ascending: false });

    console.log("3. HASIL QUERY:", {
      data,
      error,
    });

    if (error) {
      console.error("GAGAL MENGAMBIL DELIVERY:", error);
      return;
    }

    setOrders(data || []);

    console.log("4. ORDERS BERHASIL DISET:", data);
  } catch (error) {
    console.error("5. ERROR FETCH DELIVERY:", error);
  } finally {
    console.log("6. SELESAI FETCH DELIVERY");
    setLoading(false);
  }
};



const handleAssignDriver = async (
  orderId: string,
  driverId: string
) => {

    console.log("ASSIGN DRIVER:", {
  orderId,
  driverId,
});


  const { error } = await supabase
    .from("orders")
   .update({
  driver_id: driverId || null,
  order_status: driverId ? "Delivery" : "Pesanan Baru",
})
    .eq("order_id", orderId);

  if (error) {
    console.error("Gagal memilih driver:", error);
    alert("Gagal memilih driver.");
    return;
  }

  setOrders((currentOrders) =>
    currentOrders.map((order) =>
      order.order_id === orderId
        ? {
            ...order,
            driver_id: driverId || null,
          }
        : order
    )
  );



  alert("Driver berhasil ditugaskan.");
};

    
  const handleShowMap = async (order: DeliveryOrder) => {
    console.log("DATA ORDER SAAT LIHAT PETA:", order);
  setSelectedOrder(order);
  setMapLoading(true);
  setMapError("");

  // Jika koordinat sudah pernah disimpan,
  // langsung gunakan koordinat tersebut.
  if (
    order.customer_lat !== null &&
    order.customer_lat !== undefined &&
    order.customer_lng !== null &&
    order.customer_lng !== undefined
  ) {
    setCustomerLocation({
      lat: Number(order.customer_lat),
      lng: Number(order.customer_lng),
    });

    setMapLoading(false);
    setTimeout(() => {
  mapSectionRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, 150);
    return;
  }

  

  // Jika belum ada koordinat,
  // coba cari berdasarkan alamat.
  try {
    const searchAddress =
      `${order.customer_address}, Banda Aceh, Aceh, Indonesia`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        searchAddress
      )}`
    );

    if (!response.ok) {
      throw new Error("Gagal mencari lokasi.");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      setCustomerLocation(null);
      setMapError(
        "Lokasi tidak ditemukan. Silakan klik lokasi pelanggan langsung pada peta."
      );
      setMapLoading(false);
      return;
    }

    setCustomerLocation({
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    });

    setMapLoading(false);
  } catch (error) {
    console.error("Gagal mencari lokasi:", error);

    setCustomerLocation(null);
    setMapError(
      "Lokasi tidak ditemukan. Silakan tentukan lokasi pelanggan pada peta."
    );
    setMapLoading(false);
  }
};

useEffect(() => {
  fetchDeliveryOrders();
}, []);

  return (
    <main className="min-h-screen bg-[#f8faf6] p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
<div className="mb-7 overflow-hidden rounded-3xl bg-[#16452F] shadow-lg">
  <div className="px-6 py-7 sm:px-8">
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

      {/* JUDUL */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-green-100">
            Ratu Buah Admin
          </span>

          <span className="text-xs text-green-200/70">
            / Delivery
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Delivery
        </h1>

        <p className="mt-2 text-sm text-green-100/80">
          Kelola pesanan, driver, dan proses pengiriman pelanggan.
        </p>
      </div>

      {/* JUMLAH DELIVERY */}
      <div className="min-w-[180px] rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-100/70">
          Sedang Dikirim
        </p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-black text-white">
            {orders.length}
          </span>

          <span className="pb-1 text-xs font-semibold text-green-100/70">
            Pesanan
          </span>
        </div>
      </div>

    </div>
  </div>
</div>

{/* STATISTIK DELIVERY */}
<div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

  {/* TOTAL DELIVERY */}
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Total Delivery
        </p>

        <p className="mt-2 text-3xl font-black text-[#16452F]">
          {orders.length}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Pesanan aktif
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
        🚚
      </div>
    </div>
  </div>

  {/* BELUM DRIVER */}
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Belum Driver
        </p>

        <p className="mt-2 text-3xl font-black text-orange-500">
          {
            orders.filter(
              (order) => !order.driver_id
            ).length
          }
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Perlu ditugaskan
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
        ⚠️
      </div>
    </div>
  </div>

  {/* SUDAH DITUGASKAN */}
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Sudah Ditugaskan
        </p>

        <p className="mt-2 text-3xl font-black text-blue-600">
          {
            orders.filter(
              (order) => !!order.driver_id
            ).length
          }
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Siap dikirim
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
        👤
      </div>
    </div>
  </div>

  {/* DRIVER AKTIF */}
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Driver Aktif
        </p>

        <p className="mt-2 text-3xl font-black text-[#24583F]">
          {drivers.length}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Driver tersedia
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
        🛵
      </div>
    </div>
  </div>

</div>

        {/* PETA */}
       {selectedOrder && (
  <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

    <div className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          ID Pengiriman
        </p>

        <h2 className="mt-1 text-lg font-black text-[#16452F]">
          {selectedOrder.order_id}
        </h2>

        <p className="mt-2 text-base font-black text-[#16452F]">
          {selectedOrder.customer_name}
        </p>

        <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
          {selectedOrder.customer_address}
        </p>
      </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setCustomerLocation(null);
                  setMapError("");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Tutup Peta
              </button>
            </div>

            {mapLoading ? (
              <div className="flex h-[380px] items-center justify-center rounded-2xl bg-[#f8faf6]">
                <div className="text-center">
                  <div className="text-4xl">🗺️</div>

                  <p className="mt-3 text-sm font-bold text-gray-500">
                    Mencari lokasi pelanggan...
                  </p>
                </div>
              </div>
            ) : mapError ? (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-8 text-center">
                <div className="text-4xl">📍</div>

                <p className="mt-3 text-sm font-bold text-orange-700">
                  Lokasi tidak ditemukan
                </p>

                <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-orange-600">
                  {mapError}
                </p>

                <p className="mx-auto mt-4 max-w-lg text-xs leading-5 text-gray-500">
                  Alamat:
                  <br />
                  {selectedOrder.customer_address}
                </p>
              </div>
           ) : customerLocation ? (
                <div ref={mapSectionRef}>
                    <DeliveryMap
                    customerLat={customerLocation.lat}
                    customerLng={customerLocation.lng}
                customerName={selectedOrder.customer_name}
                customerAddress={selectedOrder.customer_address}
                onLocationSelect={async (lat, lng) => {
                console.log("KOORDINAT DIPILIH:", lat, lng);

                setCustomerLocation({
                    lat,
                    lng,
                });

                if (!selectedOrder) {
                    return;
                }

                const { error } = await supabase
                    .from("orders")
                    .update({
                    customer_lat: lat,
                    customer_lng: lng,
                    })
                    .eq("order_id", selectedOrder.order_id);

                if (error) {
                console.error("GAGAL SIMPAN LOKASI:", error);
                alert("Gagal menyimpan lokasi: " + error.message);

                setMapError(
                    "Lokasi sudah dipilih, tetapi gagal disimpan ke database."
                );

                return;
                }

                setOrders((currentOrders) =>
                    currentOrders.map((item) =>
                    item.order_id === selectedOrder.order_id
                        ? {
                            ...item,
                            customer_lat: lat,
                            customer_lng: lng,
                        }
                        : item
                    )
                );

                setSelectedOrder((currentOrder) =>
                    currentOrder
                    ? {
                        ...currentOrder,
                        customer_lat: lat,
                        customer_lng: lng,
                        }
                    : currentOrder
                );

                         setMapError("");
                }}
                />
  </div>
            ) : null}
          </div>
        )}

        {/* DAFTAR PESANAN */}
<div className="flex flex-col gap-4 border-b border-gray-100 px-1 pb-5 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-[#24583F]" />
      <h2 className="text-lg font-black text-[#16452F]">
        Pesanan Delivery
      </h2>
    </div>

    <p className="mt-1 text-xs text-gray-400">
      Kelola driver, lokasi, dan status pengiriman pelanggan.
    </p>
  </div>

  <div className="rounded-full border border-green-100 bg-green-50 px-4 py-2">
    <span className="text-xs font-bold text-[#24583F]">
      {orders.length} Pesanan Aktif
    </span>
  </div>
</div>

{loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Memuat pesanan delivery...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">🚚</div>

            <p className="mt-4 text-sm font-bold text-gray-500">
              Belum ada pesanan dalam delivery.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Pesanan yang berstatus Delivery akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="border-b border-gray-100 bg-[#f8faf6]">
                  <tr>
                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    ID Pesanan
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Pelanggan
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Alamat
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Total
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Status
                    </th>

                   <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="transition hover:bg-[#f8faf6]"
                    >
                      {/* ID */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#16452F]">
                          {order.order_id}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </td>

                      {/* PELANGGAN */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#243629]">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {order.customer_phone}
                        </p>
                      </td>

                      {/* ALAMAT */}
                      <td className="max-w-xs px-6 py-5">
                        <p className="text-sm leading-6 text-gray-600">
                          {order.customer_address}
                        </p>

                        {order.customer_note && (
                          <p className="mt-1 text-xs text-orange-500">
                            Catatan: {order.customer_note}
                          </p>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#16452F]">
                          Rp{" "}
                          {Number(
                            order.total_amount || 0
                          ).toLocaleString("id-ID")}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                          🚚 Delivery
                       </span>
                      </td>

                      {/* AKSI */}
                   <td className="min-w-[190px] px-6 py-5">
  <div className="flex flex-col gap-2.5">

                          {/* PILIH DRIVER */}
                          <select
                            value={order.driver_id || ""}
                            onChange={(e) =>
                              handleAssignDriver(
                                order.order_id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 outline-none transition focus:border-[#24583F] focus:bg-white focus:ring-2 focus:ring-[#24583F]/10"
                          >
                            <option value="">
                              Pilih Driver
                            </option>

                            {drivers.map((driver) => (
                              <option
                                key={driver.id}
                                value={driver.id}
                              >
                                {driver.name}
                                {driver.phone
                                  ? ` - ${driver.phone}`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleShowMap(order)
                            }
                            className="rounded-xl bg-[#24583F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#16452F] hover:shadow-md"
                          >
                            🗺️ Lihat Peta
                          </button>

                       

                        </div>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}