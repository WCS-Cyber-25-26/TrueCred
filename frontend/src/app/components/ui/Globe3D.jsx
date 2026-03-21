"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Must load client-side only — globe.gl requires WebGL + browser APIs
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

/* ── Institution coordinates ────────────────────────────── */
const INSTITUTIONS = [
  { name: "MIT",        lat: 42.36,  lng: -71.09  },
  { name: "Stanford",   lat: 37.43,  lng: -122.17 },
  { name: "Oxford",     lat: 51.76,  lng: -1.26   },
  { name: "ETH Zürich", lat: 47.38,  lng: 8.55    },
  { name: "NUS",        lat: 1.30,   lng: 103.78  },
  { name: "UCL",        lat: 51.52,  lng: -0.13   },
  { name: "TU Berlin",  lat: 52.51,  lng: 13.33   },
  { name: "McGill",     lat: 45.50,  lng: -73.58  },
  { name: "UNSW",       lat: -33.92, lng: 151.23  },
  { name: "Caltech",    lat: 34.14,  lng: -118.13 },
];

/* ── Pre-selected connection arcs ───────────────────────── */
const ARCS = [
  // MIT ↔ Oxford
  { startLat: 42.36,  startLng: -71.09,  endLat: 51.76,  endLng: -1.26   },
  // Stanford ↔ ETH Zürich
  { startLat: 37.43,  startLng: -122.17, endLat: 47.38,  endLng: 8.55    },
  // Oxford ↔ NUS
  { startLat: 51.76,  startLng: -1.26,   endLat: 1.30,   endLng: 103.78  },
  // MIT ↔ McGill
  { startLat: 42.36,  startLng: -71.09,  endLat: 45.50,  endLng: -73.58  },
  // Stanford ↔ UNSW
  { startLat: 37.43,  startLng: -122.17, endLat: -33.92, endLng: 151.23  },
  // ETH Zürich ↔ TU Berlin
  { startLat: 47.38,  startLng: 8.55,    endLat: 52.51,  endLng: 13.33   },
  // NUS ↔ UNSW
  { startLat: 1.30,   startLng: 103.78,  endLat: -33.92, endLng: 151.23  },
  // UCL ↔ MIT
  { startLat: 51.52,  startLng: -0.13,   endLat: 42.36,  endLng: -71.09  },
  // Caltech ↔ ETH Zürich
  { startLat: 34.14,  startLng: -118.13, endLat: 47.38,  endLng: 8.55    },
  // McGill ↔ UCL
  { startLat: 45.50,  startLng: -73.58,  endLat: 51.52,  endLng: -0.13   },
  // TU Berlin ↔ NUS
  { startLat: 52.51,  startLng: 13.33,   endLat: 1.30,   endLng: 103.78  },
  // UNSW ↔ Caltech
  { startLat: -33.92, startLng: 151.23,  endLat: 34.14,  endLng: -118.13 },
];

export default function Globe3D({ height = 500 }) {
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);
  const [mounted, setMounted] = useState(false);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Configure controls once globe is ready
  useEffect(() => {
    // Give the dynamic import + render a moment to finish
    const timer = setTimeout(() => {
      if (!globeRef.current) return;
      try {
        const controls = globeRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        // Tilt slightly toward viewer
        globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 1.5 });
        setMounted(true);
      } catch (_) {
        // Controls not ready yet — will resolve on next render
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height }}
    >
      {/* Skeleton while globe loads */}
      {!mounted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full animate-ping-slow"
            style={{
              width: Math.min(width, height) * 0.7,
              height: Math.min(width, height) * 0.7,
              border: "1px solid rgba(37,99,235,0.25)",
              backgroundColor: "rgba(13,31,60,0.3)",
            }}
          />
        </div>
      )}

      <Globe
        ref={globeRef}
        width={width}
        height={height}
        // Transparent canvas bg — the section provides the background
        backgroundColor="#00000000"
        rendererConfig={{ antialias: true, alpha: true }}
        // Dark earth texture (night/city-lights look)
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        // Blue atmosphere glow
        atmosphereColor="#1d4ed8"
        atmosphereAltitude={0.28}
        // Institution dots
        pointsData={INSTITUTIONS}
        pointLat="lat"
        pointLng="lng"
        pointRadius={0.45}
        pointAltitude={0.008}
        pointColor={() => "#93c5fd"}
        // Connection arcs
        arcsData={ARCS}
        arcColor={() => ["rgba(37,99,235,0.9)", "rgba(147,197,253,0.7)"]}
        arcDashLength={0.5}
        arcDashGap={0.25}
        arcDashAnimateTime={2200}
        arcStroke={0.5}
        arcAltitudeAutoScale={0.35}
        // Labels on dots
        labelsData={INSTITUTIONS}
        labelLat="lat"
        labelLng="lng"
        labelText="name"
        labelSize={1.2}
        labelColor={() => "rgba(147,197,253,0.85)"}
        labelResolution={2}
        labelAltitude={0.015}
      />
    </div>
  );
}
