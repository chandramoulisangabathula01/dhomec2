"use client";

import { StickyMobileBar } from "./StickyMobileBar";
import { BookMeasurementModal } from "./BookMeasurementModal";
import { useState } from "react";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image_url?: string;
    type?: string;
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [showMeasurement, setShowMeasurement] = useState(false);
  const isConsultation = product.type === "CONSULTATION_ONLY";

  return (
    <>
      <StickyMobileBar
        product={product}
        onBookMeasurement={isConsultation ? () => setShowMeasurement(true) : undefined}
      />
      {isConsultation && (
        <BookMeasurementModal
          isOpen={showMeasurement}
          onClose={() => setShowMeasurement(false)}
          productName={product.name}
          productId={product.id}
        />
      )}
    </>
  );
}
