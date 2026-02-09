"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

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

  // Fetch Categories for Dropdown
  useEffect(() => {
    const fetchCats = async () => {
         // Skip for demo mode as we can assume mock data or handle gracefully
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        setUploading(true);
        if (!e.target.files || e.target.files.length === 0) {
            throw new Error('You must select an image to upload.');
        }

        const files = Array.from(e.target.files);
        const newImages: string[] = [];

        const isDemo = localStorage.getItem("dhomec_demo_auth") === "true";

        for (const file of files) {
             if (isDemo) {
                const demoUrl = "https://via.placeholder.com/400";
                newImages.push(demoUrl);
                continue;
             }

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

        setFormData(prev => ({ 
            ...prev, 
            image_url: prev.image_url || newImages[0], 
            images: [...prev.images, ...newImages]
        }));

    } catch (error: any) {
        alert(error.message);
    } finally {
        setUploading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugError, setDebugError] = useState<any>(null); // For raw error display
  const [isDemo, setIsDemo] = useState(false);

  // Check Demo Mode on Mount
  useEffect(() => {
     setIsDemo(localStorage.getItem("dhomec_demo_auth") === "true");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setDebugError(null);

    try {
        if (isDemo) {
            setError("Demo Mode: You cannot create real products. Please sign out and login with your admin credentials.");
            setLoading(false);
            return;
        }

        if (!formData.category_id) {
             setError("Please select a category");
             setLoading(false);
             return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
             throw new Error("Session Error: You are not logged in. Please refresh or sign in again.");
        }

        // Clean up data before sending
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

        const { error: insertError, data: insertedData } = await supabase
            .from('products')
            .insert([payload])
            .select();

        if (insertError) throw insertError;
        
        setSuccess(true);
        router.refresh(); // Refresh Next.js cache
        setTimeout(() => {
            router.push("/admin/products");
        }, 1500);

    } catch (error: any) {
        console.error("Error adding product:", error);
        setError(error.message || "Failed to add product");
        setDebugError(error); // Show full error object
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
            <p className="text-muted-foreground">Add a new item to your catalog.</p>
        </div>
      </div>

      {isDemo && (
          <div className="mb-6 p-4 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm border border-yellow-500/20 font-medium">
             🚧 You are currently in Demo Mode. Real data creation is disabled. <br/>
             <button onClick={() => { localStorage.removeItem("dhomec_demo_auth"); window.location.href = "/admin"; }} className="underline mt-1 font-bold">Click here to Sign Out</button>
          </div>
      )}

      {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
                <div className="flex items-center gap-2 font-bold"><span className="text-lg">⚠️</span> {error}</div>
                {debugError && (
                    <pre className="mt-2 p-2 bg-destructive/5 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugError, null, 2)}
                    </pre>
                )}
            </div>
      )}

      {success && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-lg text-sm border border-green-500/20 flex items-center gap-2 font-bold">
                <span>✅</span> Product created successfully! Redirecting...
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
                            onChange={handleNameChange}
                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Hydraulic Bollard H-200"
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
                        placeholder="Detailed product description..."
                    />
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="font-bold text-foreground mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
                          <input 
                              type="number" 
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. 25000"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Material</label>
                          <input 
                              type="text" 
                              value={formData.material}
                              onChange={(e) => setFormData({...formData, material: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. Stainless Steel"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Usage/Application</label>
                          <input 
                              type="text" 
                              value={formData.usage_application}
                              onChange={(e) => setFormData({...formData, usage_application: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. Industrial"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                          <input 
                              type="text" 
                              value={formData.color}
                              onChange={(e) => setFormData({...formData, color: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. Silver"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Brand</label>
                          <input 
                              type="text" 
                              value={formData.brand}
                              onChange={(e) => setFormData({...formData, brand: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. Dhomec"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Automation Grade</label>
                          <input 
                              type="text" 
                              value={formData.automation_grade}
                              onChange={(e) => setFormData({...formData, automation_grade: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. Automatic"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
                          <input 
                              type="text" 
                              value={formData.frequency}
                              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. 50 Hz"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Voltage</label>
                          <input 
                              type="text" 
                              value={formData.voltage}
                              onChange={(e) => setFormData({...formData, voltage: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. 220V"
                          />
                      </div>

                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-2">Model Name</label>
                          <input 
                              type="text" 
                              value={formData.model_name}
                              onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="e.g. DHM-H200"
                          />
                      </div>

                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-2">Product Brochure (PDF URL)</label>
                          <input 
                              type="url" 
                              value={formData.pdf_url}
                              onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
                              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="https://example.com/brochure.pdf"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Provide a direct link to the PDF file</p>
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

          {/* Sidebar Settings */}
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
                   
                   {/* Image Gallery */}
                   {formData.images.length > 0 && (
                       <div className="mb-4 grid grid-cols-2 gap-3">
                           {formData.images.map((img, idx) => (
                               <div key={idx} className="relative group">
                                   <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-border" />
                                   <button 
                                        type="button"
                                        onClick={() => {
                                            const newImages = formData.images.filter((_, i) => i !== idx);
                                            setFormData({
                                                ...formData, 
                                                images: newImages,
                                                image_url: newImages[0] || ""
                                            });
                                        }}
                                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                   >
                                       <Upload className="h-3 w-3 rotate-45" />
                                   </button>
                                   {idx === 0 && (
                                       <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">Main</span>
                                   )}
                               </div>
                           ))}
                       </div>
                   )}

                   {/* Upload Button */}
                   <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                       <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
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
                  disabled={loading || uploading} 
                  className="w-full text-base h-12"
               >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? "Saving Product..." : "Save Product"}
               </Button>
          </div>
      </div>
    </div>
  );
}
