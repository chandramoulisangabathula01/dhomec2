"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  CloudUpload, 
  ChevronDown, 
  Trash2,
  Box,
  Truck,
  Search,
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

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    sub_category: "", // Could be used or ignored
    brand: "",
    units: "",
    sku: "",
    stock_quantity: "",
    min_quantity: "",
    description: "",
    price: "",
    tax: "",
    discount: "",
    status: "active", // Default to active
    image_url: "",
    images: [] as string[],
    is_featured: false,
    three_d_model_url: "",
    
    // New PRD Fields
    type: "DIRECT_SALE", // DIRECT_SALE | CONSULTATION_ONLY
    hsn_code: "",
    weight_kg: "",
    dimensions: { length: "", breadth: "", height: "" },
    zakeke_template_id: "",
    seo: { title: "", desc: "" }
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
         const { data } = await supabase.from('categories').select('id, name');
         if (data) setCategories(data);
    };
    fetchCats();
  }, []);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
        if (!formData.name || !formData.category_id) {
             alert("Please fill in required fields (Name, Category)");
             setLoading(false);
             return;
        }

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
            min_stock_threshold: formData.min_quantity ? parseInt(formData.min_quantity) : 0,
            brand: formData.brand,
            units: formData.units,
            sku: formData.sku,
            tax: formData.tax ? parseFloat(formData.tax) : 0,
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            status: formData.status,
            is_featured: formData.is_featured,
            
            // New Fields
            type: formData.type,
            hsn_code: formData.hsn_code,
            weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : 0,
            dimensions: {
                length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : 0,
                breadth: formData.dimensions.breadth ? parseFloat(formData.dimensions.breadth) : 0,
                height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : 0,
            },
            zakeke_template_id: formData.zakeke_template_id,
            seo: formData.seo
        };

        const { error } = await supabase.from('products').insert([payload]);

        if (error) throw error;
        
        router.push("/admin/products");

    } catch (error: any) {
        console.error("Error adding product:", error);
        alert("Failed to add product: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add a New Product</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">Manage your product</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left Column: Cover Image & Type */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                
                {/* Product Type Selection */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Type</label>
                    <div className="flex flex-col gap-2">
                        <button 
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

                    {/* Brand */}
                    <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                            <input 
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                placeholder="Enter Brand Name"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold"
                            />
                    </div>

                    {/* Price & Tax Section - Only show if not Consultation Only? Or maybe show but optional */}
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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                            <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU</label>
                            <input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                         </div>
                    </div>

                    {/* Logistics Section (New) */}
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

                        {formData.images.length > 0 && (
                            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 relative group flex-shrink-0">
                                            <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                                            <button 
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
                        <button className="flex items-center justify-center gap-2 px-8 py-3 bg-[#FF6B6B] text-white rounded-xl shadow-lg shadow-red-500/20 text-sm font-bold hover:bg-red-500 transition-colors w-32">
                            Cancel
                        </button>
                   </Link>
                   <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-[#4C63FC] text-white rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[160px]"
                   >
                       {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                       Add New Product
                   </button>
                </div>

            </div>

          </div>

      </div>
    </div>
  );
}
