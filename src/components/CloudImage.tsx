import React, { useEffect, useState } from 'react';
import {
  getCachedCloudMediaSync,
  isCloudMediaUrl,
  resolveCloudMediaUrl,
} from '../services/cloudMediaService';

interface CloudImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

/**
 * Drop-in replacement for <img> that transparently resolves `fsmedia://...`
 * permanent Cloud Firestore media references while rendering regular URLs immediately.
 */
export const CloudImage: React.FC<CloudImageProps> = ({ src, alt = '', className = '', ...rest }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => getCachedCloudMediaSync(src));
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(src && isCloudMediaUrl(src) && !getCachedCloudMediaSync(src)));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setHasError(false);

    if (!src) {
      setResolvedSrc(null);
      setIsLoading(false);
      return;
    }

    if (!isCloudMediaUrl(src)) {
      setResolvedSrc(src);
      setIsLoading(false);
      return;
    }

    const cached = getCachedCloudMediaSync(src);
    if (cached) {
      setResolvedSrc(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    resolveCloudMediaUrl(src).then((dataUrl) => {
      if (!active) return;
      if (dataUrl) {
        setResolvedSrc(dataUrl);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [src]);

  if (!src) return null;

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-slate-200/80 flex items-center justify-center text-[10px] font-semibold text-slate-400 ${className}`}
        aria-label={alt}
      >
        Đang tải ảnh...
      </div>
    );
  }

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-medium text-slate-400 p-2 text-center ${className}`}
      >
        Ảnh đang đồng bộ
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (rest.onError) rest.onError(e);
      }}
      {...rest}
    />
  );
};
