"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft,
    Loader2, 
    Upload, 
    CloudUpload,
    ChevronDown, 
    Trash2,
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
    zakeke_template_id: ""
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
             // Mock
             setFormData({
                 name: "Demo Product", slug: "demo-product", category_id: "1", sub_category: "Boom Barriers", brand: "Demo", units: "pcs", sku: "DEMO-123", stock_quantity: "100", min_quantity: "5", description: "Demo Desc", 
                 price: "50000", tax: "18", discount: "0", status: "open", image_url: "", images: [], pdf_url: "", is_featured: true, three_d_model_url: "", zakeke_template_id: ""
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
                 zakeke_template_id: product.zakeke_template_id || ""
             });
         }
         setLoading(false);
    };
    fetchData();
  }, [id]);

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

        const payload = {
            name: formData.name,
            slug: formData.slug,
            category_id: formData.category_id,
            sub_category: formData.sub_category,
            description: formData.description,
            image_url: formatGDriveUrl(formData.image_url),
            images: formData.images.map(url => formatGDriveUrl(url)),
            price: formData.price ? parseFloat(formData.price) : 0,
            stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
            min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : 0,
            brand: formData.brand,
            units: formData.units,
            sku: formData.sku,
            tax: formData.tax ? parseFloat(formData.tax) : 0,
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            status: formData.status,
            is_featured: formData.is_featured,
            three_d_model_url: formData.three_d_model_url || null,
            zakeke_template_id: formData.zakeke_template_id || null
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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground">Update product details.</p>
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
            
            {/* Left Column: Cover Image */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                
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
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})}
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

                    {/* Sub Category */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sub Category</label>
                            <div className="relative">
                                <select 
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-500 text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Choose Sub Category</option>
                                    <option value="Boom Barriers">Boom Barriers</option>
                                    <option value="Gate Motors">Gate Motors</option>
                                    <option value="Turnstiles">Turnstiles</option>
                                    <option value="test">Test Sub Cat</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
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

                    {/* Units */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Units</label>
                            <div className="relative">
                                <select 
                                    value={formData.units}
                                    onChange={(e) => setFormData({...formData, units: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-500 text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Choose Unit</option>
                                    <option value="pcs">Pieces</option>
                                    <option value="set">Set</option>
                                    <option value="kg">Kg</option>
                                    <option value="mtr">Meter</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                    </div>

                    {/* SKU */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU</label>
                            <input 
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold"
                            />
                    </div>

                    {/* Stock */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                            <input 
                                type="number"
                                min="0"
                                value={formData.stock_quantity}
                                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold"
                            />
                    </div>

                    {/* Min Qty */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Minimum Qty</label>
                            <input 
                                type="number"
                                min="0"
                                value={formData.min_quantity}
                                onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold"
                            />
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

                    {/* Price */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price</label>
                            <input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold"
                            />
                    </div>

                    {/* Tax */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tax (%)</label>
                            <input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.tax}
                                onChange={(e) => setFormData({...formData, tax: e.target.value})}
                                placeholder="e.g. 18"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
                    </div>

                    {/* Discount */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">% Discount</label>
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: e.target.value})}
                                placeholder="e.g. 10"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
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
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                    </div>

                    {/* Zakeke & SEO */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Zakeke Template ID</label>
                             <input value={formData.zakeke_template_id} onChange={(e) => setFormData({...formData, zakeke_template_id: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold" placeholder="For 3D Customizer" />
                        </div>
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
