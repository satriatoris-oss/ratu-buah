"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
};

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "customer_name, customer_phone, customer_address, total_amount, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Gagal mengambil data pelanggan:",
          error
        );

        setLoading(false);
        return;
      }

      const customerMap = new Map<string, Customer>();

      (data || []).forEach((order) => {
        const key = order.customer_phone || "Tanpa Nomor";
        const existing = customerMap.get(key);

        if (existing) {
          existing.orderCount += 1;
          existing.totalSpent += Number(
            order.total_amount || 0
          );
        } else {
          customerMap.set(key, {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            orderCount: 1,
            totalSpent: Number(
              order.total_amount || 0
            ),
            lastOrder: order.created_at,
          });
        }
      });

      setCustomers(
        Array.from(customerMap.values())
      );

      setLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8faf6] p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#16452F]">
            Pelanggan
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Daftar pelanggan yang pernah melakukan pesanan.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Memuat data pelanggan...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">👥</div>

            <p className="mt-4 text-sm font-bold text-gray-500">
              Belum ada data pelanggan.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-[#f8faf6]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Pelanggan
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      WhatsApp
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Alamat
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Pesanan
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Total Belanja
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {customers.map((customer) => (
                    <tr
                      key={customer.customer_phone}
                      className="transition hover:bg-[#f8faf6]"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#243629]">
                          {customer.customer_name}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-gray-600">
                          {customer.customer_phone}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <p className="text-sm text-gray-600">
                          {customer.customer_address}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                          {customer.orderCount} pesanan
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#16452F]">
                          Rp{" "}
                          {customer.totalSpent.toLocaleString(
                            "id-ID"
                          )}
                        </p>
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