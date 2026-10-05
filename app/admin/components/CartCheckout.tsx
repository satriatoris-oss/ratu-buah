"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../../lib/supabase";

export default function CartCheckout() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    setCartItems,
  } = useCart();

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);

  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const [orderStatus, setOrderStatus] = useState("");
  const [orderId, setOrderId] = useState("");

  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  useEffect(() => {
  const fetchQris = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("qris_image_url")
      .limit(1)
      .single();

    if (error) {
      console.error("Gagal mengambil QRIS:", error);
      return;
    }

    setQrisImageUrl(data?.qris_image_url || "");
  };

  fetchQris();
}, []);

  const formatRupiah = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLat(position.coords.latitude);
        setCustomerLng(position.coords.longitude);
        setLocationSelected(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);

        setLocationLoading(false);

        alert(
          "Lokasi tidak dapat diambil. Pastikan izin lokasi sudah diaktifkan."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitOrder = async () => {
    if (isSubmittingOrder) return;

    if (!customerName.trim()) {
      alert("Silakan isi nama pelanggan.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Silakan isi nomor WhatsApp.");
      return;
    }

    if (!customerAddress.trim()) {
      alert("Silakan isi alamat pengiriman.");
      return;
    }

    if (!paymentProof) {
      alert("Silakan upload bukti pembayaran.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    setIsSubmittingOrder(true);

    const newOrderId = `RB-${Date.now()}`;

    try {
      let paymentProofUrl = "";

      const fileExt =
        paymentProof.name.split(".").pop() || "jpg";

      const fileName =
        `${newOrderId}-${Date.now()}.${fileExt}`;

      const filePath = `orders/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("payment-proofs")
          .upload(filePath, paymentProof, {
            upsert: false,
          });

      if (uploadError) {
        console.error(uploadError);

        alert(
          "Bukti pembayaran gagal diupload. Silakan coba lagi."
        );

        setIsSubmittingOrder(false);
        return;
      }

      paymentProofUrl = filePath;

      const { error } = await supabase
        .from("orders")
        .insert({
          order_id: newOrderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          customer_note: customerNote,
          customer_lat: customerLat,
          customer_lng: customerLng,
          items: cartItems,
          total_amount: cartTotal,
          payment_proof_url: paymentProofUrl,
          payment_status: "Menunggu Verifikasi Admin",
          order_status: "Pesanan Baru",
        });

      if (error) {
        console.error(error);

        alert(
          "Pesanan gagal disimpan. Silakan coba lagi."
        );

        setIsSubmittingOrder(false);
        return;
      }

      setOrderId(newOrderId);
      setOrderStatus("Menunggu Verifikasi Admin");

      setIsSubmittingOrder(false);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setIsOrderSuccessOpen(true);
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan saat memproses pesanan."
      );

      setIsSubmittingOrder(false);
    }
  };

  const sendOrderToWhatsApp = () => {
    const message = `
🍎 PESANAN BARU — RATU BUAH

🧾 No. Pesanan: ${orderId}
👤 Nama: ${customerName}
📱 No. HP: ${customerPhone}
📍 Alamat: ${customerAddress}

🛒 Pesanan:
${cartItems
  .map(
    (item) =>
      `• ${item.name} × ${item.quantity} — ${item.price}`
  )
  .join("\n")}

💰 Total: ${formatRupiah(cartTotal)}

💳 Pembayaran: ${orderStatus}

📎 Bukti pembayaran sudah diupload melalui website.
`;

    const whatsappUrl =
      `https://wa.me/${6282167107099}?text=` +
      encodeURIComponent(message);

    window.open(whatsappUrl, "_blank");

    setCartItems([]);
    setIsOrderSuccessOpen(false);
  };

  if (!isCartOpen && !isCheckoutOpen && !isOrderSuccessOpen) {
    return null;
  }

  return (
    <>
      {/* =========================
          KERANJANG
      ========================== */}
      {isCartOpen && !isCheckoutOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Tutup keranjang"
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#16452F] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-black">
                  Keranjang Belanja
                </h2>

                <p className="text-xs text-white/70">
                  {cartCount} item
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
              >
                ×
              </button>
            </div>

            {/* Isi */}
            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 text-5xl">🛒</div>

                  <h3 className="text-lg font-bold text-[#243629]">
                    Keranjang masih kosong
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Yuk pilih produk terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-[#243629]">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm font-bold text-[#16452F]">
                            {item.price}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.name)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 font-bold text-[#16452F] hover:bg-gray-50"
                              >
                                −
                              </button>

                              <span className="w-6 text-center text-sm font-bold">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.name)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16452F] font-bold text-white hover:bg-[#24583F]"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(item.name)
                              }
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-5">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Total item
                    </span>

                    <span className="text-sm font-bold text-[#243629]">
                      {cartCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#243629]">
                      Total Belanja
                    </span>

                    <span className="text-xl font-black text-[#16452F]">
                      {formatRupiah(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full rounded-2xl bg-[#16452F] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F]"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================
          CHECKOUT
      ========================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-3xl bg-[#16452F] px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-black">
                  Pembayaran
                </h2>

                <p className="text-xs text-white/70">
                  Lengkapi data pesanan Anda
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white/20"
              >
                ×
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-5">
              {/* Data pelanggan */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#243629]">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    placeholder="Nama pelanggan"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#16452F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#243629]">
                    Nomor WhatsApp
                  </label>

                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#16452F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#243629]">
                    Alamat Pengiriman
                  </label>

                  <textarea
                    value={customerAddress}
                    onChange={(e) =>
                      setCustomerAddress(e.target.value)
                    }
                    rows={3}
                    placeholder="Masukkan alamat lengkap..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#16452F]"
                  />
                </div>

                {/* GPS */}
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#16452F]">
                        Lokasi Pengiriman
                      </h3>

                      <p className="mt-1 text-xs text-gray-600">
                        Tambahkan lokasi GPS agar driver lebih mudah menemukan alamat.
                      </p>
                    </div>

                    <span className="text-xl">📍</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="mt-3 w-full rounded-xl bg-[#16452F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locationLoading
                      ? "Mengambil lokasi..."
                      : locationSelected
                        ? "✓ Lokasi Berhasil Dipilih"
                        : "Gunakan Lokasi Saya"}
                  </button>

                  {locationSelected && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      Lokasi GPS berhasil ditambahkan ke pesanan.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#243629]">
                    Catatan Pesanan
                    <span className="ml-1 font-normal text-gray-400">
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    value={customerNote}
                    onChange={(e) =>
                      setCustomerNote(e.target.value)
                    }
                    rows={2}
                    placeholder="Contoh: semangkanya dipotong-potong"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#16452F]"
                  />
                </div>

                {/* Ringkasan */}
                <div className="rounded-2xl bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-black text-[#243629]">
                    Ringkasan Pesanan
                  </h3>

                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-gray-600">
                          {item.name} × {item.quantity}
                        </span>

                        <span className="font-bold text-[#243629]">
                          {item.price}
                        </span>
                      </div>
                    ))}

                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                      <span className="font-bold text-[#243629]">
                        Total
                      </span>

                      <span className="text-xl font-black text-[#16452F]">
                        {formatRupiah(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

               <div className="flex min-h-[180px] items-center justify-center rounded-2xl border-2 border-dashed border-yellow-300 bg-white p-6 text-center">
                {qrisImageUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={qrisImageUrl}
                      alt="QRIS Ratu Buah"
                      className="max-h-72 w-auto rounded-xl object-contain"
                    />

                    <p className="mt-3 text-xs font-semibold text-[#243629]">
                      Scan QRIS untuk melakukan pembayaran
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 text-4xl">▦</div>

                    <p className="text-sm font-bold text-[#243629]">
                      QRIS Belum Tersedia
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      QRIS Ratu Buah akan ditampilkan di sini setelah tersedia.
                    </p>
                  </div>
                )}
              </div>

                {/* Bukti pembayaran */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[#243629]">
                    Bukti Pembayaran
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPaymentProof(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm"
                  />

                  {paymentProof && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      ✓ {paymentProof.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full rounded-2xl border border-gray-200 py-3.5 text-sm font-bold text-[#243629] transition hover:bg-gray-50"
                >
                  Kembali ke Keranjang
                </button>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmittingOrder}
                  className="w-full rounded-2xl bg-[#16452F] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingOrder
                    ? "Memproses Pesanan..."
                    : "Konfirmasi Pesanan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PESANAN BERHASIL
      ========================== */}
      {isOrderSuccessOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h2 className="mt-4 text-xl font-black text-[#243629]">
              Pesanan Berhasil!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Pesanan kamu sudah masuk dan menunggu verifikasi admin.
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Nomor Pesanan
              </p>

              <p className="mt-1 text-lg font-black text-[#16452F]">
                {orderId}
              </p>

              <p className="mt-2 text-xs font-semibold text-yellow-700">
                {orderStatus}
              </p>
            </div>

            <button
              type="button"
              onClick={sendOrderToWhatsApp}
              className="mt-5 w-full rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-green-700"
            >
              Kirim Detail ke WhatsApp
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOrderSuccessOpen(false);
                setCustomerName("");
                setCustomerPhone("");
                setCustomerAddress("");
                setCustomerNote("");
                setCustomerLat(null);
                setCustomerLng(null);
                setLocationSelected(false);
                setPaymentProof(null);
              }}
              className="mt-3 w-full rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}