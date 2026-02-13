"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, ShoppingCart, Heart, Share2, MessageCircle, Ruler, Phone, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useTransition } from "react";
import { addToWishlist, removeFromWishlist } from "@/app/actions/wishlist";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/types";
import { ZakekeCustomizeButton } from "./ZakekeCustomizeButton";
import { PincodeCheck } from "./PincodeCheck";
import { BookMeasurementModal } from "./BookMeasurementModal";

interface ProductInfoProps {
  product: Product;
  className?: string;
  isWishlisted?: boolean;
}

export function ProductInfo({ product, className, isWishlisted: initialWishlisted = false }: ProductInfoProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const { addToast } = useToast();

  const isConsultation = product.type === 'CONSULTATION_ONLY';

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      image_url: product.image_url || "",
      slug: product.slug,
    });
    addToast(`Added ${product.name} to cart`, "success");
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = () => {
    startTransition(async () => {
      try {
        if (wishlisted) {
          await removeFromWishlist(product.id);
          setWishlisted(false);
          addToast("Removed from wishlist", "info");
        } else {
          await addToWishlist(product.id);
          setWishlisted(true);
          addToast("Added to wishlist", "success");
        }
      } catch (err) {
        console.error(err);
        addToast("Please login to use wishlist", "error");
      }
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} from Dhomec Solutions`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard", "success");
    }
  };

  return (
    <div className={className}>
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 break-words leading-tight">{product.name}</h1>
      <p className="text-lg text-primary font-medium mb-6">{product.model_name}</p>
      
      {/* Zakeke Customization Button */}
      {product.zakeke_template_id && (
          <div className="mb-6 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
              <div className="bg-white rounded-[14px] p-6 text-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                       Personalization Available
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                      Design your own version of {product.name} with our 3D configurator.
                  </p>
                  <ZakekeCustomizeButton templateId={product.zakeke_template_id} productName={product.name} />
              </div>
          </div>
      )}

      {/* Pricing & CTA Section */}
      <div className="mb-8">
        {isConsultation ? (
          <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
               <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Ruler className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Price Calculated After Site Visit</h3>
                  <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">
                    This product is custom-fitted. Our experts will visit your site for precise dimensions before providing a final quote.
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <Button 
                  size="lg" 
                  onClick={() => setShowMeasurementModal(true)}
                  className="flex-1 min-w-[200px] gap-2 h-14 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 text-base font-black"
               >
                  <Ruler className="w-5 h-5" />
                  Book Measurement Visit
               </Button>
               
               <Link 
                  href={`/enquiry?product=${encodeURIComponent(product.name)}&type=callback`} 
                  className="flex-1 min-w-[160px]"
               >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-14 gap-2 font-bold rounded-xl border-slate-200 text-slate-600"
                  >
                    <Phone className="w-5 h-5" />
                    Request Callback
                  </Button>
               </Link>
            </div>

            <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 size="lg"
                 onClick={handleWishlist} 
                 disabled={isPending}
                 className={`h-14 px-6 border-slate-200 rounded-xl ${wishlisted ? "text-rose-600 border-rose-200 bg-rose-50" : ""}`}
               >
                 <Heart className={`h-5 w-5 ${wishlisted ? "fill-rose-600" : ""}`} />
               </Button>
               <Button variant="outline" size="lg" onClick={handleShare} className="h-14 px-6 border-slate-200 rounded-xl">
                 <Share2 className="h-5 w-5" />
               </Button>
            </div>

            {/* Book Measurement Modal */}
            <BookMeasurementModal
              isOpen={showMeasurementModal}
              onClose={() => setShowMeasurementModal(false)}
              productName={product.name}
              productId={product.id}
            />
          </div>
        ) : (
          <div className="space-y-6">
             {product.price > 0 ? (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 inline-flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 font-bold text-xs">/ unit</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Inclusive of all taxes (GST)</span>
                </div>
             ) : (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 inline-flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price Status</span>
                   <span className="text-xl font-bold text-slate-600 italic">Price on Request</span>
                </div>
             )}

             {/* Stock Status */}
             {product.stock_quantity !== undefined && (
               <div className="flex items-center gap-2">
                 <Package className="w-4 h-4 text-slate-400" />
                 {product.stock_quantity > 0 ? (
                   <span className="text-sm font-bold text-emerald-600">
                     In Stock {product.stock_quantity <= 5 && `(Only ${product.stock_quantity} left)`}
                   </span>
                 ) : product.allow_backorder ? (
                   <span className="text-sm font-bold text-amber-600">
                     Made to Order ({product.base_lead_time_days || 5}-{(product.base_lead_time_days || 5) + (product.manufacturing_buffer_days || 7)} days)
                   </span>
                 ) : (
                   <span className="text-sm font-bold text-red-500">Out of Stock</span>
                 )}
               </div>
             )}

             <div className="flex flex-wrap gap-4">
                {product.price > 0 && (
                  <Button 
                    size="lg" 
                    onClick={handleAddToCart} 
                    disabled={isAdding} 
                    className="flex-1 md:flex-none h-14 px-8 gap-3 bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 text-base font-bold rounded-xl"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isAdding ? "Item Added" : "Add to Cart"}
                  </Button>
                )}
                
                <Link 
                   href={`/enquiry?product=${encodeURIComponent(product.name)}`}
                   className={product.price > 0 ? "flex-1 md:flex-none" : "w-full"}
                >
                  <Button 
                    variant={product.price > 0 ? "outline" : "default"} 
                    size="lg" 
                    className={`h-14 px-8 gap-3 font-bold rounded-xl w-full ${product.price > 0 ? 'border-slate-200 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Get Special Quote
                  </Button>
                </Link>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleWishlist} 
                    disabled={isPending}
                    className={`h-14 px-6 border-slate-200 rounded-xl ${wishlisted ? "text-rose-600 border-rose-200 bg-rose-50" : ""}`}
                  >
                    <Heart className={`h-5 w-5 ${wishlisted ? "fill-rose-600" : ""}`} />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare} className="h-14 px-6 border-slate-200 rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
             </div>

             {/* Pincode Serviceability Check */}
             <PincodeCheck weight={product.weight_kg || 1} />
          </div>
        )}
      </div>

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
