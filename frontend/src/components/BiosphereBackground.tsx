"use client";

import { useAtmosphereStore } from "@/stores/atmosphereStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function BiosphereBackground() {
  const { mode } = useAtmosphereStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {/* FOCUS MODE - DEEP SPACE/NEBULA */}
        {mode === "focus" && (
          <motion.div
            key="focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-zinc-950"
          >
            {/* Dynamic Mesh Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05)_0%,rgba(0,0,0,0)_50%)]" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse-slower" />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[50px_50px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-20" />
          </motion.div>
        )}

        {/* ENERGY MODE - HIGH VOLTAGE/HEAT */}
        {mode === "energy" && (
          <motion.div
            key="energy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-zinc-950"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.08)_0%,rgba(0,0,0,0)_50%)]" />
            <div
              className="absolute w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen opacity-40 transition-transform duration-75"
              style={{
                left: mousePosition.x - 300,
                top: mousePosition.y - 300,
              }}
            />
            <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[80px] animate-pulse" />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] backdrop-contrast-150" />
          </motion.div>
        )}

        {/* ZEN MODE - NATURE/FLOW */}
        {mode === "zen" && (
          <motion.div
            key="zen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-zinc-950"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.05),transparent)]" />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[150px] animate-ping-slow" />

            {/* Falling particles simulation (CSS) */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full blur-[1px] animate-float-1" />
              <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-teal-400 rounded-full blur-[2px] animate-float-2" />
              <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-green-400 rounded-full blur-[1px] animate-float-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIGNETTE ALWAYS ON */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
    </div>
  );
}
