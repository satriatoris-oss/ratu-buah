"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import { supabase } from "../../../lib/supabase";

export default function PengaturanPage() {
      const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isUploadingQris, setIsUploadingQris] = useState(false);

const [form, setForm] = useState({
  store_name: "",
  store_description: "",
  phone: "",
  whatsapp: "",
  address: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  opening_hours: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  delivery_enabled: true,
  delivery_fee: 0,
  minimum_order: 0,
  qris_image_url: "",
});

const handleQrisUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File QRIS harus berupa gambar.");
    return;
  }

  setIsUploadingQris(true);

  const fileExt = file.name.split(".").pop();
  const fileName = `qris-${Date.now()}.${fileExt}`;
  const filePath = `qris/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("qris")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Gagal upload QRIS:", uploadError);
    alert("Gagal mengupload QRIS.");
    setIsUploadingQris(false);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("qris")
    .getPublicUrl(filePath);

  setForm({
    ...form,
    qris_image_url: publicUrl,
  });

  setIsUploadingQris(false);
};

  const handleSave = async () => {
    if (!settings?.id) return;

    setIsSaving(true);

    const { data, error } = await supabase
      .from("site_settings")
      .update({
  store_name: form.store_name,
  store_description: form.store_description,
  phone: form.phone,
  whatsapp: form.whatsapp,
   address: form.address,
  city: form.city,
  province: form.province,
  latitude: form.latitude ? Number(form.latitude) : null,
  longitude: form.longitude ? Number(form.longitude) : null,
  opening_hours: form.opening_hours,
  instagram: form.instagram,
  facebook: form.facebook,
  tiktok: form.tiktok,
  youtube: form.youtube,
  updated_at: new Date().toISOString(),
  delivery_enabled: form.delivery_enabled,
    delivery_fee: form.delivery_fee,
    minimum_order: form.minimum_order,
    qris_image_url: form.qris_image_url,
})
      .eq("id", settings.id)
      .select()
      .single();

    if (error) {
      console.error("Gagal menyimpan pengaturan:", error);
      setIsSaving(false);
      return;
    }

    setSettings(data);
    setIsEditing(false);
    setIsSaving(false);
  };

    useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Gagal mengambil pengaturan:", error);
        setLoading(false);
        return;
      }

      setSettings(data);

setForm({
  store_name: data.store_name || "",
  store_description: data.store_description || "",
  phone: data.phone || "",
  whatsapp: data.whatsapp || "",
  address: data.address || "",
    city: data.city || "",
  province: data.province || "",
  latitude: data.latitude?.toString() || "",
  longitude: data.longitude?.toString() || "",
  opening_hours: data.opening_hours || "",
  instagram: data.instagram || "",
  facebook: data.facebook || "",
  tiktok: data.tiktok || "",
  youtube: data.youtube || "",
  delivery_enabled: data.delivery_enabled ?? true,
    delivery_fee: data.delivery_fee ?? 0,
    minimum_order: data.minimum_order ?? 0,
    qris_image_url: data.qris_image_url || "",
});

setLoading(false);
    };

    fetchSettings();
  }, []);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f8faf6] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 overflow-hidden rounded-3xl bg-[#16452F] shadow-md">
            <div className="flex items-center justify-between px-6 py-7 sm:px-8">
              <div>
                <div className="mb-2">
                  <span className="rounded-full bg-[#D8EFAE] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#16452F]">
                    Admin Ratu Buah
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Pengaturan
                </h1>

                <p className="mt-2 text-sm text-green-100">
                  Kelola informasi dan pengaturan website Ratu Buah.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                ⚙️
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-lg font-bold text-[#243629]">
      Informasi Ratu Buah
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Kelola informasi dasar toko Ratu Buah.
    </p>
  </div>

  {!isEditing && (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="rounded-xl bg-[#16452F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24583F]"
    >
      ✏️ Edit Informasi
    </button>
  )}
</div>

  {loading ? (
  <p className="mt-4 text-sm text-gray-500">
    Memuat pengaturan...
  </p>
) : settings ? (
  isEditing ? (
    <div className="mt-6 space-y-5">

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#243629]">
          Nama Toko
        </label>

        <input
          type="text"
          value={form.store_name}
          onChange={(e) =>
            setForm({
              ...form,
              store_name: e.target.value,
            })
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#243629]">
          Deskripsi Toko
        </label>

        <textarea
          rows={3}
          value={form.store_description}
          onChange={(e) =>
            setForm({
              ...form,
              store_description: e.target.value,
            })
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#243629]">
            Nomor Telepon
          </label>

          <input
            type="text"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#243629]">
            WhatsApp
          </label>

          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) =>
              setForm({
                ...form,
                whatsapp: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
          />
        </div>

      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#243629]">
          Alamat
        </label>

        <textarea
          rows={3}
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
        />
      </div>

     <div className="border-t border-gray-100 pt-5">
  <h3 className="text-base font-bold text-[#243629]">
    📱 Media Sosial
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Masukkan alamat akun media sosial Ratu Buah.
  </p>

  <div className="mt-4 grid gap-5 sm:grid-cols-2">

    <div>
      <label className="mb-2 block text-sm font-semibold text-[#243629]">
        Instagram
      </label>

      <input
        type="text"
        placeholder="@ratubuah"
        value={form.instagram}
        onChange={(e) =>
          setForm({
            ...form,
            instagram: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-[#243629]">
        Facebook
      </label>

      <input
        type="text"
        placeholder="Facebook Ratu Buah"
        value={form.facebook}
        onChange={(e) =>
          setForm({
            ...form,
            facebook: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-[#243629]">
        TikTok
      </label>

      <input
        type="text"
        placeholder="@ratubuah"
        value={form.tiktok}
        onChange={(e) =>
          setForm({
            ...form,
            tiktok: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-[#243629]">
        YouTube
      </label>

      <input
        type="text"
        placeholder="Channel YouTube Ratu Buah"
        value={form.youtube}
        onChange={(e) =>
          setForm({
            ...form,
            youtube: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
      />
    </div>

        <div className="border-t border-gray-100 pt-5">
      <h3 className="text-base font-bold text-[#243629]">
        📍 Lokasi Toko
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Masukkan lokasi toko Ratu Buah untuk kebutuhan informasi dan peta.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#243629]">
            Alamat Toko
          </label>

          <textarea
            rows={3}
            placeholder="Masukkan alamat lengkap Ratu Buah"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#243629]">
              Kota
            </label>

            <input
              type="text"
              placeholder="Contoh: Banda Aceh"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#243629]">
              Provinsi
            </label>

            <input
              type="text"
              placeholder="Contoh: Aceh"
              value={form.province}
              onChange={(e) =>
                setForm({
                  ...form,
                  province: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#243629]">
              Latitude
            </label>

            <input
              type="text"
              placeholder="Contoh: 5.5483"
              value={form.latitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  latitude: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#243629]">
              Longitude
            </label>

            <input
              type="text"
              placeholder="Contoh: 95.3238"
              value={form.longitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  longitude: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-xs leading-5 text-green-800">
            💡 Latitude dan longitude digunakan untuk menentukan titik lokasi
            toko pada peta. Untuk sementara bisa dikosongkan dan diisi nanti
            setelah lokasi toko sudah ditentukan.
          </p>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-100 pt-5">
  <h3 className="text-base font-bold text-[#243629]">
    🚚 Pengaturan Pengiriman
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Atur layanan delivery dan ketentuan belanja Ratu Buah.
  </p>

  <div className="mt-4 space-y-5">
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
      <div>
        <p className="text-sm font-semibold text-[#243629]">
          Delivery Aktif
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Aktifkan layanan pengantaran pesanan pelanggan.
        </p>
      </div>

      <input
        type="checkbox"
        checked={form.delivery_enabled}
        onChange={(e) =>
          setForm({
            ...form,
            delivery_enabled: e.target.checked,
          })
        }
        className="h-5 w-5 accent-[#16452F]"
      />
    </label>

    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#243629]">
          Biaya Pengiriman
        </label>

        <input
          type="number"
          min="0"
          value={form.delivery_fee}
          onChange={(e) =>
            setForm({
              ...form,
              delivery_fee: Number(e.target.value),
            })
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
        />

        <p className="mt-1 text-xs text-gray-400">
          Isi 0 jika ongkir dihitung manual.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#243629]">
          Minimal Belanja
        </label>

        <input
          type="number"
          min="0"
          value={form.minimum_order}
          onChange={(e) =>
            setForm({
              ...form,
              minimum_order: Number(e.target.value),
            })
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#16452F] focus:ring-2 focus:ring-green-100"
        />

        <p className="mt-1 text-xs text-gray-400">
          Isi 0 jika tidak ada minimal belanja.
        </p>
      </div>
    </div>
  </div>
</div>

  </div>
</div>

<div className="border-t border-gray-100 pt-5">
  <h3 className="text-base font-bold text-[#243629]">
    💳 Pengaturan Pembayaran
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Upload QRIS yang akan digunakan pelanggan untuk pembayaran.
  </p>

  <div className="mt-4">
    <label className="mb-2 block text-sm font-semibold text-[#243629]">
      Foto QRIS
    </label>

    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
      {form.qris_image_url ? (
        <div className="space-y-4">
          <div className="flex justify-center rounded-xl bg-white p-4">
            <img
              src={form.qris_image_url}
              alt="QRIS Ratu Buah"
              className="max-h-72 w-auto rounded-lg object-contain"
            />
          </div>

          <p className="text-center text-xs text-gray-500">
            QRIS saat ini sudah tersedia.
          </p>
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="text-4xl">📷</div>

          <p className="mt-2 text-sm font-semibold text-[#243629]">
            Belum ada QRIS
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Upload foto QRIS Ratu Buah setelah QRIS sudah tersedia.
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <label className="cursor-pointer rounded-xl bg-[#16452F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24583F]">
          {isUploadingQris ? "Mengupload..." : "📷 Upload QRIS"}

          <input
            type="file"
            accept="image/*"
            onChange={handleQrisUpload}
            disabled={isUploadingQris}
            className="hidden"
          />
        </label>
      </div>
    </div>
  </div>
</div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() => {
            setIsEditing(false);

            setForm({
            store_name: settings.store_name || "",
            store_description: settings.store_description || "",
            phone: settings.phone || "",
            whatsapp: settings.whatsapp || "",
            address: settings.address || "",
              city: settings.city || "",
            province: settings.province || "",
            latitude: settings.latitude?.toString() || "",
            longitude: settings.longitude?.toString() || "",
            opening_hours: settings.opening_hours || "",
            instagram: settings.instagram || "",
            facebook: settings.facebook || "",
            tiktok: settings.tiktok || "",
            youtube: settings.youtube || "",
            delivery_enabled: settings.delivery_enabled ?? true,
            delivery_fee: settings.delivery_fee ?? 0,
            minimum_order: settings.minimum_order ?? 0,
            qris_image_url: settings.qris_image_url || "",
            });
          }}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-[#16452F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24583F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Perubahan"}
        </button>

      </div>

    </div>
  ) : (
    <div className="mt-5 grid gap-5 sm:grid-cols-2">

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Nama Toko
        </p>
        <p className="mt-1 font-medium text-[#243629]">
          {settings.store_name}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          WhatsApp
        </p>
        <p className="mt-1 font-medium text-[#243629]">
          {settings.whatsapp}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Telepon
        </p>
        <p className="mt-1 font-medium text-[#243629]">
          {settings.phone}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Jam Operasional
        </p>
        <p className="mt-1 font-medium text-[#243629]">
          {settings.opening_hours}
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Alamat
        </p>
        <p className="mt-1 font-medium text-[#243629]">
          {settings.address}
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Deskripsi
        </p>
        <p className="mt-1 leading-6 text-gray-600">
          {settings.store_description}
        </p>
      </div>

    </div>
  )
) : (
  <p className="mt-4 text-sm text-red-500">
    Data pengaturan belum tersedia.
  </p>
)}
</div>
        </div>
      </main>
    </AdminGuard>
  );
}