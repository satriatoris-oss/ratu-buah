"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./context/CartContext";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [addedProduct, setAddedProduct] = useState("");
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user ?? null);
    setAuthLoading(false);
  };

  checkAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);


  const [customerName, setCustomerName] = useState("");
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
  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user ?? null);
    setAuthLoading(false);
  };

  checkAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
  const fetchSiteSettings = async () => {
    const { data, error } = await supabase
  .from("site_settings")
  .select("*")
  .limit(1)
  .maybeSingle();
    if (error) {
      console.error("Gagal mengambil pengaturan toko:", error);
      return;
    }

    setSiteSettings(data);
  };

  fetchSiteSettings();
}, []);


 const {
  cartItems,
  cartCount,
  cartTotal,
  addToCart: sharedAddToCart,
  isCartOpen,
  setIsCartOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  setCartItems,
} = useCart();


 const sendOrderToWhatsApp = () => {
  const adminWhatsApp = "+62 821-6710-7099";

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

💰 Total: ${cartTotal}

💳 Pembayaran: ${orderStatus}

📎 Saya akan mengirimkan bukti transfer melalui WhatsApp.
`;

  const whatsappUrl =
    `https://wa.me/${6282167107099}?text=` +
    encodeURIComponent(message);

  window.open(whatsappUrl, "_blank");

  setCartItems([]);
};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [supabasePromos, setSupabasePromos] = useState<any[]>([]);
  const [supabaseSmallPromos, setSupabaseSmallPromos] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("Produk Terbaru");

  const [searchQuery, setSearchQuery] = useState("");

  const catalogRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [supabaseCategories, setSupabaseCategories] = useState<any[]>([]);

useEffect(() => {

  if (!searchQuery.trim()) return;

  const timer = setTimeout(() => {

    productsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  }, 300);

  return () => clearTimeout(timer);

}, [searchQuery]);

useEffect(() => {
  const fetchSupabaseData = async () => {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    const { data: promoData, error: promoError } = await supabase
      .from("promos")
      .select("*")
      .eq("is_active", true)
      .eq("promo_type", "hero")
      .order("sort_order", { ascending: true });

      const { data: smallPromoData, error: smallPromoError } = await supabase
      .from("promos")
      .select("*")
      .eq("is_active", true)
      .eq("promo_type", "small")
      .order("sort_order", { ascending: true });
      if (productError) {
        console.error("Gagal mengambil produk:", productError);
      } else {
       console.log("DATA PRODUK:", productData?.map((p) => ({
        name: p.name,
        category: p.category,
      })));
        setSupabaseProducts(productData || []);
      }

   if (categoryError) {
  console.error("Gagal mengambil kategori:", categoryError);
} else {
  console.log("DATA KATEGORI:", categoryData?.map((c) => c.name));
  setSupabaseCategories(categoryData || []);
}

    if (promoError) {
      console.error("Gagal mengambil promo:", promoError);
    } else {
      setSupabasePromos(promoData || []);
      console.log("BANNER INFORMASI:", promoData);
    }

    if (smallPromoError) {
      console.error("Gagal mengambil promo kecil:", smallPromoError);
    } else {
      setSupabaseSmallPromos(smallPromoData || []);
    }
  };

  fetchSupabaseData();
}, []);

 const slides =
  supabasePromos.length > 0
    ? supabasePromos.map((promo) => ({
        image: promo.image_url,
        alt: promo.title,
      }))
    : [
        {
          image: "/slider-1.jpg",
          alt: "Promo Ratu Buah",
        },
        {
          image: "/slider-2.jpg",
          alt: "Ratu Buah - Buah Berkualitas",
        },
        {
          image: "/slider-3.jpg",
          alt: "Kesegaran Buah Ratu Buah",
        },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

const addToCart = (product: {
  name: string;
  price: string;
  image: string;
  stock: number;
}) => {
    const latestProduct = supabaseProducts.find(
    (item) => item.name === product.name
  );

  const latestStock = latestProduct?.stock ?? product.stock;

  if (latestStock <= 0) {
  alert("Produk sedang habis.");
  return;
}

  setAddedProduct(product.name);

setTimeout(() => {
  setAddedProduct("");
}, 1500);


  setCartItems((items) => {
    const existingItem = items.find(
      (item) => item.name === product.name
    );

    if (existingItem) {
  if (existingItem.quantity >= latestStock) {
    alert("Jumlah produk sudah mencapai stok yang tersedia.");
    return items;
  }

  return items.map((item) =>
    item.name === product.name
      ? {
          ...item,
          quantity: item.quantity + 1,
        }
      : item
  );
}

return [
  ...items,
  {
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    stock: product.stock,
  },
];
  });
};

const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const createOrderId = () => {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `RB-${date}-${random}`;
};

const handleGetLocation = () => {
  if (!navigator.geolocation) {
    alert("Browser Anda tidak mendukung fitur lokasi.");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setCustomerLat(lat);
      setCustomerLng(lng);
      setLocationSelected(true);
      setLocationLoading(false);
    },
    (error) => {
      console.error("Gagal mengambil lokasi:", error);
      setLocationLoading(false);

      alert(
        "Lokasi tidak berhasil diambil. Pastikan izin lokasi di browser sudah diaktifkan."
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};




const getPriceNumber = (price: string): number => {
  const number = price.replace(/[^0-9]/g, "");
  return Number(number) || 0;
};


const displayProducts =
  supabaseProducts.length > 0
    ? supabaseProducts.map((product) => ({
        name: product.name,
        stock: product.stock,
        unit: product.unit || "",
        detail: product.description || "",
        price: `Rp ${Number(product.price).toLocaleString("id-ID")}${product.unit ? ` / ${product.unit}` : ""}`,
        image: product.image_url || "/products/apple.jpg",
        category: product.category || "Lainnya",
      }))
    : [];

const filteredProducts = displayProducts.filter((product) => {
  const matchesCategory =
    selectedCategory === "Produk Terbaru" ||
    product.category === selectedCategory;

  const query = searchQuery.toLowerCase().trim();

  const matchesSearch =
    query === "" ||
    product.name.toLowerCase().includes(query) ||
    product.detail.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query);

  return matchesCategory && matchesSearch;
});

  return (
  <main
    id="beranda"
    className="min-h-screen bg-[#f8faf6] text-[#243629]"
  >
     <header className="sticky top-0 z-50 border-b border-[#24583F] bg-[#16452F] shadow-md">
  <div className="mx-auto max-w-7xl px-3 py-2 sm:px-5">

    {/* Baris Utama */}
    <div className="flex items-center gap-2 sm:gap-4">

      {/* Logo */}
      <div className="flex shrink-0 items-center">
        <img
          src="/ratu-buah-logo.png"
          alt="Logo Ratu Buah"
          className="h-12 w-auto object-contain sm:h-16"
        />
      </div>

      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari buah, sayuran, dan produk..."
          className="h-10 min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:h-11 sm:px-4 sm:text-sm"
        />

        <button
          type="button"
          aria-label="Cari"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8EFAE] text-[#16452F] shadow-md transition hover:bg-white sm:h-11 sm:w-11"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>

      {/* Pesanan Saya */}
      {user && (
        <button
          type="button"
          onClick={() => {
            window.location.href = "/pesanan";
          }}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-extrabold text-[#16452F] shadow-md transition hover:bg-gray-100 sm:h-12 sm:px-4 sm:text-sm"
        >
          <span className="text-base sm:text-lg">📦</span>
          <span className="hidden sm:inline">Pesanan Saya</span>
        </button>
      )}

      {/* Keranjang */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        aria-label={`Keranjang belanja, ${cartCount} barang`}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#16452F] shadow-md transition hover:bg-gray-100 sm:h-12 sm:w-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {cartCount > 0 && (
          <span
            key={cartCount}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-bounce items-center justify-center rounded-full border-2 border-white bg-yellow-400 px-1 text-xs font-extrabold text-green-950"
          >
            {cartCount}
          </span>
        )}
      </button>

    </div>

    {/* Navigasi */}
    <nav className="mt-2 overflow-x-auto scrollbar-hide">
  <div className="flex min-w-max items-center justify-center gap-1.5 pb-0.5">

        {[
          { name: "Beranda", href: "#beranda" },
          { name: "Produk", href: "#katalog" },
          { name: "Promo", href: "#promo" },
          { name: "Tentang Kami", href: "#tentang-kami" },
          { name: "Lokasi", href: "#lokasi" },
          { name: "Hubungi", href: "#hubungi" },
        ].map((item, index) => (
          <a
            key={item.name}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition sm:px-4 sm:py-2 sm:text-sm ${
              index === 0
                ? "bg-white text-[#16452F] shadow-sm"
                : "text-white hover:bg-white/15"
            }`}
          >
            {item.name}
          </a>
        ))}

      </div>
    </nav>

  </div>
</header>

{isCartOpen && (
  <div className="fixed inset-0 z-[60]">
    {/* Overlay */}
    <button
      type="button"
      aria-label="Tutup keranjang"
      onClick={() => setIsCartOpen(false)}
      className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
    />

    {isCheckoutOpen && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4">
    {/* Overlay */}
    <button
      type="button"
      aria-label="Tutup checkout"
      onClick={() => setIsCheckoutOpen(false)}
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
    />

        {/* Halaman Pembayaran */}
        <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-[#16452F]">
                Pembayaran Pesanan
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Selesaikan pembayaran untuk melanjutkan pesanan
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Isi Pembayaran */}
          <div className="max-h-[75vh] overflow-y-auto px-6 py-5">

{/* Data Pembeli */}
<div className="mt-5">
  <h3 className="text-sm font-extrabold text-[#243629]">
    Data Pembeli
  </h3>

  <div className="mt-3 space-y-3">

    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-600">
        Nama Lengkap
      </label>

      <input
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Masukkan nama lengkap"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-600">
        Nomor WhatsApp
      </label>

      <input
        type="tel"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        placeholder="08xxxxxxxxxx"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-600">
        Alamat Pengiriman
      </label>

      <textarea
        value={customerAddress}
        onChange={(e) => setCustomerAddress(e.target.value)}
        placeholder="Masukkan alamat lengkap pengiriman"
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-600">
        Catatan Pesanan{" "}
        <span className="font-normal text-gray-400">
          (opsional)
        </span>
      </label>

      <textarea
        value={customerNote}
        onChange={(e) => setCustomerNote(e.target.value)}
        placeholder="Contoh: kirim sore hari, jangan taruh di depan pagar, dll."
        rows={2}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
      <button
  type="button"
  onClick={handleGetLocation}
  disabled={locationLoading}
  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#16452F]/20 bg-[#f8faf6] px-4 py-3 text-sm font-bold text-[#16452F] transition hover:bg-[#eaf3e7] disabled:cursor-not-allowed disabled:opacity-60"
>
  {locationLoading
    ? "📍 Mengambil lokasi..."
    : locationSelected
      ? "✓ Lokasi berhasil dipilih"
      : "📍 Gunakan Lokasi Saya"}
</button>

{locationSelected && (
  <p className="mt-2 text-xs font-medium text-green-600">
    Lokasi GPS berhasil disimpan. Lokasi ini akan digunakan untuk membantu proses pengiriman.
  </p>
)}
    </div>

  </div>
</div>


            {/* QRIS */}
            <div className="mt-5 text-center">
              <p className="text-sm font-extrabold text-[#243629]">
                Scan QRIS untuk melakukan pembayaran
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Gunakan aplikasi pembayaran yang mendukung QRIS
              </p>

              <div className="mx-auto mt-4 flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <div className="text-5xl">▦</div>

                  <p className="mt-3 text-sm font-bold text-gray-500">
                    QRIS TEST
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    QRIS Ratu Buah akan dipasang di sini
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-bold text-yellow-800">
                ⚠️ Mode Testing
              </p>

              <p className="mt-1 text-xs leading-5 text-yellow-700">
                QRIS yang tampil saat ini hanya sebagai contoh.
                Jangan melakukan pembayaran sungguhan melalui QRIS test.
              </p>
            </div>

            {/* Upload Bukti - sementara */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-extrabold text-[#243629]">
                Bukti Pembayaran
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-[#16452F] hover:bg-green-50">
                <span className="text-3xl">📷</span>

                <span className="mt-2 text-sm font-bold text-[#16452F]">
                  Upload Bukti Pembayaran
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG atau screenshot pembayaran
                </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPaymentProof(file);
                    }}
                  />
              </label>
              {paymentProof && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
                <span className="text-xl">✅</span>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#16452F]">
                    Bukti pembayaran dipilih
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {paymentProof.name}
                  </p>
                </div>
              </div>
            )}

              {/* Tombol Kirim Pesanan */}
              <button
              disabled={isSubmittingOrder}
                type="button"
                onClick={async () => {
                if (isSubmittingOrder) return;

                if (!customerName.trim()) {
                alert("Silakan isi nama lengkap terlebih dahulu.");
                return;
              }

              if (!customerPhone.trim()) {
                alert("Silakan isi nomor WhatsApp terlebih dahulu.");
                return;
              }

              if (!customerAddress.trim()) {
                alert("Silakan isi alamat pengiriman terlebih dahulu.");
                return;
              }

              if (!paymentProof) {
                alert("Silakan upload bukti pembayaran terlebih dahulu.");
                return;
              }

              setIsSubmittingOrder(true);

              console.log("SUBMIT CHECKOUT TERJALAN");

              const newOrderId = `RB-${Date.now()}`;

              // Upload bukti pembayaran ke Supabase Storage
              let paymentProofUrl = "";

              if (paymentProof) {
                const fileExt = paymentProof.name.split(".").pop();
                const fileName = `${newOrderId}-${Date.now()}.${fileExt}`;
                const filePath = `orders/${fileName}`;

                const { error: uploadError } = await supabase.storage
                  .from("payment-proofs")
                  .upload(filePath, paymentProof, {
                    upsert: false,
                  });

                if (uploadError) {
                  console.error(uploadError);
                  alert("Bukti pembayaran gagal diupload. Silakan coba lagi.");
                  setIsSubmittingOrder(false);
                  return;
                }

                // Untuk sementara kita simpan path file.
                // Nanti dashboard admin akan menggunakan path ini
                // untuk membuat signed URL dari bucket private.
                paymentProofUrl = filePath;
              }

              console.log("DATA ORDER SEBELUM DISIMPAN:", {
              order_id: newOrderId,
              user_id: user?.id,
              customer_name: customerName,
              customer_phone: customerPhone,
              customer_address: customerAddress,
              customer_lat: customerLat,
              customer_lng: customerLng,
              items: cartItems,
              total_amount: cartTotal,
            });

            const { error } = await supabase.from("orders").insert({
                order_id: newOrderId,
                user_id: user?.id ?? null,
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

              console.log("HASIL SIMPAN ORDER:", error);

              if (error) {
                console.error(error);
                alert("Pesanan gagal disimpan. Silakan coba lagi.");
                setIsSubmittingOrder(false);
                return;
              }
            
              setOrderId(newOrderId);
              setOrderStatus("Menunggu Verifikasi Admin");

              setIsSubmittingOrder(false);
              setIsCheckoutOpen(false);
              setIsCartOpen(false);
              setIsOrderSuccessOpen(true);
            }}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16452F] py-4 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F] hover:shadow-lg active:scale-[0.99]"
                        >
                          {isSubmittingOrder ? "Menyimpan Pesanan..." : "Kirim Pesanan"}
                          {!isSubmittingOrder && (
                            <span className="text-lg">→</span>
                          )}
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


    {/* Cart Panel */}
    <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-[#16452F]">
            Keranjang Belanja
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {cartCount} item di keranjang
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCartOpen(false)}
          aria-label="Tutup keranjang"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Isi Keranjang */}
      <div className="flex-1 overflow-y-auto p-5">

        {cartItems.length === 0 ? (
          /* Keranjang Kosong */
          <div className="flex h-full flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
              🛒
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-[#16452F]">
              Keranjang masih kosong
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
              Yuk pilih buah dan produk segar favoritmu.
            </p>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="mt-5 rounded-full bg-[#16452F] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#24583F]"
            >
              Mulai Belanja
            </button>

          </div>
        ) : (

          /* Daftar Produk */
          <div className="space-y-4">

            {cartItems.map((item) => (

              <div
                key={item.name}
                className="rounded-2xl border border-gray-100 bg-[#f8faf6] p-3"
              >

                <div className="flex gap-3">

                  {/* Foto Produk */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Informasi Produk */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <div>
                        <h3 className="text-sm font-extrabold text-[#243629]">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.price}
                        </p>
                      </div>

                      {/* Hapus */}
                      <button
                        type="button"
                        onClick={() =>
                        removeFromCart(item.name)
                      }
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Hapus ${item.name}`}
                      >
                        🗑️
                      </button>

                    </div>

                    {/* Quantity + Subtotal */}
                    <div className="mt-3 flex items-center justify-between">

                      {/* Quantity */}
                      <div className="flex items-center rounded-full border border-gray-200 bg-white">

                        <button
                          type="button"
                        onClick={() => decreaseQuantity(item.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#16452F] transition hover:bg-green-50"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-sm font-extrabold text-[#243629]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                         onClick={() => increaseQuantity(item.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#16452F] transition hover:bg-green-50"
                        >
                          +
                        </button>

                      </div>

                      {/* Subtotal */}
                      <span className="text-sm font-black text-[#16452F]">
                        {formatRupiah(
                          getPriceNumber(item.price) *
                            item.quantity
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

              {/* Footer Keranjang */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-100 bg-white px-5 py-4 shadow-[0_-8px_25px_rgba(0,0,0,0.05)]">
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Total Belanja
              </p>

              <p className="mt-1 text-xl font-black text-[#16452F]">
                {formatRupiah(cartTotal)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">
                {cartCount} item
              </p>
            </div>
          </div>

        </div>
      )}

      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-100 bg-white p-5">

          {/* Ringkasan */}
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

          {/* Checkout */}
          <button
            type="button"
           onClick={async () => {
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (!session) {
                window.location.href = "/login?checkout=1";
                return;
              }

              setIsCheckoutOpen(true);
            }}
            className="w-full rounded-2xl bg-[#16452F] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#24583F]"
          >
            Lanjut ke Pembayaran
          </button>

                  </div>
                )}

              </div>
            </div>
          )}

         <section className="bg-[#eef7e9]">
  <div className="mx-auto max-w-7xl px-5 py-6 md:py-8">
    <div className="relative overflow-hidden rounded-3xl bg-[#16452F] shadow-lg">
      <div className="relative aspect-[16/6] w-full overflow-hidden">

        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.image}
              className="relative h-full min-w-full"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Tombol indikator */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Tampilkan slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  </div>
</section>

            <section
                ref={catalogRef}
                className="mx-auto max-w-7xl px-5 py-12"
              >
              <div className="mb-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                Pilihan untukmu
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#243629] md:text-3xl">
                Belanja berdasarkan kategori
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Pilih kategori favoritmu
              </p>
            </div>

      {/* Kategori */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {supabaseCategories.map((category) => (
          <button
            key={category.id}
            type="button"
        onClick={() => {
  setSelectedCategory(category.name);

  setTimeout(() => {
    productsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}}

            className={`group flex min-w-[110px] shrink-0 flex-col items-center rounded-2xl border px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-1 ${
              selectedCategory === category.name
                ? "border-[#16452F] bg-[#16452F] text-white shadow-md"
                : "border-gray-100 bg-white hover:border-green-200 hover:shadow-md"
            }`}
          >
            <span
              className={`mt-3 text-center text-sm font-bold ${
                selectedCategory === category.name
                  ? "text-white"
                  : "text-[#243629]"
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>

    </section>


 {/* PROMO RATU BUAH */}
<section
  id="promo"
  className="scroll-mt-32 bg-[#16452F]"
>
  <div className="mx-auto max-w-7xl px-5 py-8">

    {/* Judul Promo */}
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#E0A11A]" />

        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E0A11A]">
          Penawaran spesial
        </p>
      </div>

      <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
        Promo Ratu Buah
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
        Dapatkan berbagai penawaran menarik untuk belanja kebutuhan Anda.
      </p>
    </div>

    {/* Promo Kecil */}
    {supabaseSmallPromos.length > 0 ? (
      <div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {supabaseSmallPromos.map((promo) => (
            <article
              key={promo.id}
              className="group w-[180px] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[200px] md:w-[220px]"
            >
              {/* Gambar Promo */}
              <div className="relative aspect-[1.15/1] overflow-hidden bg-[#f5f8f2]">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute left-2 top-2 rounded-full bg-[#16452F] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white shadow">
                  Promo
                </div>
              </div>

              {/* Informasi Promo */}
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#243629]">
                  {promo.title}
                </h3>

                {promo.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
                    {promo.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 py-10 text-center">
        <p className="text-sm font-semibold text-white/70">
          Belum ada promo saat ini.
        </p>
      </div>
    )}
  </div>
</section>

<section
  id="katalog"
  ref={productsRef}
  className="scroll-mt-20 mx-auto max-w-7xl px-5 pt-16 pb-20"
>
  
  {/* Header katalog */}
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-lime-500" />
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-green-700">
          Produk pilihan
        </p>
      </div>

      <h2 className="text-3xl font-black tracking-tight text-[#243629] md:text-4xl">
        Segar untuk setiap hari
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
        Pilihan buah dan kebutuhan segar berkualitas untuk keluarga Anda.
      </p>
      
    </div>

    <Link
      href="/katalog"
      className="hidden shrink-0 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-bold text-green-800 shadow-sm transition hover:border-green-400 hover:bg-green-50 sm:block"
    >
      Lihat semua produk →
    </Link>
  </div>

  {/* Product Grid */}
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  {filteredProducts.length === 0 ? (
    <div className="col-span-full flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 text-center">
      
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
        🔍
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-[#16452F]">
        Produk tidak ditemukan
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        Maaf, kami belum menemukan produk yang sesuai dengan
        pencarian kamu.
      </p>

      <button
        type="button"
        onClick={() => setSearchQuery("")}
        className="mt-5 rounded-full bg-[#16452F] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#24583F]"
      >
        Tampilkan Semua Produk
      </button>

    </div>
  ) : (


    filteredProducts.map((product) => (
      <article
        key={product.name}
       className="group relative overflow-hidden rounded-2xl border border-[#dfe8dc] bg-white shadow-[0_4px_18px_rgba(22,69,47,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_15px_40px_rgba(22,69,47,0.14)]"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-[#f5f8f2]">
          
          {/* Badge */}
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#16452F] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
            Fresh
          </div>

          {/* Wishlist */}
          <button
            type="button"
            aria-label={`Simpan ${product.name}`}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-500"
          >
            ♡
          </button>

          {/* Product visual */}
            <div className="relative flex h-full w-full items-center justify-center p-3">
            <img
              src={product.image}
              alt={product.name}
              className={`h-full w-full rounded-2xl object-cover transition duration-500 ${
                product.stock <= 0
                  ? "grayscale opacity-60"
                  : "group-hover:scale-105"
              }`}
            />

            {product.stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-black/65 px-6 py-3 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-black uppercase tracking-widest text-white">
                    Stok Habis
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick action */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/30 to-transparent p-3 transition duration-300 group-hover:translate-y-0">
           <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`w-full rounded-xl py-2.5 text-xs font-extrabold shadow-lg transition ${
              product.stock <= 0
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-white text-[#16452F] hover:bg-[#D8EFAE]"
            }`}
          >
            {product.stock <= 0 ? "Stok Habis" : "+ Tambah ke keranjang"}
          </button>
          </div>
        </div>

     {/* Product Info */}
<div className="p-2.5 sm:p-3">

  {/* Label */}
  <p className="text-[9px] font-bold uppercase tracking-wide text-green-600">
    Produk segar
  </p>

  {/* Nama Produk */}
  <h3 className="mt-1 line-clamp-1 text-[16px] font-extrabold leading-5 text-[#243629]">
    {product.name}
  </h3>

  {/* Stok */}
  {product.stock > 0 ? (
    <p
      className={`mt-1 text-[10px] font-semibold ${
        product.stock <= 5
          ? "text-orange-500"
          : "text-gray-500"
      }`}
    >
      Stok: {product.stock} {product.unit}
    </p>
  ) : (
    <p className="mt-1 text-[10px] font-bold text-red-500">
      Stok habis
    </p>
  )}

  {/* Harga + Tombol */}
  <div className="mt-2 flex items-center justify-between gap-2">

    {/* Harga */}
    <p className="min-w-0 truncate text-[13px] font-black leading-none tracking-tight text-[#16452F]">
      {product.price}
    </p>

    {/* Tombol Tambah */}
    <button
      type="button"
      onClick={() => addToCart(product)}
      disabled={product.stock <= 0}
      aria-label={`Tambah ${product.name} ke keranjang`}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm transition ${
        product.stock <= 0
          ? "cursor-not-allowed bg-gray-200 text-gray-400"
          : "bg-[#16452F] text-white hover:bg-[#24583F] active:scale-95"
      }`}
    >
      +
    </button>

  </div>

</div>
      </article>
    ))
  )}

</div>
  {/* Mobile button */}
  <a
  href="#katalog"
  className="hidden shrink-0 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-bold text-green-800 shadow-sm transition hover:border-green-400 hover:bg-green-50 sm:block"
>
  Lihat semua produk →
</a>
</section>

   <footer className="bg-[#173c29] text-white">
  <div className="mx-auto max-w-7xl px-5 py-14">
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

      {/* ================= Ratu Buah ================= */}
      <div>
        <div className="flex items-center">
          <img
            src="/ratu-buah-logo.png"
            alt="Ratu Buah"
            className="h-20 w-auto object-contain"
          />
        </div>

        <p className="mt-2 text-sm font-semibold text-[#D8EFAE]">
          Supermarket Buah & Kebutuhan Harian
        </p>

        <p className="mt-4 max-w-xs text-sm leading-7 text-green-100">
          Menyediakan buah segar, sayuran, kebutuhan sehari-hari,
          dan berbagai produk pilihan untuk keluarga, usaha,
          catering, dan berbagai kebutuhan Anda.
        </p>

        <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-green-100">
          🍃 Segar • Berkualitas • Bersahabat
        </div>
      </div>


      {/* ================= Tentang Kami ================= */}
      <div id="tentang-kami" className="scroll-mt-32">
      <h3 className="text-sm font-black uppercase tracking-wider text-white">
        Tentang Kami
      </h3>

        <div className="mt-4 h-1 w-10 rounded-full bg-[#D8EFAE]" />

        <p className="mt-4 text-sm leading-6 text-green-100">
          Ratu Buah menyediakan berbagai kebutuhan segar dan
          kebutuhan sehari-hari dengan pilihan produk berkualitas
          dan harga yang bersahabat.
        </p>

        <p className="mt-3 text-sm leading-6 text-green-100">
          Kami juga melayani kebutuhan catering, meeting,
          gathering, pernikahan, dan berbagai event lainnya.
        </p>

        <div className="mt-5 space-y-2 text-sm text-green-100">
          <p>✓ Buah & Sayuran Segar</p>
          <p>✓ Kebutuhan Harian</p>
          <p>✓ Pesanan Catering & Event</p>
        </div>
      </div>


      {/* ================= Hubungi Kami ================= */}
      <div id="hubungi">
        <h3 className="text-sm font-black uppercase tracking-wider text-white">
          Hubungi Kami
        </h3>

        <div className="mt-4 h-1 w-10 rounded-full bg-[#D8EFAE]" />

        <div className="mt-4 space-y-3 text-sm text-green-100">

          {/* WhatsApp */}
          <div>
            <p className="font-bold text-white">
              💬 WhatsApp
            </p>

            {siteSettings?.whatsapp ? (
              <a
                href={`https://wa.me/${siteSettings.whatsapp.replace(
                  /^0/,
                  "62"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block transition hover:text-[#D8EFAE]"
              >
                {siteSettings.whatsapp}
              </a>
            ) : (
              <p className="mt-1">
                Akan ditambahkan
              </p>
            )}
          </div>

          {/* Telepon */}
          <div>
            <p className="font-bold text-white">
              📞 Telepon
            </p>

            <p className="mt-1">
              {siteSettings?.phone || "Akan ditambahkan"}
            </p>
          </div>

          {/* Email */}
          {siteSettings?.email && (
            <div>
              <p className="font-bold text-white">
                ✉️ Email
              </p>

              <a
                href={`mailto:${siteSettings.email}`}
                className="mt-1 inline-block transition hover:text-[#D8EFAE]"
              >
                {siteSettings.email}
              </a>
            </div>
          )}

          {/* Sosial Media */}
          <div>
            <p className="font-bold text-white">
              📱 Media Sosial
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              {siteSettings?.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 hover:text-[#D8EFAE]"
                >
                  Instagram
                </a>
              )}

              {siteSettings?.tiktok && (
                <a
                  href={siteSettings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 hover:text-[#D8EFAE]"
                >
                  TikTok
                </a>
              )}

              {siteSettings?.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 hover:text-[#D8EFAE]"
                >
                  Facebook
                </a>
              )}

              {siteSettings?.youtube && (
                <a
                  href={siteSettings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 hover:text-[#D8EFAE]"
                >
                  YouTube
                </a>
              )}

            </div>
          </div>

        </div>
      </div>


      {/* ================= Lokasi ================= */}
      <div id="lokasi">
        <h3 className="text-sm font-black uppercase tracking-wider text-white">
          Lokasi & Jam
        </h3>

        <div className="mt-4 h-1 w-10 rounded-full bg-[#D8EFAE]" />

        <div className="mt-4 text-sm text-green-100">

          <div className="grid grid-cols-1 gap-4">

            {/* Informasi Lokasi */}
            <div>
              <p className="font-bold text-white">
                📍 Lokasi Ratu Buah
              </p>

              <p className="mt-1 leading-6">
                {siteSettings?.address ? (
                  <>
                    {siteSettings.address}

                    {(siteSettings?.city || siteSettings?.province) && (
                      <>
                        <br />
                        {[siteSettings.city, siteSettings.province]
                          .filter(Boolean)
                          .join(", ")}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Lamgugob, Kec. Syiah Kuala,
                    <br />
                    Kota Banda Aceh, Aceh
                  </>
                )}
              </p>

              <a
                href="https://maps.app.goo.gl/Vf2TqkyTPNuDGzo49"
                target="_blank"
                rel="noopener noreferrer"
              className="mt-2 inline-flex items-center font-bold text-[#D8EFAE] transition hover:text-white"
              >
                Buka Google Maps
                <span className="ml-1">→</span>
              </a>
            </div>


            {/* Peta */}
            {siteSettings?.latitude && siteSettings?.longitude && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <iframe
                  src={`https://www.google.com/maps?q=${siteSettings.latitude},${siteSettings.longitude}&z=16&output=embed`}
                  width="100%"
                  height="170"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Ratu Buah"
                />
              </div>
            )}


            {/* Jam Operasional */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-bold text-white">
                🕒 Jam Operasional
              </p>

              <p className="mt-1 text-green-100">
                {siteSettings?.opening_hours || "Buka 24 Jam"}
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>


  {/* ================= Bottom Footer ================= */}
  <div className="border-t border-white/10">
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-center text-xs text-green-100 sm:flex-row sm:items-center sm:justify-between sm:text-left">

      <p>
        © {new Date().getFullYear()} Ratu Buah. Semua hak dilindungi.
      </p>

      <p className="text-green-200/70">
        Segar untuk keluarga, mudah untuk Anda.
      </p>

    </div>
  </div>
</footer>

{isOrderSuccessOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
        ✓
      </div>

      <h2 className="mt-5 text-2xl font-black text-[#16452F]">
        Pesanan Berhasil Dibuat
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Terima kasih. Pesanan kamu sudah diterima dan pembayaran sedang
        menunggu verifikasi admin.
      </p>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-bold text-gray-500">
          Nomor Pesanan
        </p>

        <p className="mt-1 text-xl font-black tracking-wide text-[#16452F]">
          {orderId}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
        <p className="text-xs font-bold text-gray-500">
          Status Pesanan
        </p>

        <p className="mt-1 text-sm font-black text-[#16452F]">
          {orderStatus}
        </p>
      </div>

      {/* WHATSAPP ADMIN */}
      <button
        type="button"
        onClick={sendOrderToWhatsApp}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1ebe5d]"
      >
        <span className="text-lg">📲</span>
        Kirim Pesanan ke WhatsApp Admin
      </button>

      <p className="mt-2 text-[11px] leading-5 text-gray-400">
        Setelah WhatsApp terbuka, jangan lupa lampirkan foto
        bukti transfer sebelum mengirim pesan.
      </p>

      <button
        type="button"
        onClick={() => setIsOrderSuccessOpen(false)}
        className="mt-4 w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-extrabold text-gray-600 transition hover:bg-gray-50"
      >
        Kembali ke Toko
      </button>

    </div>
  </div>
)}

    </main>
  );
}
