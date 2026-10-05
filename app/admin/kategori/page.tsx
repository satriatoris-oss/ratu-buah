"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  created_at?: string;
  productCount?: number;
};

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
  setLoading(true);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    alert("Gagal mengambil kategori: " + error.message);
    setLoading(false);
    return;
  }

  const categoriesWithCount = await Promise.all(
    (data || []).map(async (category) => {
      const { count } = await supabase
        .from("products")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("category_id", category.id);

      return {
        ...category,
        productCount: count ?? 0,
      };
    })
  );

  setCategories(categoriesWithCount);
  setLoading(false);
}
  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const categoryName = name.trim();

    if (!categoryName) {
      alert("Nama kategori belum diisi.");
      return;
    }

    setSaving(true);

    if (editingId !== null) {
      // EDIT
      const { error } = await supabase
        .from("categories")
        .update({
          name: categoryName,
        })
        .eq("id", editingId);

      if (error) {
        alert("Gagal mengubah kategori: " + error.message);
      } else {
        setName("");
        setEditingId(null);
        await fetchCategories();
      }
    } else {
      // TAMBAH
      const { error } = await supabase
        .from("categories")
        .insert({
          name: categoryName,
        });

      if (error) {
        alert("Gagal menambahkan kategori: " + error.message);
      } else {
        setName("");
        await fetchCategories();
      }
    }

    setSaving(false);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
  }

  async function deleteCategory(id: number) {
  const confirmed = confirm(
    "Yakin ingin menghapus kategori ini?"
  );

  if (!confirmed) return;

  const { count, error: checkError } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", id);

  if (checkError) {
    alert(
      "Gagal memeriksa penggunaan kategori: " +
        checkError.message
    );
    return;
  }

  if ((count ?? 0) > 0) {
    alert(
      `Kategori ini masih digunakan oleh ${count} produk. Hapus atau pindahkan produk tersebut terlebih dahulu.`
    );
    return;
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    alert(
      "Gagal menghapus kategori: " +
        error.message
    );
  } else {
    await fetchCategories();
  }
}

  return (
    <main className="min-h-screen bg-[#f8faf6] p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#16452F]">
            Kategori Produk
          </h1>

          <p className="mt-1 text-gray-600">
            Kelola kategori produk Ratu Buah
          </p>
        </div>

        {/* FORM */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {editingId !== null
              ? "Edit Kategori"
              : "Tambah Kategori"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Buah, Sayur, Minuman..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-[#16452F]/20"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#16452F] px-6 py-3 font-semibold text-white transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Menyimpan..."
                : editingId !== null
                ? "Simpan Perubahan"
                : "+ Tambah Kategori"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Batal
              </button>
            )}
          </form>
        </div>

        {/* DAFTAR KATEGORI */}
        <div className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Kategori
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">
              Memuat kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-gray-500">
              Belum ada kategori.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 p-5"
                >

                  {/* NAMA */}
                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f2ec] font-semibold text-[#16452F]">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        {category.name}
                      </p>

                      <p className="text-sm text-gray-400">
                        {category.productCount ?? 0} produk
                        </p>

                      <p className="text-sm text-gray-400">
                        ID: {category.id}
                      </p>
                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => startEdit(category)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-[#16452F] transition hover:bg-[#e8f2ec]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category.id)
                      }
                      className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Hapus
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}