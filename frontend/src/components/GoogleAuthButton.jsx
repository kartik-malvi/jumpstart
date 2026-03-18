import { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleAuthButton({ elementId, onCredential, onConfigError, text = "signin_with" }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      onConfigError?.("Google login is not configured");
      return;
    }

    let observer;
    let cancelled = false;

    const loadScript = () =>
      new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Google script failed to load"));
        document.body.appendChild(script);
      });

    loadScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;

        const renderButton = () => {
          const container = buttonRef.current;
          if (!container) return;

          const width = Math.max(Math.floor(container.getBoundingClientRect().width), 240);
          container.innerHTML = "";
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            text,
            width,
          });
        };

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: onCredential,
          ux_mode: "popup",
        });

        renderButton();

        observer = new ResizeObserver(() => renderButton());
        observer.observe(buttonRef.current);
      })
      .catch((err) => {
        onConfigError?.(err.message || "Google login failed to load");
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [onCredential, onConfigError, text]);

  return (
    <div className="mt-4 w-full rounded-lg overflow-hidden">
      <div ref={buttonRef} id={elementId} className="w-full min-h-[44px]" />
    </div>
  );
}
