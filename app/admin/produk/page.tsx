"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  unit: string | null;
  image_url: string | null;
  category: string | null;
  category_id: number | null;
  is_active: boolean;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProdukPage() {
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [loading, setLoading] = useState(true);

const [showForm, setShowForm] = useState(false);
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [name, setName] = useState("");
const [categoryId, setCategoryId] = useState("");
const [price, setPrice] = useState("");
const [stock, setStock] = useState("");
const [unit, setUnit] = useState("");
const [description, setDescription] = useState("");
const [isActive, setIsActive] = useState(true);
const [editingProductId, setEditingProductId] = useState<number | null>(null);

  function getCategoryName(
    categoryId: number | null,
    oldCategory: string | null
  ) {
    if (categoryId !== null) {
      const category = categories.find(
        (item) => item.id === categoryId
      );

      if (category) {
        return category.name;
      }
    }

    // Untuk produk lama yang belum memiliki category_id
    return oldCategory || "-";
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [productsResult, categoriesResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("*")
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
      } else {
        setProducts(productsResult.data || []);
      }

      if (categoriesResult.error) {
        console.error(
          "Gagal mengambil kategori:",
          categoriesResult.error
        );
      } else {
        setCategories(categoriesResult.data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEditProduct = (product: Product) => {
  setEditingProductId(product.id);

  setName(product.name);
  setCategoryId(
    product.category_id !== null
      ? String(product.category_id)
      : ""
  );
  setPrice(String(product.price));
  setStock(String(product.stock));
  setUnit(product.unit || "");
  setDescription(product.description || "");
  setIsActive(product.is_active);

  setSelectedImage(null);
  setImagePreview(product.image_url);

  setShowForm(true);
};


const handleDeleteProduct = async (product: Product) => {
  const confirmed = window.confirm(
    `Yakin ingin menghapus produk "${product.name}"?`
  );

  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      throw error;
    }

    alert("Produk berhasil dihapus.");

    window.location.reload();
  } catch (error: any) {
    console.error("Gagal menghapus produk:", error);

    alert(
      error?.message ||
      "Terjadi kesalahan saat menghapus produk."
    );
  }
};

const handleToggleProduct = async (product: Product) => {
  try {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      throw error;
    }

    window.location.reload();
  } catch (error: any) {
    console.error("Gagal mengubah status produk:", error);

    alert(
      error?.message ||
      "Terjadi kesalahan saat mengubah status produk."
    );
  }
};

const handleSaveProduct = async () => {
  if (!name.trim()) {
    alert("Nama produk wajib diisi.");
    return;
  }

  if (!categoryId) {
    alert("Silakan pilih kategori.");
    return;
  }

  if (!price || Number(price) < 0) {
    alert("Harga produk wajib diisi.");
    return;
  }

  if (!stock || Number(stock) < 0) {
    alert("Stok produk wajib diisi.");
    return;
  }

  try {
    setSaving(true);

    let imageUrl: string | null = null;

    // =========================
    // UPLOAD FOTO
    // =========================
    if (selectedImage) {
      const fileExt = selectedImage.name.split(".").pop();

      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, selectedImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedImage.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // =========================
    // CARI NAMA KATEGORI
    // =========================
    const selectedCategory = categories.find(
      (category) => category.id === Number(categoryId)
    );

    // =========================
    // SIMPAN / UPDATE PRODUK
    // =========================
    if (editingProductId !== null) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          unit: unit.trim() || null,
          ...(imageUrl !== null ? { image_url: imageUrl } : {}),
          category_id: Number(categoryId),
          category: selectedCategory?.name ?? null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProductId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          unit: unit.trim() || null,
          image_url: imageUrl,
          category_id: Number(categoryId),
          category: selectedCategory?.name ?? null,
          is_active: isActive,
        });

      if (insertError) {
        throw insertError;
      }
    }

    alert("Produk berhasil disimpan.");
    window.location.reload();

    // Reset form
    setName("");
    setCategoryId("");
    setPrice("");
    setStock("");
    setDescription("");
    setUnit("");
    setIsActive(true);
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(false);
    setEditingProductId(null);

  } catch (error: any) {
    console.error("Gagal menyimpan produk:", error);

    alert(
      error?.message ||
      "Terjadi kesalahan saat menyimpan produk."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <main className="min-h-screen bg-[#f4f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Manajemen Produk
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#243629] sm:text-3xl">
              Produk
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola produk yang tersedia di Ratu Buah.
            </p>
          </div>

        <button
        type="button"
        onClick={() => setShowForm(true)}
        className="rounded-xl bg-[#16452F] px-5 py-3 font-bold text-white transition hover:bg-[#24583F]"
        >
        + Tambah Produk
        </button>
        </div>

        {/* TAMBAH PRODUK */}
            {showForm && (
            <section className="mb-7 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-[#243629]">
                    {editingProductId !== null ? "Edit Produk" : "Tambah Produk"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                    Masukkan informasi produk Ratu Buah.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-gray-500 transition hover:bg-gray-100"
                >
                    Tutup
                </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                {/* NAMA */}
                <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                    Nama Produk
                </label>

                <input
                    type="text"
                    placeholder="Contoh: Apel Fuji"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                />
                </div>

                {/* KATEGORI */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                    Kategori
                    </label>

                    <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    >
                    <option value="" disabled>
                        Pilih kategori
                    </option>

                    {categories.map((category) => (
                        <option
                        key={category.id}
                        value={category.id}
                        >
                        {category.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* HARGA */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                    Harga
                    </label>

                    <input
                    type="number"
                    min="0"
                    step="1"
                     placeholder="Contoh: 75000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    />
                </div>

                {/* SATUAN */}
                    <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Satuan
                    </label>

                    <input
                        type="text"
                        placeholder="Contoh: kg, pcs, pack"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    />
                    </div>

                {/* STOK */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                    Stok
                    </label>

                    <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 20"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    />
                </div>

                    {/* GAMBAR */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                        Foto Produk
                        </label>

                        <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;

                            setSelectedImage(file);

                            if (file) {
                            setImagePreview(URL.createObjectURL(file));
                            } else {
                            setImagePreview(null);
                            }
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                        />

                        {imagePreview && (
                        <div className="mt-4">
                            <img
                            src={imagePreview}
                            alt="Preview foto produk"
                            className="h-40 w-40 rounded-2xl object-cover"
                            />
                        </div>
                        )}
                    </div>

                {/* STATUS */}
                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                    Status
                    </label>

                    <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    >
                    <option value="true">
                        Aktif
                    </option>

                    <option value="false">
                        Tidak Aktif
                    </option>
                    </select>
                </div>

                {/* DESKRIPSI */}
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                    Deskripsi
                    </label>

                    <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi produk..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
                    />
                </div>

                </div>

                {/* BUTTON */}
                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-600 transition hover:bg-gray-100"
                >
                    Batal
                </button>

               <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="rounded-xl bg-[#16452F] px-6 py-3 font-bold text-white transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                {saving
                ? "Menyimpan..."
                : editingProductId !== null
                ? "Update Produk"
                : "Simpan Produk"}
                </button>

                </div>
            </section>
            )}

        {/* PRODUCT LIST */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-black text-[#243629]">
              Daftar Produk
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {products.length} produk
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#24583F]" />

              <p className="mt-4 text-sm text-gray-500">
                Memuat produk...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">
                🍎
              </div>

              <p className="mt-4 text-sm font-bold text-gray-500">
                Belum ada produk.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Tambahkan produk pertama Ratu Buah.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#f8faf6] text-xs font-bold uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        Produk
                      </th>

                      <th className="px-6 py-4">
                        Kategori
                      </th>

                      <th className="px-6 py-4">
                        Harga
                      </th>

                      <th className="px-6 py-4">
                        Stok
                      </th>

                    <th className="px-6 py-4">
                    Status
                    </th>

                    <th className="px-6 py-4 text-right">
                    Aksi
                    </th>
                    </tr>
                    </thead>

                    
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-[#f8faf6]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">

                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl">
                                  🍎
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-black text-[#243629]">
                                {product.name}
                              </p>

                              {product.description && (
                                <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                                  {product.description}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {getCategoryName(
                              product.category_id,
                              product.category
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-[#16452F]">
                            {formatRupiah(
                              Number(product.price)
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-700">
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                        <button
                            type="button"
                            onClick={() => handleToggleProduct(product)}
                            className={
                            product.is_active
                                ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 transition hover:bg-green-200"
                                : "inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 transition hover:bg-gray-200"
                            }
                        >
                            {product.is_active ? "Aktif" : "Tidak Aktif"}
                        </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                        <button
                            type="button"
                            onClick={() => handleEditProduct(product)}
                            className="rounded-xl bg-[#16452F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#24583F]"
                        >
                            Edit
                        </button>

                            <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                            >
                            Hapus
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-gray-100 md:hidden">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-4">

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            🍎
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-[#243629]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {getCategoryName(
                                product.category_id,
                                product.category
                              )}
                            </p>
                          </div>

                          {product.is_active ? (
                            <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                              Aktif
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                              Tidak Aktif
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm font-black text-[#16452F]">
                            {formatRupiah(
                              Number(product.price)
                            )}
                          </p>

                          <p className="text-xs font-bold text-gray-500">
                            Stok: {product.stock}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </div>
    </main>
  );
}

export default function AdminProdukPage() {
  return (
    <AdminGuard>
      <ProdukPage />
    </AdminGuard>
  );
}