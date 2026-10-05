"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { supabase } from "../../lib/supabase";
import CartCheckout from "../admin/components/CartCheckout";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  category_id: number | null;
  is_active: boolean;
  unit?: string | null;
};

export default function ProdukPage() {
    const {
  cartItems,
  cartCount,
  addToCart,
  setIsCartOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
} = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("Semua Produk");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [productsResult, categoriesResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("categories")
            .select("id, name")
            .order("name", {
              ascending: true,
            }),
        ]);

      if (productsResult.error) {
        console.error(
          "Gagal mengambil produk:",
          productsResult.error
        );
      }

      if (categoriesResult.error) {
        console.error(
          "Gagal mengambil kategori:",
          categoriesResult.error
        );
      }

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
   const selectedCategoryId =
  categories.find(
    (category) => category.name === selectedCategory
  )?.id;

const matchCategory =
  selectedCategory === "Semua Produk" ||
  product.category_id === selectedCategoryId;

      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description || "")
          .toLowerCase()
          .includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
  ]);

  return (
    <main className="min-h-screen bg-[#f8faf6] text-[#243629]">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#24583F] bg-[#16452F] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">

          <Link href="/" className="shrink-0">
            <img
              src="/ratu-buah-logo.png"
              alt="Ratu Buah"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Cari produk..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8EFAE] text-[#16452F] shadow-md"
              aria-label="Cari"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          <Link
            href="/"
            className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20 sm:block"
          >
            ← Beranda
          </Link>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#16452F] shadow-md"
            aria-label="Keranjang"
            >
            <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="9" cy="20" r="1" />
                <circle cx="19" cy="20" r="1" />
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>

            {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-black text-[#16452F]">
                {cartCount}
                </span>
            )}
            </button>



        </div>
      </header>

      {/* Judul */}
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-green-700">
          Katalog Ratu Buah
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
          Semua Produk
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Temukan berbagai buah, sayuran, kebutuhan harian,
          dan produk lainnya di Ratu Buah.
        </p>
      </section>

      {/* Kategori */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">

          <button
            type="button"
            onClick={() =>
              setSelectedCategory("Semua Produk")
            }
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
              selectedCategory === "Semua Produk"
                ? "bg-[#16452F] text-white shadow-md"
                : "border border-green-100 bg-white text-[#243629] hover:border-green-300"
            }`}
          >
            Semua Produk
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setSelectedCategory(category.name)
              }
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                selectedCategory === category.name
                  ? "bg-[#16452F] text-white shadow-md"
                  : "border border-green-100 bg-white text-[#243629] hover:border-green-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Produk */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">
              {selectedCategory}
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length} produk
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            Memuat produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-bold text-[#243629]">
              Produk tidak ditemukan
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Coba gunakan kata pencarian atau kategori lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-[#dfe8dc] bg-white shadow-[0_4px_18px_rgba(22,69,47,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_15px_40px_rgba(22,69,47,0.14)]"
              >

                {/* Gambar */}
                <div className="relative aspect-square overflow-hidden bg-[#f5f8f3]">

                  <img
                    src={
                      product.image_url ||
                      "/products/apple.jpg"
                    }
                    alt={product.name}
                    className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                  />

                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-700">
                        Stok Habis
                      </span>
                    </div>
                  )}
                </div>

                {/* Informasi */}
                <div className="p-4">

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-600">
                    Produk segar
                  </p>

                  <h3 className="mt-2 min-h-[42px] text-[15px] font-black leading-5 text-[#243629]">
                    {product.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500">
                    {product.description ||
                      "Produk berkualitas pilihan Ratu Buah."}
                  </p>

                  {product.stock > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />

                      <p className="text-xs font-bold text-green-600">
                        Tersedia • {product.stock}{" "}
                        {product.unit || "unit"}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-medium text-gray-400">
                      Harga
                    </p>

                    <p className="mt-0.5 text-lg font-black tracking-tight text-[#16452F]">
                      Rp{" "}
                      {Number(
                        product.price
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() =>
                        addToCart({
                        name: product.name,
                        price: `Rp ${Number(product.price).toLocaleString("id-ID")}`,
                        image:
                            product.image_url ||
                            "/products/apple.jpg",
                        stock: product.stock,
                        })
                    }
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${
                        product.stock <= 0
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-[#D8EFAE] text-[#16452F] hover:bg-[#c9e79b] active:scale-[0.98]"
                    }`}
                    >
                    <span className="text-lg leading-none">+</span>
                    {product.stock <= 0
                        ? "Stok Habis"
                        : "Tambah ke Keranjang"}
                    </button>

                </div>
              </article>
            ))}

          </div>
        )}
      </section>

      {/* Footer sederhana */}
      <footer className="border-t border-green-100 bg-[#173c29] py-6 text-center text-xs text-green-100">
        © {new Date().getFullYear()} Ratu Buah. Semua hak dilindungi.
      </footer>

      <CartCheckout />

    </main>
  );
}