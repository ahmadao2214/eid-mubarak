import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import QRCode from "qrcode";
import "./Gallery.css";

export default function Gallery() {
  const renders = useQuery(api.gallery.listCompleted) ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadRef = useRef<HTMLVideoElement>(null);
  const [qrSvg, setQrSvg] = useState<string>("");

  // Get expo URL from query params
  const expoUrl =
    new URLSearchParams(window.location.search).get("expo") ?? "";

  // Generate QR code SVG
  useEffect(() => {
    if (!expoUrl) return;
    QRCode.toString(expoUrl, { type: "svg", margin: 1 }).then(setQrSvg);
  }, [expoUrl]);

  // Keep currentIndex in bounds when new renders arrive
  useEffect(() => {
    if (renders.length > 0 && currentIndex >= renders.length) {
      setCurrentIndex(0);
    }
  }, [renders.length, currentIndex]);

  // Preload next video
  useEffect(() => {
    if (renders.length > 1 && preloadRef.current) {
      const nextIndex = (currentIndex + 1) % renders.length;
      preloadRef.current.src = renders[nextIndex].outputS3Url;
      preloadRef.current.load();
    }
  }, [currentIndex, renders]);

  const advanceToNext = useCallback(() => {
    if (renders.length <= 1) {
      // Only one video — replay it
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      return;
    }

    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
      setCurrentIndex((prev) => (prev + 1) % renders.length);
    }, 2000);
  }, [renders.length]);

  const handleEnded = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const handleFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen();
  }, []);

  const handleUnmute = useCallback(() => {
    setMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  }, []);

  const currentRender = renders[currentIndex];

  return (
    <div className="gallery-container">
      <div className="gallery-main">
        {renders.length === 0 ? (
          <div className="gallery-waiting" data-testid="waiting-screen">
            <div className="gallery-waiting-text">Waiting for vibes...</div>
            <div className="gallery-waiting-sub">
              Create a video on your phone to get started
            </div>
          </div>
        ) : showTransition ? (
          <div className="gallery-transition" data-testid="transition-card">
            <div className="gallery-transition-text">Eid Mubarak</div>
            <div className="gallery-transition-sub">Next video coming up...</div>
          </div>
        ) : (
          currentRender && (
            <video
              ref={videoRef}
              key={currentRender._id}
              className="gallery-video"
              src={currentRender.outputS3Url}
              autoPlay
              muted={muted}
              playsInline
              onEnded={handleEnded}
              data-testid="gallery-video"
            />
          )
        )}

        {/* Preload next video */}
        {renders.length > 1 && (
          <video
            ref={preloadRef}
            className="gallery-video-preload"
            data-testid="preload-video"
          />
        )}

        {/* Counter */}
        {renders.length > 0 && !showTransition && (
          <div className="gallery-counter" data-testid="video-counter">
            {currentIndex + 1} / {renders.length}
          </div>
        )}

        {/* Fullscreen button */}
        <button
          className="gallery-fullscreen-btn"
          onClick={handleFullscreen}
          data-testid="fullscreen-btn"
        >
          Fullscreen
        </button>

        {/* Unmute button */}
        {muted && (
          <button
            className="gallery-unmute-btn"
            onClick={handleUnmute}
            data-testid="unmute-btn"
          >
            Unmute
          </button>
        )}
      </div>

      {/* QR Code Sidebar */}
      <div className="gallery-sidebar" data-testid="qr-sidebar">
        <div className="gallery-sidebar-title">Scan to Join!</div>
        {qrSvg ? (
          <div
            className="gallery-qr-wrapper"
            data-testid="qr-code"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <div className="gallery-sidebar-instructions">
            Add <code>?expo=exp://...</code> to URL
          </div>
        )}
        <div className="gallery-sidebar-instructions">
          Open <strong>Expo Go</strong> and scan the QR code
        </div>
        <div className="gallery-sidebar-brand">Eid Mubarak</div>
      </div>
    </div>
  );
}
