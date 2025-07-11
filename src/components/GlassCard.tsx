
import React from "react";

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-black/60 backdrop-blur-md shadow-lg border border-pink-500/20 p-6 mb-6">
    {children}
  </div>
);

export default GlassCard;
