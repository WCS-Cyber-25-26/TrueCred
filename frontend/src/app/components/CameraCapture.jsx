'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, CameraOff } from 'lucide-react';

const BRIGHTNESS_LOW  = 40;
const BRIGHTNESS_HIGH = 210;
const STABILITY_THRESHOLD = 15;
const EDGE_GRADIENT_THRESHOLD = 25;
const EDGE_STRIP_WIDTH = 8;
const ANALYSIS_INTERVAL_MS = 400;
const ALL_PASS_HOLD_MS = 1500;

function getUserMediaErrorMessage(err) {
  switch (err.name) {
    case 'NotAllowedError':  return 'Camera permission denied. Allow access in your browser settings.';
    case 'NotFoundError':    return 'No camera found on this device.';
    case 'NotReadableError': return 'Camera is in use by another application.';
    default:                 return 'Could not access the camera.';
  }
}

function luma(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function checkBrightness(pixels, count) {
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    total += luma(pixels[i], pixels[i + 1], pixels[i + 2]);
  }
  const avg = total / count;
  if (avg < BRIGHTNESS_LOW)  return 'dark';
  if (avg > BRIGHTNESS_HIGH) return 'bright';
  return 'ok';
}

function checkStability(pixels, prevRef, count) {
  const prev = prevRef.current;
  if (!prev) {
    prevRef.current = pixels.slice();
    return 'ok';
  }
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    total += (Math.abs(pixels[i]     - prev[i])
            + Math.abs(pixels[i + 1] - prev[i + 1])
            + Math.abs(pixels[i + 2] - prev[i + 2])) / 3;
  }
  prevRef.current = pixels.slice();
  return (total / count) > STABILITY_THRESHOLD ? 'moving' : 'ok';
}

function stripMaxGradient(pixels, gw, gh, side) {
  let maxGrad = 0;
  const S = EDGE_STRIP_WIDTH;

  if (side === 'top' || side === 'bottom') {
    const rowStart = side === 'top' ? 1 : gh - S;
    const rowEnd   = side === 'top' ? S : gh - 1;
    for (let y = rowStart; y < rowEnd; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const idx = (y * gw + x) * 4;
        const idxP = ((y + 1) * gw + x) * 4;
        const idxM = ((y - 1) * gw + x) * 4;
        const grad = Math.abs(
          luma(pixels[idxP], pixels[idxP + 1], pixels[idxP + 2]) -
          luma(pixels[idxM], pixels[idxM + 1], pixels[idxM + 2])
        );
        if (grad > maxGrad) maxGrad = grad;
      }
    }
  } else {
    const colStart = side === 'left' ? 1 : gw - S;
    const colEnd   = side === 'left' ? S : gw - 1;
    for (let x = colStart; x < colEnd; x++) {
      for (let y = 1; y < gh - 1; y++) {
        const idx  = (y * gw + x) * 4;
        const idxP = (y * gw + x + 1) * 4;
        const idxM = (y * gw + x - 1) * 4;
        const grad = Math.abs(
          luma(pixels[idxP], pixels[idxP + 1], pixels[idxP + 2]) -
          luma(pixels[idxM], pixels[idxM + 1], pixels[idxM + 2])
        );
        if (grad > maxGrad) maxGrad = grad;
      }
    }
  }
  return maxGrad;
}

function checkEdges(pixels, gw, gh) {
  const T = EDGE_GRADIENT_THRESHOLD;
  if (
    stripMaxGradient(pixels, gw, gh, 'top')    >= T &&
    stripMaxGradient(pixels, gw, gh, 'bottom') >= T &&
    stripMaxGradient(pixels, gw, gh, 'left')   >= T &&
    stripMaxGradient(pixels, gw, gh, 'right')  >= T
  ) return 'ok';
  return 'missing';
}

function Pill({ label, status }) {
  const base = 'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors';
  const color =
    status === null    ? 'bg-white/20 text-white' :
    status === 'ok'    ? 'bg-[#22c55e] text-white' :
                         'bg-red-500 text-white';
  return (
    <div className={`${base} ${color}`}>
      {status === 'ok'  && <Check className="w-3 h-3" />}
      {status !== null && status !== 'ok' && <X className="w-3 h-3" />}
      {label}
    </div>
  );
}

export default function CameraCapture({ open, onClose, onCapture }) {
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const streamRef       = useRef(null);
  const prevFrameRef    = useRef(null);
  const analysisTimer   = useRef(null);
  const countdownTimer  = useRef(null);
  const allPassStart    = useRef(null);
  const guideRectRef    = useRef(null);
  const capturePhaseRef = useRef('idle');

  const [cameraReady,  setCameraReady]  = useState(false);
  const [cameraError,  setCameraError]  = useState(null);
  const [checks,       setChecks]       = useState({ brightness: null, stable: null, edges: null });
  const [capturePhase, setCapturePhase] = useState('idle');
  const [countdown,    setCountdown]    = useState(3);
  const [guideRect,    setGuideRect]    = useState(null);

  // Keep ref in sync with state so analyzeFrame can read without closure staleness
  useEffect(() => { capturePhaseRef.current = capturePhase; }, [capturePhase]);

  const computeGuideRect = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const { clientWidth: vw, clientHeight: vh } = v;

    // Standard certificate aspect ratio (A4/Letter landscape = 1.41:1, portrait = 1:1.41)
    // Use landscape ratio when phone is portrait, portrait ratio when phone is landscape
    const isPortraitViewport = vh > vw;
    const RATIO = 1.41; // width:height for landscape cert

    let rectW, rectH;
    if (isPortraitViewport) {
      // Phone upright → fit a landscape certificate: constrain by width
      rectW = Math.round(vw * 0.90);
      rectH = Math.round(rectW / RATIO);
      // If that's too tall, constrain by height instead
      if (rectH > vh * 0.72) {
        rectH = Math.round(vh * 0.72);
        rectW = Math.round(rectH * RATIO);
      }
    } else {
      // Phone sideways → fit a landscape certificate: constrain by height
      rectH = Math.round(vh * 0.85);
      rectW = Math.round(rectH * RATIO);
      if (rectW > vw * 0.90) {
        rectW = Math.round(vw * 0.90);
        rectH = Math.round(rectW / RATIO);
      }
    }

    // Center the rect in the viewport
    const rect = {
      x: Math.round((vw - rectW) / 2),
      y: Math.round((vh - rectH) / 2),
      w: rectW,
      h: rectH,
    };
    guideRectRef.current = rect;
    setGuideRect(rect);
  }, []);

  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const g     = guideRectRef.current;
    if (!video || !g) return;

    const scaleX = video.videoWidth  / video.clientWidth;
    const scaleY = video.videoHeight / video.clientHeight;

    const out = document.createElement('canvas');
    out.width  = g.w;
    out.height = g.h;
    const ctx = out.getContext('2d');
    ctx.drawImage(
      video,
      g.x * scaleX, g.y * scaleY,
      g.w * scaleX, g.h * scaleY,
      0, 0, g.w, g.h,
    );
    out.toBlob(blob => {
      if (blob) onCapture(blob);
      onClose();
    }, 'image/jpeg', 0.92);
  }, [onCapture, onClose]);

  const analyzeFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const g      = guideRectRef.current;
    if (!video || !canvas || !g || video.readyState < 2) return;

    const { w: gw, h: gh } = g;
    canvas.width  = gw;
    canvas.height = gh;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, g.x, g.y, gw, gh, 0, 0, gw, gh);
    const { data: pixels } = ctx.getImageData(0, 0, gw, gh);
    const count = gw * gh;

    const brightness = checkBrightness(pixels, count);
    const stable     = checkStability(pixels, prevFrameRef, count);
    const edges      = checkEdges(pixels, gw, gh);

    setChecks({ brightness, stable, edges });

    const allOk = brightness === 'ok' && stable === 'ok' && edges === 'ok';

    if (capturePhaseRef.current === 'checking') {
      if (allOk) {
        if (!allPassStart.current) allPassStart.current = Date.now();
        else if (Date.now() - allPassStart.current >= ALL_PASS_HOLD_MS) {
          allPassStart.current = null;
          setCapturePhase('countdown');
          setCountdown(3);
        }
      } else {
        allPassStart.current = null;
      }
    } else if (capturePhaseRef.current === 'countdown' && !allOk) {
      // Abort countdown if quality drops
      clearInterval(countdownTimer.current);
      allPassStart.current = null;
      setCapturePhase('checking');
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (capturePhase !== 'countdown') return;

    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          doCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    countdownTimer.current = tick;

    return () => clearInterval(tick);
  }, [capturePhase, doCapture]);

  function handleVideoReady() {
    computeGuideRect();
    setCameraReady(true);
    setCapturePhase('checking');
    analysisTimer.current = setInterval(analyzeFrame, ANALYSIS_INTERVAL_MS);
  }

  // Camera lifecycle
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      } catch (err) {
        if (!cancelled) setCameraError(getUserMediaErrorMessage(err));
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(analysisTimer.current);
      clearInterval(countdownTimer.current);
      setCameraReady(false);
      setCameraError(null);
      setChecks({ brightness: null, stable: null, edges: null });
      setCapturePhase('idle');
      setCountdown(3);
      prevFrameRef.current  = null;
      allPassStart.current  = null;
      guideRectRef.current  = null;
      setGuideRect(null);
    };
  }, [open]);

  // ResizeObserver — recompute guide rect on orientation change / resize
  useEffect(() => {
    if (!cameraReady || !videoRef.current) return;
    const ro = new ResizeObserver(() => {
      computeGuideRect();
    });
    ro.observe(videoRef.current);
    return () => ro.disconnect();
  }, [cameraReady, computeGuideRect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 py-4 z-10">
        <h2 className="text-white font-bold text-lg tracking-tight">Capture Certificate</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleVideoReady}
        className="w-full h-full object-cover"
      />

      {/* Guide rectangle — uses guideRect state, not ref */}
      {guideRect && (
        <>
          {/* Pill indicators — positioned independently above guide rect */}
          <div
            className="absolute flex gap-2 pointer-events-none z-10"
            style={{ left: guideRect.x, top: guideRect.y - 44 }}
          >
            <Pill label="Lighting" status={checks.brightness} />
            <Pill label="Stable"   status={checks.stable} />
            <Pill label="Corners"  status={checks.edges} />
          </div>

          {/* Guide rect border + corners */}
          <div
            className="absolute pointer-events-none"
            style={{ left: guideRect.x, top: guideRect.y, width: guideRect.w, height: guideRect.h }}
          >
            <div className="absolute inset-0 border-2 border-white/60 rounded-lg" />
            <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
          </div>
        </>
      )}

      {/* Countdown overlay */}
      {capturePhase === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold drop-shadow-lg" style={{ fontSize: '10rem', lineHeight: 1 }}>
            {countdown}
          </span>
        </div>
      )}

      {/* Manual capture button */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2">
        <button
          onClick={doCapture}
          aria-label="Capture photo"
          className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg active:scale-95 transition-transform flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-[#043682]" />
        </button>
        <p className="text-white text-xs opacity-60">Tap to capture manually</p>
      </div>

      {/* Hidden analysis canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error overlay */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 text-center z-20">
          <CameraOff className="text-white w-16 h-16 mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Camera Unavailable</p>
          <p className="text-gray-300 text-sm mb-8 max-w-xs">{cameraError}</p>
          <button
            onClick={onClose}
            className="bg-white text-[#043682] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
