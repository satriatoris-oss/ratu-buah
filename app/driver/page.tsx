"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(
  () => import("../admin/delivery/DeliveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl bg-[#f8faf6] text-sm font-semibold text-gray-500 sm:h-[420px]">
        🗺️ Memuat peta...
      </div>
    ),
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
};

type CustomerLocation = {
  lat: number;
  lng: number;
};

export default function DriverPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<
    DeliveryOrder[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState<DeliveryOrder | null>(null);

  const [customerLocation, setCustomerLocation] =
    useState<CustomerLocation | null>(null);

    const mapSectionRef =
  useRef<HTMLDivElement | null>(null);

  // CEK LOGIN DRIVER
  useEffect(() => {
    const checkDriverLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href =
          "/driver/login";
      }
    };

    checkDriverLogin();
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/driver/login");
  };

  // AMBIL PESANAN DELIVERY
  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          "/driver/login";
        return;
      }

      const { data, error } =
        await supabase
          .from("orders")
          .select("*")
          .eq("order_status", "Delivery")
          .eq("driver_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      console.log(
  "ID USER DRIVER:",
  user?.id
);

      console.log(
        "DATA DELIVERY:",
        data
      );

      console.log(
        "ERROR DELIVERY:",
        error
      );

      if (error) {
        console.error(
          "Gagal mengambil pesanan delivery:",
          error
        );

        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchDeliveryOrders();
  }, []);

  // LIHAT PETA
  const handleShowMap = (
    order: DeliveryOrder
  ) => {
    console.log(
      "LIHAT PETA DIKLIK:",
      order
    );

    setSelectedOrder(order);

    if (
      order.customer_lat !== null &&
      order.customer_lng !== null
    ) {
      setCustomerLocation({
        lat: Number(
          order.customer_lat
        ),
        lng: Number(
          order.customer_lng
        ),
      });

      setTimeout(() => {
  mapSectionRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, 300);


    } else {
      setCustomerLocation(null);
    }
  };

  // SELESAIKAN DELIVERY
  const handleCompleteDelivery = async (
  order: DeliveryOrder
) => {
  console.log(
    "TOMBOL SELESAI DIKLIK:",
    order.order_id
  );

  const { data, error } =
    await supabase.rpc(
      "complete_driver_delivery",
      {
        p_order_id: order.order_id,
      }
    );

  if (error) {
    console.log(
      "ERROR SELESAI DELIVERY:",
      error
    );

    alert(
      `Gagal memperbarui delivery:\n${error.message}`
    );

    return;
  }

  console.log(
    "HASIL SELESAI:",
    data
  );

  if (!data) {
    alert(
      "Pesanan tidak ditemukan atau bukan tugas driver ini."
    );

    return;
  }

  setOrders(
    (currentOrders) =>
      currentOrders.filter(
        (item) =>
          item.order_id !==
          order.order_id
      )
  );

  setSelectedOrder(null);
  setCustomerLocation(null);

  alert(
    "Pesanan berhasil diselesaikan."
  );
};

  return (
    <main className="min-h-screen bg-[#f8faf6] p-5">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-6 rounded-3xl bg-[#16452F] p-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-semibold text-green-100">
                Ratu Buah
              </p>

              <h1 className="mt-1 text-2xl font-black">
                🚚 Delivery Driver
              </h1>

              <p className="mt-2 text-sm text-green-100">
                Daftar pesanan yang harus
                diantar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              🚪 Keluar
            </button>

          </div>
        </header>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Memuat pesanan...
            </p>
          </div>
        ) : orders.length === 0 ? (

          /* TIDAK ADA PESANAN */
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              🚚
            </div>

            <p className="mt-4 text-sm font-bold text-gray-500">
              Belum ada pesanan delivery.
            </p>

          </div>

        ) : (

          /* DAFTAR PESANAN */
          <div className="space-y-4">

            {orders.map((order) => (
              <article
                key={order.order_id}
               className="rounded-3xl border border-orange-100 bg-orange-50/40 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:p-6"
              >

                {/* HEADER PESANAN */}
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">

                  <div>
                    <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">

                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#24583F]">
                        ID Pesanan
                      </p>

                      <p className="mt-1 text-xl font-black text-[#24583F]">
                        {order.order_id}
                      </p>

                      <p className="mt-1 text-xs font-medium text-gray-500">
                        🕐{" "}
                        {new Date(order.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                    </div>
                  </div>

                 <div className="flex flex-wrap items-center gap-2">

  {/* STATUS DELIVERY */}
  <span className="inline-flex w-fit items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
    🚚 Delivery
  </span>

  {/* STATUS PEMBAYARAN */}
  <span
    className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold ${
      order.payment_status === "Lunas"
        ? "border border-green-100 bg-green-50 text-green-700"
        : order.payment_status === "Menunggu Verifikasi Admin"
        ? "border border-yellow-100 bg-yellow-50 text-yellow-700"
        : "border border-gray-100 bg-gray-50 text-gray-600"
    }`}
  >
    {order.payment_status === "Lunas"
      ? "✓ Lunas"
      : order.payment_status === "Menunggu Verifikasi Admin"
      ? "⏳ Menunggu Verifikasi"
      : order.payment_status}
  </span>

</div>

                </div>

                {/* INFORMASI PELANGGAN */}
                <div className="grid gap-6 py-6 sm:grid-cols-2">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Pelanggan
                    </p>

                    <p className="mt-2 text-lg font-black text-[#16452F]">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 text-base font-medium text-gray-500">
                      📞 {order.customer_phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Alamat Pengiriman
                    </p>

                    <p className="mt-2 text-base leading-7 text-gray-600">
                      📍{" "}
                      {order.customer_address}
                    </p>
                  </div>

                </div>

                {/* CATATAN */}
                {order.customer_note && (
                  <div className="mb-6 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-600">
                      Catatan Pelanggan
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-yellow-700">
                      📝{" "}
                      {order.customer_note}
                    </p>

                  </div>
                )}

                {/* FOOTER PESANAN */}
                <div className="flex flex-col justify-between gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Total Pesanan
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#16452F]">
                      Rp{" "}
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">

                  {/* LIHAT PETA */}
                  <button
                    type="button"
                    onClick={() => handleShowMap(order)}
                    className="flex-1 rounded-xl bg-[#16452F] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#24583F] hover:shadow-md sm:flex-none sm:px-5"
                  >
                    🗺️ Lihat Peta
                  </button>

               {/* SELESAI */}
                  <button
                    type="button"
                    onClick={() => {
                      alert("TOMBOL SELESAI DIKLIK");
                      handleCompleteDelivery(order);
                    }}
                    className="flex-1 rounded-xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-200 hover:shadow-md sm:flex-none sm:px-5"
                  >
                    ✓ Selesai
                  </button>
                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* PETA */}
        {selectedOrder && (
            <div
                ref={mapSectionRef}
                className="mt-6 scroll-mt-24"
            >

              {/* INFO PELANGGAN DI ATAS PETA */}
                <div className="mb-4 overflow-hidden rounded-3xl border border-[#D8EFAE] bg-white shadow-sm">
                  <div className="bg-[#16452F] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📍</span>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8EFAE]">
                          Tujuan Pengantaran
                        </p>

                        <h3 className="mt-0.5 text-base font-extrabold text-white">
                          {selectedOrder.customer_name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 px-5 py-4">
                    <div className="flex gap-3">
                      <span className="text-sm">📍</span>

                      <p className="text-sm leading-5 text-[#243629]">
                        {selectedOrder.customer_address}
                      </p>
                    </div>

                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm">📞</span>

                        <a
                          href={`tel:${selectedOrder.customer_phone}`}
                          className="text-sm font-semibold text-[#16452F] underline decoration-green-200 underline-offset-2 transition hover:text-[#24583F]"
                        >
                          {selectedOrder.customer_phone}
                        </a>
                      </div>
                    )}

                    <div className="border-t border-gray-100 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (!customerLocation) return;

                          const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`;

                          window.open(url, "_blank");
                        }}
                        disabled={!customerLocation}
                        className="w-full rounded-xl bg-[#16452F] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        🧭 Navigasi ke Pelanggan
                      </button>
                    </div>
                  </div>
                </div>

            {customerLocation ? (
             <DeliveryMap
                key={`${selectedOrder.order_id}-${customerLocation.lat}-${customerLocation.lng}`}
                customerLat={
                  customerLocation.lat
                }
                customerLng={
                  customerLocation.lng
                }
                customerName={
                  selectedOrder.customer_name
                }
                customerAddress={
                  selectedOrder.customer_address
                }
                isDriver={true}
                onLocationSelect={(
                  lat,
                  lng
                ) => {
                  setCustomerLocation({
                    lat,
                    lng,
                  });
                }}
              />
            ) : (

              <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

                <div className="text-5xl">
                  📍
                </div>

                <p className="mt-4 text-sm font-bold text-gray-600">
                  Lokasi pelanggan belum
                  tersedia.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Admin perlu menentukan
                  titik lokasi pelanggan
                  terlebih dahulu.
                </p>

              </div>

            )}

          </div>
        )}

      </div>
    </main>
  );
}