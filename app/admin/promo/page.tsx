"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import { supabase } from "../../../lib/supabase";

type Promo = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  promo_type: string;
  price: number | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  is_active: boolean;
};

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  // FORM
  const [promoType, setPromoType] = useState("small");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  // EDIT
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  // ==============================
  // AMBIL DATA PROMO
  // ==============================

  const fetchPromos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .order("promo_type", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Gagal mengambil promo:", error);
      setLoading(false);
      return;
    }

    setPromos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  // ==============================
  // RESET FORM
  // ==============================

  const resetForm = () => {
    setPromoType("small");
    setTitle("");
    setDescription("");
    setImageFile(null);
    setSortOrder(0);
    setIsActive(true);
  };

  // ==============================
  // EDIT PROMO
  // ==============================

  const handleEditPromo = (promo: Promo) => {
    setEditingPromo(promo);

    setPromoType(promo.promo_type);
    setTitle(promo.title);
    setDescription(promo.description || "");
    setImageFile(null);
    setSortOrder(promo.sort_order);
    setIsActive(promo.is_active);

    setShowForm(true);
  };

  // ==============================
  // SIMPAN PROMO
  // ==============================

  const handleSavePromo = async () => {
    if (!title.trim()) {
      alert("Judul promo wajib diisi.");
      return;
    }

    if (!editingPromo && !imageFile) {
      alert("Silakan pilih gambar promo.");
      return;
    }

    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = editingPromo?.image_url || null;
      let uploadedFilePath: string | null = null;

      // ==============================
      // UPLOAD GAMBAR
      // ==============================

      if (imageFile) {
        const fileExt =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${fileExt}`;

        const filePath = `promos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("promo-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload gambar gagal:", uploadError);
          alert(`Upload gambar gagal: ${uploadError.message}`);
          return;
        }

        uploadedFilePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("promo-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // ==============================
      // MODE EDIT
      // ==============================

      if (editingPromo) {
        const { error: updateError } = await supabase
          .from("promos")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            image_url: imageUrl,
            promo_type: promoType,
            sort_order: sortOrder,
            is_active: isActive,
          })
          .eq("id", editingPromo.id);

        if (updateError) {
          console.error("Gagal mengupdate promo:", updateError);

          if (uploadedFilePath) {
            await supabase.storage
              .from("promo-images")
              .remove([uploadedFilePath]);
          }

          alert(`Gagal mengupdate promo: ${updateError.message}`);
          return;
        }

        // ==============================
        // HAPUS GAMBAR LAMA
        // ==============================

        if (imageFile && editingPromo.image_url) {
          try {
            const oldUrl = new URL(editingPromo.image_url);

            const marker =
              "/storage/v1/object/public/promo-images/";

            const markerIndex =
              oldUrl.pathname.indexOf(marker);

            if (markerIndex !== -1) {
              const oldPath = decodeURIComponent(
                oldUrl.pathname.substring(
                  markerIndex + marker.length
                )
              );

              await supabase.storage
                .from("promo-images")
                .remove([oldPath]);
            }
          } catch (error) {
            console.error(
              "Gagal menghapus gambar lama:",
              error
            );
          }
        }

        alert("Promo berhasil diperbarui!");
      }

      // ==============================
      // MODE TAMBAH
      // ==============================

      else {
        if (!imageUrl) {
          alert("Silakan pilih gambar promo.");
          return;
        }

        const { error: insertError } = await supabase
          .from("promos")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            image_url: imageUrl,
            promo_type: promoType,
            product_id: null,
            price: null,
            start_date: null,
            end_date: null,
            sort_order: sortOrder,
            is_active: isActive,
          });

        if (insertError) {
          console.error(
            "Gagal menyimpan promo:",
            insertError
          );

          if (uploadedFilePath) {
            await supabase.storage
              .from("promo-images")
              .remove([uploadedFilePath]);
          }

          alert(
            `Gagal menyimpan promo: ${insertError.message}`
          );

          return;
        }

        alert("Promo berhasil disimpan!");
      }

      // ==============================
      // RESET
      // ==============================

      resetForm();
      setEditingPromo(null);
      setShowForm(false);

      await fetchPromos();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Terjadi kesalahan saat menyimpan promo.");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // FILTER DATA
  // ==============================

  const heroPromos = promos.filter(
    (promo) => promo.promo_type === "hero"
  );

  const smallPromos = promos.filter(
    (promo) => promo.promo_type === "small"
  );

  // ==============================
  // TAMPILAN
  // ==============================

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f8faf6] p-6">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#16452F]">
                Promo
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Kelola banner informasi dan promo kecil di halaman katalog.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingPromo(null);
                setShowForm(true);
              }}
              className="rounded-xl bg-[#24583F] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#183b29]"
            >
              + Tambah Promo
            </button>
          </div>

          {/* FORM */}

          {showForm && (
            <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#243629]">
                    {editingPromo
                      ? "Edit Promo"
                      : "Tambah Promo"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {editingPromo
                      ? "Perbarui informasi promo yang sudah ada."
                      : "Buat banner baru untuk halaman katalog."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      resetForm();
                      setEditingPromo(null);
                      setShowForm(false);
                    }
                  }}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* JENIS */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Jenis
                  </label>

                  <select
                    value={promoType}
                    onChange={(e) =>
                      setPromoType(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#24583F]"
                  >
                    <option value="hero">
                      Banner Informasi
                    </option>

                    <option value="small">
                      Promo Kecil
                    </option>
                  </select>

                  <p className="mt-2 text-xs text-gray-400">
                    {promoType === "hero"
                      ? "Rekomendasi: 1920 × 700 px"
                      : "Rekomendasi: 900 × 900 px"}
                  </p>
                </div>

                {/* JUDUL */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Judul
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Contoh: Selamat Datang di Ratu Buah"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#24583F]"
                  />
                </div>

                {/* DESKRIPSI */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Deskripsi
                  </label>

                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Contoh: Belanja kebutuhan segar dan kebutuhan rumah tangga dengan mudah."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#24583F]"
                  />
                </div>

                {/* GAMBAR */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Gambar
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Maksimal 10 MB.
                    {promoType === "hero"
                      ? " Rekomendasi 1920 × 700 px."
                      : " Rekomendasi 900 × 900 px."}
                  </p>

                  {editingPromo && !imageFile && (
                    <p className="mt-2 text-xs font-semibold text-gray-500">
                      Biarkan kosong jika tidak ingin mengganti gambar.
                    </p>
                  )}

                  {imageFile && (
                    <p className="mt-2 text-xs font-semibold text-[#24583F]">
                      File dipilih: {imageFile.name}
                    </p>
                  )}
                </div>

                {/* URUTAN */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Urutan Tampil
                  </label>

                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(
                        Number(e.target.value)
                      )
                    }
                    min={0}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#24583F]"
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Status
                  </label>

                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) =>
                      setIsActive(
                        e.target.value === "true"
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#24583F]"
                  >
                    <option value="true">
                      Aktif
                    </option>

                    <option value="false">
                      Nonaktif
                    </option>
                  </select>
                </div>

              </div>

              {/* BUTTON */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setEditingPromo(null);
                    setShowForm(false);
                  }}
                  className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSavePromo}
                  className="rounded-xl bg-[#24583F] px-5 py-3 text-sm font-bold text-white hover:bg-[#183b29] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingPromo
                    ? "Simpan Perubahan"
                    : "Simpan Promo"}
                </button>

              </div>
            </div>
          )}

          {/* BANNER INFORMASI */}

          <section className="mb-8">

            <div className="mb-4">
              <h2 className="text-lg font-black text-[#243629]">
                Banner Informasi
              </h2>

              <p className="text-sm text-gray-500">
                Banner utama yang tampil di bawah header.
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Memuat banner...
                </p>
              </div>
            ) : heroPromos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="text-4xl">
                  🖼️
                </div>

                <p className="mt-3 text-sm font-bold text-gray-500">
                  Belum ada banner informasi.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">

                {heroPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                  >

                    {promo.image_url ? (
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gray-100 text-sm text-gray-400">
                        Tidak ada gambar
                      </div>
                    )}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="font-black text-[#243629]">
                            {promo.title}
                          </h3>

                          {promo.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {promo.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            promo.is_active
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {promo.is_active
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>

                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditPromo(promo)
                          }
                          className="rounded-xl bg-[#edf5ef] px-4 py-2 text-xs font-bold text-[#24583F] transition hover:bg-[#dcebdd]"
                        >
                          Edit Banner
                        </button>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}
          </section>

          {/* PROMO KECIL */}

          <section>

            <div className="mb-4">
              <h2 className="text-lg font-black text-[#243629]">
                Promo Kecil
              </h2>

              <p className="text-sm text-gray-500">
                Promo yang tampil di halaman katalog.
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Memuat promo...
                </p>
              </div>
            ) : smallPromos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="text-4xl">
                  🎁
                </div>

                <p className="mt-3 text-sm font-bold text-gray-500">
                  Belum ada promo kecil.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {smallPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                  >

                    {promo.image_url ? (
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-gray-100 text-sm text-gray-400">
                        Tidak ada gambar
                      </div>
                    )}

                    <div className="p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="text-sm font-black text-[#243629]">
                            {promo.title}
                          </h3>

                          {promo.description && (
                            <p className="mt-1 text-xs text-gray-500">
                              {promo.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            promo.is_active
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {promo.is_active
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>

                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditPromo(promo)
                          }
                          className="rounded-xl bg-[#edf5ef] px-4 py-2 text-xs font-bold text-[#24583F] transition hover:bg-[#dcebdd]"
                        >
                          Edit Promo
                        </button>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>

        </div>
      </main>
    </AdminGuard>
  );
}