"use client";

import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-xl z-[51] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Shopping Cart ({items.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-20">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg">Your cart is empty</p>
                  <Button
                    variant="link"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 text-primary"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-muted/30 rounded-lg border"
                  >
                    {/* Image Placeholder if no image */}
                     <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-1">
                          ₹ {item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 bg-background">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold">
                    ₹ {totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full py-6 text-lg">Checkout Now</Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
