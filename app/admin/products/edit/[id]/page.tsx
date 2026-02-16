"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    Loader2, 
    CloudUpload,
    ChevronDown, 
    Trash2,
    Box,
    Truck,
    Type
} from "lucide-react";
import Link from "next/link";

const formatGDriveUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) return url;
    const idMatch = url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
    }
    return url;
};

type Category = {
    id: string;
    name: string;
};

const PRICE_STATUS_OPTIONS = [
    { value: "", label: "Standard Price" },
    { value: "PRICE_ON_REQUEST", label: "Price on Request" },
    { value: "MADE_TO_ORDER", label: "Made to Order (5-12 days)" },
    { value: "GET_SPECIAL_QUOTE", label: "Get Special Quote" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    sub_category: "",
    brand: "",
    units: "",
    sku: "",
    stock_quantity: "",
    min_quantity: "",
    min_stock_threshold: "",
    description: "",
    price: "",
    tax: "",
    discount: "",
    status: "closed",
    image_url: "",
    images: [] as string[],
    pdf_url: "",
    is_featured: false,
    three_d_model_url: "",
    
    // PRD Fields (matching New Product form)
    type: "DIRECT_SALE",
    hsn_code: "",
    weight_kg: "",
    dimensions: { length: "", breadth: "", height: "" },
    zakeke_template_id: "",
    seo: { title: "", desc: "" },
    price_status: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
     setIsDemo(localStorage.getItem("dhomec_demo_auth") === "true");
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
         // Categories
         const { data: catData } = await supabase.from('categories').select('id, name');
         if (catData) setCategories(catData);

         // Product
         const isDemoLocal = localStorage.getItem("dhomec_demo_auth") === "true";
         if (isDemoLocal) {
             setFormData({
                 name: "Demo Product", slug: "demo-product", category_id: "1", sub_category: "Boom Barriers", brand: "Demo", units: "pcs", sku: "DEMO-123", stock_quantity: "100", min_quantity: "5", min_stock_threshold: "10", description: "Demo Desc", 
                 price: "50000", tax: "18", discount: "0", status: "open", image_url: "", images: [], pdf_url: "", is_featured: true, three_d_model_url: "",
                 type: "DIRECT_SALE", hsn_code: "84798999", weight_kg: "15", dimensions: { length: "100", breadth: "50", height: "30" }, zakeke_template_id: "", seo: { title: "", desc: "" }, price_status: ""
             });
             setLoading(false);
             return;
         }

         const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
         
         if (fetchError) {
             setError("Product not found");
         } else if (product) {
             const dims = product.dimensions || {};
             const seo = product.seo || {};
             setFormData({
                 name: product.name || "",
                 slug: product.slug || "",
                 category_id: product.category_id || "",
                 sub_category: product.sub_category || "",
                 brand: product.brand || "",
                 units: product.units || "",
                 sku: product.sku || "",
                 stock_quantity: product.stock_quantity ? String(product.stock_quantity) : "",
                 min_quantity: product.min_quantity ? String(product.min_quantity) : "",
                 min_stock_threshold: product.min_stock_threshold ? String(product.min_stock_threshold) : "",
                 description: product.description || "",
                 price: product.price ? String(product.price) : "",
                 tax: product.tax ? String(product.tax) : "",
                 discount: product.discount ? String(product.discount) : "",
                 status: product.status || "closed",
                 image_url: product.image_url || "",
                 images: product.images || (product.image_url ? [product.image_url] : []),
                 pdf_url: product.pdf_url || "",
                 is_featured: product.is_featured || false,
                 three_d_model_url: product.three_d_model_url || "",
                 type: product.type || "DIRECT_SALE",
                 hsn_code: product.hsn_code || "",
                 weight_kg: product.weight_kg ? String(product.weight_kg) : "",
                 dimensions: {
                     length: dims.length ? String(dims.length) : "",
                     breadth: dims.breadth ? String(dims.breadth) : "",
                     height: dims.height ? String(dims.height) : "",
                 },
                 zakeke_template_id: product.zakeke_template_id || "",
                 seo: {
                     title: seo.title || "",
                     desc: seo.desc || "",
                 },
                 price_status: product.price_status || "",
             });
         }
         setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    try {
        setUploading(true);
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const newImages: string[] = [];

        for (const file of files) {
             const fileExt = file.name.split('.').pop();
             const fileName = `${Math.random()}.${fileExt}`;
             const filePath = `${fileName}`;

             const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

             if (uploadError) throw uploadError;

             const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
             newImages.push(publicUrl);
        }

        if (isCover) {
            setFormData(prev => ({ 
                ...prev, 
                image_url: newImages[0]
            }));
        } else {
            setFormData(prev => ({ 
                ...prev, 
                images: [...prev.images, ...newImages]
            }));
        }

    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = formData.images.filter((_, idx) => idx !== indexToRemove);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
        if (isDemo) {
            setError("Demo Mode: Changes would be saved here.");
            setSubmitting(false); return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Please login.");

        if (!formData.name || !formData.category_id) {
            setError("Please fill in required fields (Name, Category)");
            setSubmitting(false);
            return;
        }

        const payload = {
            name: formData.name,
            slug: formData.slug,
            category_id: formData.category_id,
            sub_category: formData.sub_category || null,
            description: formData.description,
            image_url: formatGDriveUrl(formData.image_url),
            images: formData.images.map(url => formatGDriveUrl(url)),
            price: formData.price ? parseFloat(formData.price) : 0,
            stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
            min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : 0,
            min_stock_threshold: formData.min_stock_threshold ? parseInt(formData.min_stock_threshold) : 0,
            brand: formData.brand,
            units: formData.units,
            sku: formData.sku,
            tax: formData.tax ? parseFloat(formData.tax) : 0,
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            status: formData.status,
            is_featured: formData.is_featured,
            three_d_model_url: formData.three_d_model_url || null,
            
            // PRD Fields
            type: formData.type,
            hsn_code: formData.hsn_code,
            weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : 0,
            dimensions: {
                length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : 0,
                breadth: formData.dimensions.breadth ? parseFloat(formData.dimensions.breadth) : 0,
                height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : 0,
            },
            zakeke_template_id: formData.zakeke_template_id || null,
            seo: formData.seo,
            price_status: formData.price_status || null,
        };

        const { error: updateError } = await supabase
            .from('products')
            .update(payload)
            .eq('id', id);

        if (updateError) throw updateError;
        
        setSuccess(true);
        router.refresh();
        setTimeout(() => router.push("/admin/products"), 1500);

    } catch (error: any) {
        console.error("Error updating product:", error);
        setError(error.message);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/admin/products">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h1>
                <p className="text-sm font-bold text-slate-400 mt-1">Update product details</p>
            </div>
        </div>
      </div>

      {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20 font-bold flex items-center gap-2">
                <span>⚠️</span> {error}
            </div>
      )}

      {success && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-lg text-sm border border-green-500/20 flex items-center gap-2 font-bold">
                <span>✅</span> Product updated successfully! Redirecting...
            </div>
      )}

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left Column: Cover Image & Type */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                
                {/* Product Type Selection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Type</label>
                    <div className="flex flex-col gap-2">
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, type: "DIRECT_SALE"})}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.type === "DIRECT_SALE" ? "bg-white border-[#4C63FC] shadow-md text-[#4C63FC]" : "bg-transparent border-transparent hover:bg-white text-slate-500"}`}
                        >
                            <Box className="w-5 h-5" />
                            <div className="text-left">
                                <p className="text-xs font-bold">Direct Sale</p>
                                <p className="text-[10px] opacity-70">Standard e-commerce item</p>
                            </div>
                        </button>
                        <button 
                            type="button"
                             onClick={() => setFormData({...formData, type: "CONSULTATION_ONLY"})}
                             className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.type === "CONSULTATION_ONLY" ? "bg-white border-[#4C63FC] shadow-md text-[#4C63FC]" : "bg-transparent border-transparent hover:bg-white text-slate-500"}`}
                        >
                            <Type className="w-5 h-5" />
                            <div className="text-left">
                                <p className="text-xs font-bold">Consultation</p>
                                <p className="text-[10px] opacity-70">Requires measurement/quote</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Price Status */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Price Status</label>
                    <div className="relative">
                        <select 
                            value={formData.price_status}
                            onChange={(e) => setFormData({...formData, price_status: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-500 text-sm font-bold appearance-none cursor-pointer"
                        >
                            {PRICE_STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cover Image</label>
                    
                    {/* Upload Box */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#4C63FC] hover:bg-blue-50/10 transition-colors cursor-pointer relative group mb-6">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#4C63FC] flex items-center justify-center group-hover:scale-110 transition-transform">
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600">Drag and drop file here</p>
                            </div>
                        </div>
                    </div>

                    {/* Preview Box */}
                    <div className="w-full aspect-[4/5] bg-slate-200 rounded-2xl overflow-hidden relative group border border-slate-100 mb-4">
                        {formData.image_url ? (
                            <>
                                <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, image_url: ""})}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <div className="w-12 h-12 rounded-xl bg-slate-300/50 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 opacity-20" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Or Image URL */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Or Paste Image URL</label>
                        <input 
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-xs font-bold placeholder:font-medium placeholder:text-slate-300"
                        />
                    </div>
                </div>

            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-8 xl:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Product Name */}
                    <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                            <input 
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
                    </div>

                    {/* Category */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                            <div className="relative">
                                <select 
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-500 text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Choose Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                    </div>

                    {/* Sub Category (Optional - text input) */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sub Category <span className="text-slate-300">(Optional)</span></label>
                            <input 
                                value={formData.sub_category}
                                onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                                placeholder="Enter sub category"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
                    </div>

                    {/* Brand */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                            <input 
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                placeholder="Enter Brand Name"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
                    </div>

                    {/* Price & Inventory Section */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="col-span-2 md:col-span-4 mb-2">
                            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                                <Box className="w-4 h-4 text-[#4C63FC]" /> Pricing & Inventory
                            </h3>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (₹)</label>
                            <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tax (%)</label>
                            <input type="number" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discount (%)</label>
                            <input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                            <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU</label>
                            <input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Order Qty</label>
                            <input type="number" value={formData.min_quantity} onChange={(e) => setFormData({...formData, min_quantity: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Stock Threshold</label>
                            <input type="number" value={formData.min_stock_threshold} onChange={(e) => setFormData({...formData, min_stock_threshold: e.target.value})} placeholder="Alert when below" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold placeholder:text-slate-300 placeholder:font-medium" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Units</label>
                            <div className="relative">
                                <select 
                                    value={formData.units}
                                    onChange={(e) => setFormData({...formData, units: e.target.value})}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Unit</option>
                                    <option value="pcs">Pieces</option>
                                    <option value="set">Set</option>
                                    <option value="kg">Kg</option>
                                    <option value="mtr">Meter</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                         </div>
                    </div>

                    {/* Logistics Section */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="col-span-2 md:col-span-4 mb-2">
                            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#4C63FC]" /> Logistics & Dimensions
                            </h3>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weight (Kg)</label>
                            <input type="number" value={formData.weight_kg} onChange={(e) => setFormData({...formData, weight_kg: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Length (cm)</label>
                            <input type="number" value={formData.dimensions.length} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, length: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Breadth (cm)</label>
                            <input type="number" value={formData.dimensions.breadth} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, breadth: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Height (cm)</label>
                            <input type="number" value={formData.dimensions.height} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, height: e.target.value}})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HSN Code</label>
                            <input value={formData.hsn_code} onChange={(e) => setFormData({...formData, hsn_code: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" placeholder="Required for Invoice" />
                         </div>
                    </div>

                    {/* SEO & Integrations */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Zakeke Template ID</label>
                             <input value={formData.zakeke_template_id} onChange={(e) => setFormData({...formData, zakeke_template_id: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold" placeholder="For 3D Customizer" />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SEO Title</label>
                             <input value={formData.seo.title} onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                            <div className="relative">
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-500 text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="closed">Closed</option>
                                    <option value="open">Open</option>
                                    <option value="active">Active</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Product</label>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.is_featured ? 'bg-[#4C63FC]' : 'bg-slate-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${formData.is_featured ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea 
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-medium resize-none"
                            />
                    </div>

                    {/* Multi Image Upload */}
                    <div className="md:col-span-2 mt-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Upload Product Images</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#4C63FC] hover:bg-blue-50/10 transition-colors cursor-pointer relative group">
                            <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, false)}
                                disabled={uploading}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#4C63FC] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CloudUpload className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-600">Drag & drop files here</p>
                                </div>
                            </div>
                        </div>

                        {/* Gallery URLs */}
                        <div className="mt-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Add Image URLs (Separated by comma)</label>
                            <textarea 
                                rows={2}
                                onChange={(e) => {
                                    const urls = e.target.value.split(',').map(u => u.trim()).filter(u => u.length > 0);
                                    if (urls.length > 0) {
                                        setFormData(prev => ({ ...prev, images: [...new Set([...prev.images, ...urls])] }));
                                    }
                                }}
                                placeholder="https://img1.jpg, https://img2.jpg"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-xs font-medium resize-none"
                            />
                        </div>

                        {formData.images.length > 0 && (
                            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 relative group flex-shrink-0">
                                            <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                                            <button 
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                            >
                                            <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 mt-12 pt-8">
                   <Link href="/admin/products">
                        <button type="button" className="flex items-center justify-center gap-2 px-8 py-3 bg-[#FF6B6B] text-white rounded-xl shadow-lg shadow-red-500/20 text-sm font-bold hover:bg-red-500 transition-colors w-32">
                            Cancel
                        </button>
                   </Link>
                   <Button 
                      onClick={handleSubmit} 
                      disabled={submitting || uploading} 
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-[#4C63FC] text-white rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[160px] h-auto"
                   >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                   </Button>
                </div>

            </div>

          </div>
      </div>
    </div>
  );
}
