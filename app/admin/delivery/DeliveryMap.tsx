"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

type DeliveryMapProps = {
  customerLat: number | null;
  customerLng: number | null;
  customerName: string;
  customerAddress: string;
  onLocationSelect: (lat: number, lng: number) => void;
    isDriver?: boolean;
};

const storeLat = 5.57672;
const storeLng = 95.349513;

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const storeIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50%;
      background:#16452F;
      border:4px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.3);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:20px;
    ">
      🏪
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

const customerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50%;
      background:#dc2626;
      border:4px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.3);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:20px;
    ">
      📍
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (event: L.LeafletMouseEvent) => {
      console.log(
        "MAP DIKLIK:",
        event.latlng.lat,
        event.latlng.lng
      );

      onLocationSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

function MapCenterUpdater({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [map, lat, lng]);

  return null;
}

export default function DeliveryMap({
  customerLat,
  customerLng,
  customerName,
  customerAddress,
  onLocationSelect,
  isDriver = false,
}: DeliveryMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    customerLat !== null && customerLng !== null
      ? {
          lat: customerLat,
          lng: customerLng,
        }
      : null
  );

  const [mapReady, setMapReady] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    setMapReady(true);
  }, 100);

  return () => clearTimeout(timer);
}, []);

    useEffect(() => {
    if (
      customerLat !== null &&
      customerLng !== null
    ) {
      setSelectedLocation({
        lat: customerLat,
        lng: customerLng,
      });
    } else {
      setSelectedLocation(null);
    }
  }, [customerLat, customerLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({
      lat,
      lng,
    });

    onLocationSelect(lat, lng);
  };

  const currentLat = selectedLocation?.lat ?? storeLat;
  const currentLng = selectedLocation?.lng ?? storeLng;

  const distanceKm = selectedLocation
  ? calculateDistance(
      storeLat,
      storeLng,
      selectedLocation.lat,
      selectedLocation.lng
    )
  : null;

  const navigationUrl = selectedLocation
  ? `https://www.google.com/maps/dir/?api=1` +
    `&origin=${storeLat},${storeLng}` +
    `&destination=${selectedLocation.lat},${selectedLocation.lng}` +
    `&travelmode=driving`
  : "#";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="border-b border-gray-100 bg-[#f8faf6] px-5 py-4">
        <p className="text-sm font-black text-[#16452F]">
        {isDriver
          ? "📍 Lokasi Pelanggan"
          : "📍 Tentukan Lokasi Pelanggan"}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {isDriver
          ? "Titik tujuan pengantaran pelanggan."
          : "Klik pada peta tepat di lokasi pelanggan."}
      </p>
      </div>

      <div className="h-[360px] w-full sm:h-[420px]">
        {mapReady && (
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={true}
          className="h-[360px] w-full sm:h-[420px]"
        >
         <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

          <MapCenterUpdater
            lat={currentLat}
            lng={currentLng}
            />

          <MapClickHandler
            onLocationSelect={handleMapClick}
          />

          <Marker
            position={[storeLat, storeLng]}
            icon={storeIcon}
          >
            <Popup>
            <strong>🏪 Ratu Buah</strong>
            <br />
            Titik keberangkatan
          </Popup>
          </Marker>

          {selectedLocation && (
            <Marker
              position={[
                selectedLocation.lat,
                selectedLocation.lng,
              ]}
              icon={customerIcon}
            >
              <Popup>
              <strong>📍 {customerName}</strong>
              <br />
              Tujuan pengantaran
              <br />
              {customerAddress}
            </Popup>
            </Marker>
          )}
        </MapContainer>
        )}
      </div>
      

      <div className="p-5">

              {selectedLocation ? (
          <div className="rounded-xl bg-green-50 p-4">

            <p className="text-sm font-black text-[#16452F]">
              ✓ Lokasi pelanggan dipilih
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Latitude: {selectedLocation.lat.toFixed(6)}
            </p>

            <p className="text-xs text-gray-500">
              Longitude: {selectedLocation.lng.toFixed(6)}
            </p>

            {distanceKm !== null && (
              <div className="mt-3 border-t border-green-100 pt-3">
                <p className="text-sm font-black text-[#16452F]">
                  🚚 Jarak dari Ratu Buah
                </p>

                <p className="mt-1 text-lg font-extrabold text-[#16452F]">
                  ± {distanceKm.toFixed(1)} km
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-sm font-bold text-orange-700">
              ⚠️ Lokasi belum ditentukan
            </p>

            <p className="mt-1 text-xs text-orange-600">
              Klik titik lokasi pelanggan pada peta.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">

         <a
          href={navigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!selectedLocation) {
              e.preventDefault();
            }
          }}
          className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
            selectedLocation
              ? "bg-[#16452F] text-white hover:bg-[#24583F]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          🚗 Navigasi
        </a>

        </div>

      </div>

    </div>
  );
}