"use client";
import { useState } from "react";
import { Thumb } from "@/components/ui/thumb";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl">
        <Thumb src={images[i]} alt={alt} className="h-72 w-full sm:h-96" />
        <span className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur">{i + 1} / {images.length}</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((src, k) => (
          <button key={src} type="button" onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} aria-current={k === i}
            className={cn("overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", k === i ? "border-primary" : "border-transparent")}>
            <Thumb src={src} alt="" className="h-16 w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}