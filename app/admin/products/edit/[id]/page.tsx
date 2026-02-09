"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

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
    description: "",
    image_url: "",
    images: [] as string[],
    pdf_url: "",
    price: "",
    material: "",
    usage_application: "",
    color: "",
    brand: "",
    automation_grade: "",
    frequency: "",
    voltage: "",
    model_name: "",
    is_featured: false,
    three_d_model_url: ""
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
                 name: "Demo Product", slug: "demo-product", category_id: "1", description: "Demo Desc", image_url: "", images: [],
                 pdf_url: "", price: "50000", material: "Steel", usage_application: "Mall", color: "Silver", brand: "Demo", automation_grade: "Automatic", frequency: "50Hz", voltage: "220V", model_name: "D-100", is_featured: true,
                 three_d_model_url: ""
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
                 description: product.description || "",
                 image_url: product.image_url || "",
                 images: product.images || (product.image_url ? [product.image_url] : []),
                 pdf_url: product.pdf_url || "",
                 price: product.price ? String(product.price) : "",
                 material: product.material || "",
                 usage_application: product.usage_application || "",
                 color: product.color || "",
                 brand: product.brand || "",
                 automation_grade: product.automation_grade || "",
                 frequency: product.frequency || "",
                 voltage: product.voltage || "",
                 model_name: product.model_name || "",
                 is_featured: product.is_featured || false,
                 three_d_model_url: product.three_d_model_url || ""
             });
         }
         setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        setUploading(true);
        if (!e.target.files || e.target.files.length === 0) throw new Error('Select an image.');

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        if (isDemo) {
             const demoUrl = "https://via.placeholder.com/400";
             setFormData({ ...formData, image_url: formData.image_url || demoUrl, images: [...formData.images, demoUrl] });
             setUploading(false); return;
        }

        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        setFormData({ ...formData, image_url: formData.image_url || publicUrl, images: [...formData.images, publicUrl] });
    } catch (error: any) {
        alert(error.message);
    } finally {
        setUploading(false);
    }
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
            description: formData.description || null,
            image_url: formData.image_url || null,
            images: formData.images.length > 0 ? formData.images : null,
            pdf_url: formData.pdf_url || null,
            price: formData.price ? parseFloat(formData.price) : null,
            material: formData.material || null,
            usage_application: formData.usage_application || null,
            color: formData.color || null,
            brand: formData.brand || null,
            automation_grade: formData.automation_grade || null,
            frequency: formData.frequency || null,
            voltage: formData.voltage || null,
            model_name: formData.model_name || null,
            is_featured: formData.is_featured,
            three_d_model_url: formData.three_d_model_url || null
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                </div>

                <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                        <input 
                            required
                            type="text" 
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            className="w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground font-mono text-sm"
                        />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea 
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
              </div>

              {/* Specifications - Same styling as New Page */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="font-bold text-foreground mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Reuse Inputs with theme styles */}
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
                          <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Material</label>
                          <input type="text" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Usage</label>
                          <input type="text" value={formData.usage_application} onChange={(e) => setFormData({...formData, usage_application: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                          <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Brand</label>
                          <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Automation Grade</label>
                          <input type="text" value={formData.automation_grade} onChange={(e) => setFormData({...formData, automation_grade: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
                          <input type="text" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Voltage</label>
                          <input type="text" value={formData.voltage} onChange={(e) => setFormData({...formData, voltage: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-2">Model Name</label>
                          <input type="text" value={formData.model_name} onChange={(e) => setFormData({...formData, model_name: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-2">PDF URL</label>
                          <input type="url" value={formData.pdf_url} onChange={(e) => setFormData({...formData, pdf_url: e.target.value})} 
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>

                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-2">3D Model URL</label>
                          <input 
                              type="url" 
                              value={formData.three_d_model_url}
                              onChange={(e) => setFormData({...formData, three_d_model_url: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="https://my.spline.design/..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">Embed URL from Spline, Sketchfab, etc.</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
               <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                   <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                        <select 
                            required
                            value={formData.category_id}
                            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-foreground mb-2">Featured Status</label>
                       <div className="flex items-center gap-2">
                           <input 
                               type="checkbox" 
                               checked={formData.is_featured}
                               onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                               className="h-4 w-4 text-primary rounded border-input focus:ring-primary"
                           />
                           <span className="text-sm text-foreground">Mark as Featured Product</span>
                       </div>
                   </div>
               </div>

               <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                   <label className="block text-sm font-medium text-foreground mb-4">Product Images</label>
                   
                   {formData.images.length > 0 && (
                       <div className="mb-4 grid grid-cols-2 gap-3">
                           {formData.images.map((img, idx) => (
                               <div key={idx} className="relative group">
                                   <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-border" />
                                   <button 
                                        type="button"
                                        onClick={() => {
                                            const newImages = formData.images.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, images: newImages, image_url: newImages[0] || "" });
                                        }}
                                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                       <Upload className="h-3 w-3 rotate-45" />
                                   </button>
                                   {idx === 0 && <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">Main</span>}
                               </div>
                           ))}
                       </div>
                   )}

                   <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                       <input 
                          type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                       <div className="flex flex-col items-center gap-2 text-muted-foreground">
                           {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8" />}
                           <span className="text-xs font-medium">
                               {formData.images.length > 0 ? 'Add more images' : 'Click to upload images'}
                           </span>
                       </div>
                   </div>
               </div>

               <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || uploading} 
                  className="w-full text-base h-12"
               >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
               </Button>
          </div>
      </div>
    </div>
  );
}
