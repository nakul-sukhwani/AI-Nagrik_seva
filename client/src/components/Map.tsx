"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
};

const URGENCY_COLORS: Record<string, string> = {
  Red: '#ef4444',
  Orange: '#f97316',
  Yellow: '#eab308',
  Green: '#22c55e',
};

function getStatusIcon(status: string, urgency_color?: string) {
  const color = urgency_color ? URGENCY_COLORS[urgency_color] || '#94a3b8' : STATUS_COLORS[status] || '#94a3b8';
  const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.916 14 24 14 24S28 23.916 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/><circle cx="14" cy="14" r="7" fill="white" fill-opacity="0.9"/></svg>`);
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38],
  });
}

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  issue_type: string;
  status: string;
  zone_id: string;
  ward_id: string;
  urgency_color?: string;
}

interface MapProps {
  points: MapPoint[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

export default function Map({ points, selectedId, onMarkerClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [26.8467, 80.9462],
      zoom: 11,
      zoomControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    points.forEach(point => {
      const marker = L.marker([point.lat, point.lng], { icon: getStatusIcon(point.status, point.urgency_color) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;">
            <strong style="color:#1e40af">${point.id}</strong><br/>
            <b>Type:</b> ${point.issue_type}<br/>
            <b>Zone:</b> ${point.zone_id} | ${point.ward_id}<br/>
            <b>Status:</b> <span style="color:${STATUS_COLORS[point.status] || '#64748b'};font-weight:600">${point.status}</span>
          </div>
        `);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(point.id));
      }
      markersRef.current[point.id] = marker;
    });
  }, [points, onMarkerClick]);

  // Pan/open popup on selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current[selectedId];
    if (marker) {
      mapRef.current.flyTo(marker.getLatLng(), 15, { animate: true, duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedId]);

  return <div ref={containerRef} className="relative z-0 isolate w-full h-full" style={{ height: '100%', width: '100%' }} />;
}
