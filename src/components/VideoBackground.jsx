import { useState, useEffect } from 'react';

export default function VideoBackground({
  desktopSrc,
  mobileSrc,
  posterSrc = '/videos/khaas-chai-bg-poster.svg',
  className = '',
  fallbackClassName = 'bg-surface-container-low',
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [useFallback, setUseFallback] = useState(true);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

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
      setUseFallback(true);
      setVideoSrc('');
      return;
    }

    const src = isMobile ? (mobileSrc || desktopSrc) : desktopSrc;
    if (src) {
      setVideoSrc(src);
      setUseFallback(false);
    } else {
      setUseFallback(true);
    }
  }, [isMobile, prefersReducedMotion, desktopSrc, mobileSrc]);

  const handleVideoLoad = () => setVideoLoaded(true);
  const handleVideoError = () => {
    setUseFallback(true);
    setVideoSrc('');
  };

  if (useFallback || !videoSrc) {
    return (
      <div
        className={`relative w-full h-full ${fallbackClassName} ${className}`}
        aria-hidden="true"
        style={{
          backgroundImage: `url(${posterSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} aria-hidden="true">
      <video
        src={videoSrc}
        autoPlay
        muted
        playsInline
        loop
        preload={isMobile ? 'metadata' : 'auto'}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
      {!videoLoaded && (
        <div
          className={`absolute inset-0 ${fallbackClassName} transition-opacity duration-500`}
          style={{
            backgroundImage: `url(${posterSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}