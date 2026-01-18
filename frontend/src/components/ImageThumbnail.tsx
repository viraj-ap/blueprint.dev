import React, { useState } from "react";
import { createPortal } from "react-dom";

/**
 * Get the display URL for an image path or URL
 */
export const getImageSrc = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path; // Remote URL, use directly
  }
  return `/api/image?path=${encodeURIComponent(path)}`; // Local path, proxy through server
};

interface ImageThumbnailProps {
  path: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
}

const SIZES = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  path,
  size = "md",
  onClick,
  onRemove,
  showRemove = true,
  className = "",
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isMaximized, setIsMaximized] = useState(false);
  const sizeClass = SIZES[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setIsMaximized(true);
    }
  };

  return (
    <>
      <div className={`group relative ${sizeClass} ${className}`}>
        {loading && !error && (
          <div
            className={`absolute inset-0 bg-gray-200 rounded animate-pulse`}
          />
        )}

        {error ? (
          <div
            className={`${sizeClass} rounded bg-gray-200 flex items-center justify-center text-gray-500`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        ) : (
          <img
            src={getImageSrc(path)}
            alt="Attachment"
            loading="lazy"
            onClick={handleClick}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            className={`${sizeClass} rounded object-cover border border-gray-200 ${
              onClick || !error ? "cursor-pointer hover:opacity-80" : ""
            }`}
          />
        )}

        {/* Remove button */}
        {showRemove && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isMaximized &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsMaximized(false)}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={getImageSrc(path)}
                alt="Full size attachment"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setIsMaximized(false)}
                className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
