'use client'
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function SearchInput({ placeholder = "Rechercher...", debounceDelay = 300 }) {

  const searchParams = useSearchParams()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }, debounceDelay);
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        className="peer block w-full rounded-md border py-[9px] pl-10 text-sm"
        onChange={handleSearch}
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2" />
    </div>
  );
}