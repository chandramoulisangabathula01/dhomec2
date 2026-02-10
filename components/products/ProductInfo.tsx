"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductInfoProps {
  product: any;
  className?: string;
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      image_url: product.image_url,
      slug: product.slug,
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className={className}>
<h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 break-words leading-tight">{product.name}</h1>
      <p className="text-lg text-primary font-medium mb-6">{product.model_name}</p>
      
      {/* Price */}
      {product.price && (
          <div className="mb-6 flex flex-col gap-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border inline-block min-w-[200px]">
                  <span className="text-sm text-muted-foreground block mb-1">Approx. Price:</span>
                  <span className="text-3xl font-bold text-foreground">₹ {product.price.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ Piece</span>
              </div>
              <Button onClick={handleAddToCart} disabled={isAdding} className="w-full md:w-auto gap-2">
                <ShoppingCart className="h-4 w-4" />
                {isAdding ? "Added!" : "Add to Cart"}
              </Button>
          </div>
      )}

      {/* Product Brochure */}
      {product.pdf_url && (
          <div className="mb-6">
               <a 
                  href={product.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
              >
                  <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <FileText className="h-4 w-4" /> Download Brochure
                  </Button>
              </a>
          </div>
      )}

      <div className="rounded-lg overflow-hidden border border-border mb-8">
          <table className="w-full text-sm table-fixed">
              <tbody className="divide-y divide-border">
                  {product.material && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Material</td>
                          <td className="py-3 px-4 text-foreground break-words">{product.material}</td>
                      </tr>
                  )}
                  {product.usage_application && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Usage/Application</td>
                          <td className="py-3 px-4 text-foreground break-words">{product.usage_application}</td>
                      </tr>
                  )}
                  {product.color && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Color</td>
                          <td className="py-3 px-4 text-foreground flex items-center gap-2 break-words">
                              <span 
                                  className="w-5 h-5 rounded-full border border-slate-200 shadow-sm shrink-0" 
                                  style={{ backgroundColor: product.color?.toLowerCase() || 'transparent' }} 
                              />
                              <span className="break-words">{product.color}</span>
                          </td>
                      </tr>
                  )}
                  {product.brand && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Brand</td>
                          <td className="py-3 px-4 text-foreground break-words">{product.brand}</td>
                      </tr>
                  )}
                  {product.automation_grade && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Automation Grade</td>
                          <td className="py-3 px-4 text-foreground break-words">{product.automation_grade}</td>
                      </tr>
                  )}
                  {product.frequency && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Frequency</td>
                          <td className="py-3 px-4 text-foreground break-words">
                              {product.frequency}
                          </td>
                      </tr>
                  )}
                  {product.voltage && (
                      <tr className="bg-muted/10">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 min-w-[120px] bg-muted/20 border-r border-border">Voltage</td>
                          <td className="py-3 px-4 text-foreground break-words">{product.voltage}</td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* Description */}
      {product.description && (
          <div className="mb-6">
              <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Product Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm border-l-2 border-primary/20 pl-4">{product.description}</p>
          </div>
      )}
    </div>
  );
}
