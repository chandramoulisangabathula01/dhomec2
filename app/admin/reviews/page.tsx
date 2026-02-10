import { createClient } from "@/utils/supabase/server";
import { Star, MessageSquare, User, Package, Trash2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
        *,
        product:products(name, image_url),
        profile:profiles(full_name, username)
    `)
    .order("created_at", { ascending: false });

  if (error) {
      console.error(error);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Feedbacks</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor product reviews across the platform</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <Star className="w-3 h-3 fill-current" />
            Live Reputation Stream
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews && reviews.length > 0 ? reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/30 transition-all group border-l-4 border-l-blue-500">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Info */}
                <div className="lg:w-1/4 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        {review.product?.image_url ? (
                            <img src={review.product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 underline decoration-slate-200">Product</label>
                        <p className="text-sm font-bold text-slate-900 truncate">{review.product?.name || 'Deleted Product'}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-blue-500 text-blue-500' : 'text-slate-200 fill-slate-100'}`} 
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                            <Clock className="w-3 h-3" />
                            {new Date(review.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                        "{review.comment}"
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {review.profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{review.profile?.full_name || `@${review.profile?.username}`}</span>
                        <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md font-bold uppercase tracking-tighter">Verified Buyer</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex lg:flex-col justify-end gap-2">
                    <Button variant="ghost" className="rounded-xl h-11 text-xs font-bold text-slate-500 hover:text-green-600 hover:bg-green-50 justify-start gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                    </Button>
                    <Button variant="ghost" className="rounded-xl h-11 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 justify-start gap-2">
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </Button>
                </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No testimonials yet</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm font-medium">As soon as customers start reviewing your products, they will appear here in chronological order.</p>
          </div>
        )}
      </div>
    </div>
  );
}
