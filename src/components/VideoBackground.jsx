import { useState, useEffect, useRef } from 'react';

export default function VideoBackground({
  desktopSrc,
  mobileSrc,
  posterSrc = '/videos/khaas-chai-bg-poster.svg',
  className = '',
  fallbackClassName = 'bg-surface-container-low',
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVideoSrc('');
      return;
    }

    const src = isMobile ? (mobileSrc || desktopSrc) : desktopSrc;
    if (!src) {
      setVideoSrc('');
      return;
    }

    let cancelled = false;
    let timeoutId;

    const startVideoLoad = () => {
      if (!cancelled) {
        setVideoLoaded(false);
        setVideoSrc(src);
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(startVideoLoad, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(idleId);
      };
    }

    timeoutId = window.setTimeout(startVideoLoad, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isMobile, prefersReducedMotion, desktopSrc, mobileSrc]);

  const handleVideoReady = () => {
    setVideoLoaded(true);
    videoRef.current?.play().catch(() => {
      setVideoSrc('');
      setVideoLoaded(false);
    });
  };

  const handleVideoError = () => {
    setVideoSrc('');
    setVideoLoaded(false);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${fallbackClassName} ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${posterSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          onLoadedData={handleVideoReady}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
