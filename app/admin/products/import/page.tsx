"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { 
  Loader2, 
  CloudUpload, 
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown
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
    slug: string;
};

const InputField = ({ 
    label, 
    placeholder, 
    type = "text", 
    min,
    required = false, 
    value, 
    onChange 
}: { 
    label: string, 
    placeholder?: string, 
    type?: string, 
    min?: string,
    required?: boolean, 
    value?: string | number, 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type}
            min={min}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold placeholder:font-medium placeholder:text-slate-300"
        />
    </div>
);

export default function ImportProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importStats, setImportStats] = useState<{ total: number, success: number, failed: number, errors: string[] } | null>(null);

  // Form State for Single Add
  const [formData, setFormData] = useState({
      name: "",
      category_id: "",
      sub_category: "",
      sku: "",
      price: "",
      min_quantity: "",
      quantity: "",
      tax: "",
      discount: "",
      brand: "",
      units: "",
      description: "",
      status: "closed",
      image_url: "",
      images: [] as string[]
  });

  useEffect(() => {
      const fetchCats = async () => {
           const { data } = await supabase.from('categories').select('id, name, slug');
           if (data) setCategories(data);
      };
      fetchCats();
  }, []);

  const handleDownloadSample = () => {
      const headers = [
          "Product Name", "Category", "Sub Category", "Brand", "Units", "SKU", 
          "Stock", "Minimum Qty", "Description", "Price", "Tax", "Discount", 
          "Status", "Cover Image URL", "Gallery Image URLs"
      ];
      const exampleRow = [
          "Example Product", "Traffic Control", "Boom Barrier", "KINGgates", "pcs", "SKU-12345", 
          "100", "5", "Premium Italian Barrier", "999.99", "18", "10", 
          "open", "https://example.com/cover.jpg", "https://img1.jpg, https://img2.jpg"
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + exampleRow.join(",");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "product_import_sample.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const processImport = async (results: Papa.ParseResult<any>) => {
      setLoading(true);
      setImportStats(null);
      let successCount = 0;
      let failedCount = 0;
      let errors: string[] = [];

      const rows = results.data;
      
      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // Skip empty rows
          if (!row["Product Name"] && !row["Price"]) continue;

          try {
                // Find category ID
                const catName = row["Category"];
                let categoryId = null;
                if (catName) {
                    const found = categories.find(c => c.name.toLowerCase() === catName.toLowerCase() || c.slug === catName.toLowerCase());
                    if (found) categoryId = found.id;
                }

                if (!categoryId) {
                    // Try to use a default or first category if crucial, but better to skip or error
                    // For now, let's use the first available category as fallback if not strict
                    if (categories.length > 0) categoryId = categories[0].id;
                }

                const productData = {
                    name: row["Product Name"],
                    slug: row["Product Name"]?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`,
                    category_id: categoryId,
                    sub_category: row["Sub Category"],
                    sku: row["SKU"] || `SKU-${Date.now()}`,
                    price: parseFloat(row["Price"] || "0"),
                    stock_quantity: parseInt(row["Stock"] || row["Quantity"] || "0"),
                    min_quantity: parseInt(row["Minimum Qty"] || row["Min Quantity"] || "0"),
                    brand: row["Brand"],
                    units: row["Units"],
                    tax: parseFloat(row["Tax"] || "0"),
                    discount: parseFloat(row["Discount"] || "0"),
                    description: row["Description"] || "",
                    image_url: formatGDriveUrl(row["Cover Image URL"] || row["Image URL"] || ""),
                    images: row["Gallery Image URLs"] ? row["Gallery Image URLs"].split(',').map((u: string) => formatGDriveUrl(u.trim())) : [],
                    status: row["Status"] || 'closed',
                    is_featured: false
                };

                const { error } = await supabase.from('products').insert([productData]);

                if (error) throw error;
                successCount++;

          } catch (err: any) {
              failedCount++;
              errors.push(`Row ${i + 2}: ${err.message}`);
          }
      }

      setLoading(false);
      setImportStats({
          total: successCount + failedCount,
          success: successCount,
          failed: failedCount,
          errors
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setUploading(true);
        const file = e.target.files[0];
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setUploading(false);
                processImport(results);
            },
            error: (error) => {
                setUploading(false);
                alert("CSV Parsing Error: " + error.message);
            }
        });
    }
  };

  const handleSingleSubmit = async () => {
      setLoading(true);
      try {
          // Build payload
          const payload = {
              name: formData.name,
              slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              category_id: formData.category_id || null,
              sub_category: formData.sub_category,
              sku: formData.sku,
              price: parseFloat(formData.price || "0"),
              stock_quantity: parseInt(formData.quantity || "0"),
              min_quantity: parseInt(formData.min_quantity || "0"),
              brand: formData.brand,
              units: formData.units,
              description: formData.description,
              status: formData.status,
              tax: parseFloat(formData.tax || "0"),
              discount: parseFloat(formData.discount || "0"),
              image_url: formatGDriveUrl(formData.image_url),
              images: formData.images.map(url => formatGDriveUrl(url))
          };

          const { error } = await supabase.from('products').insert([payload]);
          if (error) throw error;

          alert("Product added successfully!");
          router.push("/admin/products");

      } catch (err: any) {
          alert("Error: " + err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Import Products</h1>
        <p className="text-sm font-bold text-slate-400 mt-1">Bulk upload your products via CSV or add manually</p>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
          
          {/* Stats / Feedback */}
          {importStats && (
              <div className={`mb-8 p-4 rounded-xl border ${importStats.failed === 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                  <h3 className="font-bold text-slate-900 mb-2">Import Results</h3>
                  <div className="flex gap-4 text-sm">
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> {importStats.success} Success</span>
                      <span className="text-red-500 font-bold flex items-center gap-1"><XCircle className="w-4 h-4"/> {importStats.failed} Failed</span>
                  </div>
                  {importStats.errors.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 max-h-32 overflow-y-auto">
                          {importStats.errors.map((e, i) => <div key={i}>{e}</div>)}
                      </div>
                  )}
              </div>
          )}

          {/* Download Sample Button */}
          <button 
                onClick={handleDownloadSample}
                className="w-full bg-[#4C63FC] text-white py-4 rounded-xl shadow-lg shadow-blue-500/20 font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors mb-10 group"
          >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Download Sample File
          </button>

          {/* Upload Section */}
          <div className="mb-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Upload CSV File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-[#4C63FC] hover:bg-blue-50/10 transition-colors cursor-pointer relative group bg-slate-50/30">
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={loading || uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4C63FC] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            {uploading || loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <CloudUpload className="w-8 h-8" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-600">
                                {uploading ? "Parsing..." : loading ? "Importing..." : "Upload CSV File"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Drag & drop or Click to Browse</p>
                        </div>
                    </div>
                </div>
          </div>

          {/* Single Add Section Header */}
          <div className="mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add Single Product</h3>
                <p className="text-xs text-slate-400">Quickly add a product without CSV</p>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                <InputField label="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                
                {/* Category Dropdown */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <div className="relative">
                        <select 
                            value={formData.category_id}
                            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Choose Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Sub Category Dropdown */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sub Category</label>
                    <div className="relative">
                        <select 
                            value={formData.sub_category}
                            onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Choose Sub Category</option>
                            <option value="Boom Barriers">Boom Barriers</option>
                            <option value="Gate Motors">Gate Motors</option>
                            <option value="Turnstiles">Turnstiles</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <InputField label="Brand" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="Enter Brand Name" />
                
                {/* Units Dropdown */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Units</label>
                    <div className="relative">
                        <select 
                            value={formData.units}
                            onChange={(e) => setFormData({...formData, units: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Choose Unit</option>
                            <option value="pcs">Pieces</option>
                            <option value="set">Set</option>
                            <option value="mtr">Meter</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <InputField label="SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                <InputField label="Stock" type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                <InputField label="Minimum Qty" type="number" min="0" value={formData.min_quantity} onChange={(e) => setFormData({...formData, min_quantity: e.target.value})} />
                
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-medium resize-none"
                    />
                </div>

                <InputField label="Price" type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                <InputField label="Tax (%)" type="number" min="0" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} placeholder="e.g. 18" />
                <InputField label="% Discount" type="number" min="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="e.g. 10" />
                
                {/* Status Dropdown */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <div className="relative">
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="closed">Closed</option>
                            <option value="open">Open</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <InputField label="Cover Image URL" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/cover.jpg" />
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gallery Image URLs (Separated by comma)</label>
                        <textarea 
                            rows={2}
                            onChange={(e) => {
                                const urls = e.target.value.split(',').map(u => u.trim()).filter(u => u.length > 0);
                                setFormData(prev => ({ ...prev, images: urls }));
                            }}
                            placeholder="https://img1.jpg, https://img2.jpg"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC] transition-all outline-none text-slate-700 text-xs font-medium resize-none"
                        />
                    </div>
                </div>
          </div>

          {/* Footer Info & Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
               <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <span className="text-red-500">*</span> The field labels marked with * are required input fields.
               </p>

               <div className="flex items-center gap-3 w-full md:w-auto">
                   <Link href="/admin/products" className="w-full md:w-auto">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#FF6B6B] text-white rounded-xl shadow-lg shadow-red-500/20 text-sm font-bold hover:bg-red-500 transition-colors min-w-[120px]">
                            Cancel
                        </button>
                   </Link>
                   <button 
                      onClick={handleSingleSubmit}
                      disabled={loading}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#4C63FC] text-white rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold hover:bg-blue-700 transition-colors min-w-[180px]"
                   >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Submit New Product"}
                   </button>
               </div>
          </div>

      </div>
    </div>
  );
}
