import { getWishlist } from "@/app/actions/wishlist";
import { WishlistClient } from "./WishlistClient";

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 mt-2 font-medium">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved
        </p>
      </div>
      <WishlistClient items={wishlistItems} />
    </div>
  );
}
