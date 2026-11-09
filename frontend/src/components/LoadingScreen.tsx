"use client";

import { useEffect, useState, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    startTimeRef.current = performance.now();
    const DURATION = 1200;

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setPhase("reveal"), 200);
        setTimeout(() => {
          setPhase("done");
          document.body.classList.remove("overflow-hidden");
          onCompleteRef.current();
        }, 900);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--background)]"
      style={{
        transition: phase === "reveal" ? "opacity 0.6s ease" : "none",
        opacity: phase === "reveal" ? 0 : 1,
        willChange: "opacity",
      }}
    >
      {/* Logo */}
      <div className="select-none text-center">
        <div
          className="font-heading text-[var(--foreground)]"
          style={{
            fontSize: "clamp(48px, 10vw, 80px)",
            letterSpacing: "0.3em",
            lineHeight: 1,
          }}
        >
          REDSEE
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-[200px] md:w-[260px]">
        <div className="h-px w-full bg-[var(--border)] overflow-hidden">
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "var(--accent)",
              willChange: "width",
            }}
          />
        </div>
      </div>
    </div>
  );
}
