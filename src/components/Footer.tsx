import { useEffect, useState } from "react";

export function Footer() {
  const [version, setVersion] = useState("1.2.1");
  const [swVersion, setSwVersion] = useState("");

  useEffect(() => {
    // Get Service Worker version
    if ('serviceWorker' in navigator) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.version) {
          setSwVersion(event.data.version);
        }
      };

      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          );
        }
      });
    }
  }, []);

  return (
    <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <span>© 2024 USDV Platform</span>
          <span>•</span>
          <span>版本: {version}</span>
          {swVersion && (
            <>
              <span>•</span>
              <span>SW: {swVersion.replace('usdv-platform-', '')}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}