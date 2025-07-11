import React from "react";

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="glass-card rounded-xl p-6 shadow-sm">
    {children}
  </div>
);

export default GlassCard;