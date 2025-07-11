
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SimpleSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleSearchBar: React.FC<SimpleSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`relative w-full max-w-sm ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-10 pr-4"
    />
  </div>
);
