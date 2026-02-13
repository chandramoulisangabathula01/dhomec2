"use client";

import { Button } from "@/components/ui/button";
import { Box, Cuboid } from "lucide-react";
import Link from "next/link";

interface ZakekeCustomizeButtonProps {
  templateId: string;
  productName: string;
}

export function ZakekeCustomizeButton({ templateId, productName }: ZakekeCustomizeButtonProps) {
  // TODO: Replace with actual Zakeke loading logic or API generation
  // For now, we assume a direct link or a local route that handles the iframe
  const customizeUrl = `/customize/${templateId}`; 

  return (
    <Link href={customizeUrl} className="w-full">
      <Button 
        size="lg" 
        className="w-full h-14 gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/20 text-base font-black uppercase tracking-wider transform transition-all hover:scale-[1.02]"
      >
        <Cuboid className="w-5 h-5 animate-pulse" />
        Customize 3D
      </Button>
    </Link>
  );
}
