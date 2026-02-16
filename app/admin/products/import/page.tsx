"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { 
  Loader2, 
  CloudUpload, 
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  Download,
  Upload
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

type ProductRow = {
    id: string; // Temporary ID for React key
    name: string;
    category_id: string;
    sub_category: string;
    price: string;
    stock_quantity: string;
    min_quantity: string;
    sku: string;
    hsn_code: string;
    tax: string;
    discount: string;
    image_url: string; // Cover
    status: string;
    description: string;
    brand: string;
    units: string;
    weight_kg: string;
    dimensions: string; // L x B x H format
    error?: string;
};

export default function BulkImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      const fetchCats = async () => {
           const { data } = await supabase.from('categories').select('id, name, slug');
           if (data) setCategories(data);
      };
      fetchCats();
      
      // Add one empty row by default
      if (rows.length === 0) addRow();
  }, []);

  const addRow = () => {
      setRows(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: "",
          category_id: "",
          sub_category: "",
          price: "",
          stock_quantity: "0",
          min_quantity: "0",
          sku: "",
          hsn_code: "",
          tax: "0",
          discount: "0",
          image_url: "",
          status: "closed",
          description: "",
          brand: "",
          units: "pcs",
          weight_kg: "0",
          dimensions: "0x0x0"
      }]);
  };

  const removeRow = (id: string) => {
      setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof ProductRow, value: string) => {
      setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const newRows: ProductRow[] = results.data.map((row: any) => {
                    // Try to match category
                    const catName = row["Category"];
                    let catId = "";
                    if (catName && categories.length > 0) {
                        const found = categories.find(c => c.name.toLowerCase() === catName.toLowerCase() || c.slug === catName.toLowerCase());
                        if (found) catId = found.id;
                    }

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        name: row["Product Name"] || "",
                        category_id: catId,
                        sub_category: row["Sub Category"] || "",
                        price: row["Price"] || "",
                        stock_quantity: row["Stock"] || row["Quantity"] || "0",
                        min_quantity: row["Minimum Qty"] || "0",
                        sku: row["SKU"] || "",
                        hsn_code: row["HSN Code"] || "",
                        tax: row["Tax"] || "0",
                        discount: row["Discount"] || "0",
                        image_url: row["Cover Image URL"] || row["Image URL"] || "",
                        status: row["Status"]?.toLowerCase() || "closed",
                        description: row["Description"] || "",
                        brand: row["Brand"] || "",
                        units: row["Units"] || "pcs",
                        weight_kg: row["Weight (Kg)"] || "0",
                        dimensions: `${row["Length (cm)"] || 0}x${row["Breadth (cm)"] || 0}x${row["Height (cm)"] || 0}`
                    };
                });
                setRows(prev => [...prev, ...newRows]);
            },
            error: (error) => {
                alert("CSV Parsing Error: " + error.message);
            }
        });
    }
  };

  const handleDownloadSample = () => {
    const headers = [
        "Product Name", "Category", "Sub Category", "Brand", "Units", "SKU", 
        "Stock", "Minimum Qty", "Description", "Price", "Tax", "Discount", 
        "Status", "Cover Image URL", "HSN Code", "Weight (Kg)", "Length (cm)", "Breadth (cm)", "Height (cm)"
    ];
    const exampleRow = [
        "Example Product", "Traffic Control", "Boom Barrier", "Nice", "pcs", "SKU-123", 
        "100", "5", "Description here", "50000", "18", "0", 
        "open", "https://example.com/image.jpg", "8479", "10", "100", "50", "30"
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + exampleRow.join(",");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dhomec_bulk_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  const saveAll = async () => {
      setSaving(true);
      const validRows = rows.filter(r => r.name.trim() !== "");
      
      if (validRows.length === 0) {
          alert("No data to import.");
          setSaving(false);
          return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const row of validRows) {
          try {
              if (!row.category_id) throw new Error("Category Required");

              // Parse dimensions
              const [l, b, h] = row.dimensions.split('x').map(d => parseFloat(d) || 0);

              const payload = {
                  name: row.name,
                  slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`,
                  category_id: row.category_id,
                  sub_category: row.sub_category,
                  sku: row.sku || `SKU-${Date.now()}`,
                  price: parseFloat(row.price || "0"),
                  stock_quantity: parseInt(row.stock_quantity || "0"),
                  min_quantity: parseInt(row.min_quantity || "0"),
                  brand: row.brand,
                  units: row.units,
                  description: row.description,
                  status: row.status,
                  tax: parseFloat(row.tax || "0"),
                  discount: parseFloat(row.discount || "0"),
                  image_url: formatGDriveUrl(row.image_url),
                  hsn_code: row.hsn_code,
                  weight_kg: parseFloat(row.weight_kg || "0"),
                  dimensions: { length: l, breadth: b, height: h },
                  type: "DIRECT_SALE"
              };

              const { error } = await supabase.from('products').insert([payload]);
              if (error) throw error;
              
              successCount++;
              // Remove successful row
              removeRow(row.id);

          } catch (err: any) {
              failCount++;
              updateRow(row.id, "error", err.message);
          }
      }

      setSaving(false);
      if (failCount === 0) {
          alert(`Successfully imported ${successCount} products!`);
          router.push("/admin/products");
      } else {
          alert(`Imported ${successCount} products. ${failCount} failed. Please check errors in the table.`);
      }
  };

  return (
    <div className="max-w-[1920px] mx-auto pb-20 animate-in fade-in duration-500 px-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Product Import</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">Add multiple products via spreadsheet-like interface</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" onClick={handleDownloadSample} className="gap-2 rounded-xl">
                 <Download className="w-4 h-4" /> Download Sample
             </Button>
             <div className="relative">
                 <input 
                     type="file" 
                     accept=".csv"
                     onChange={handleFileUpload}
                     className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                 />
                 <Button variant="outline" className="gap-2 rounded-xl">
                     <Upload className="w-4 h-4" /> Import CSV
                 </Button>
             </div>
             <Button onClick={saveAll} disabled={saving} className="gap-2 rounded-xl bg-[#4C63FC] hover:bg-blue-700">
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 Save All Products
             </Button>
        </div>
      </div>

      <div className="bg-white border boundary-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                          <th className="p-3 font-bold text-slate-500 w-10">#</th>
                          <th className="p-3 font-bold text-slate-500 min-w-[200px]">Product Name <span className="text-red-500">*</span></th>
                          <th className="p-3 font-bold text-slate-500 min-w-[150px]">Category <span className="text-red-500">*</span></th>
                          <th className="p-3 font-bold text-slate-500 min-w-[150px]">Sub Category</th>
                          <th className="p-3 font-bold text-slate-500 w-24">Price (₹)</th>
                          <th className="p-3 font-bold text-slate-500 w-20">Stock</th>
                          <th className="p-3 font-bold text-slate-500 w-32">HSN Code</th>
                          <th className="p-3 font-bold text-slate-500 w-32">SKU</th>
                          <th className="p-3 font-bold text-slate-500 min-w-[200px]">Image URL</th>
                          <th className="p-3 font-bold text-slate-500 w-24">Status</th>
                          <th className="p-3 font-bold text-slate-500 w-10"></th>
                      </tr>
                  </thead>
                  <tbody>
                      {rows.map((row, idx) => (
                          <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 group">
                              <td className="p-3 font-mono text-slate-400 text-xs">{idx + 1}</td>
                              <td className="p-3">
                                  <input 
                                    value={row.name} 
                                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                    placeholder="Product Name"
                                    className={`w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300 ${row.error ? 'text-red-500' : ''}`}
                                  />
                                  {row.error && <p className="text-[10px] text-red-500 mt-1">{row.error}</p>}
                              </td>
                              <td className="p-3">
                                  <select 
                                    value={row.category_id}
                                    onChange={(e) => updateRow(row.id, 'category_id', e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600 cursor-pointer"
                                  >
                                      <option value="">Select Category</option>
                                      {categories.map(c => (
                                          <option key={c.id} value={c.id}>{c.name}</option>
                                      ))}
                                  </select>
                              </td>
                              <td className="p-3">
                                  <input 
                                    value={row.sub_category} 
                                    onChange={(e) => updateRow(row.id, 'sub_category', e.target.value)}
                                    placeholder="Sub Category"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600"
                                  />
                              </td>
                              <td className="p-3">
                                  <input 
                                    value={row.price} 
                                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                    placeholder="0.00"
                                    type="number"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-700"
                                  />
                              </td>
                              <td className="p-3">
                                  <input 
                                    value={row.stock_quantity} 
                                    onChange={(e) => updateRow(row.id, 'stock_quantity', e.target.value)}
                                    placeholder="0"
                                    type="number"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600"
                                  />
                              </td>
                              <td className="p-3">
                                  <input 
                                    value={row.hsn_code} 
                                    onChange={(e) => updateRow(row.id, 'hsn_code', e.target.value)}
                                    placeholder="HSN"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600"
                                  />
                              </td>
                              <td className="p-3">
                                  <input 
                                    value={row.sku} 
                                    onChange={(e) => updateRow(row.id, 'sku', e.target.value)}
                                    placeholder="SKU"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600 text-xs"
                                  />
                              </td>
                              <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <input 
                                        value={row.image_url} 
                                        onChange={(e) => updateRow(row.id, 'image_url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs text-blue-500 underline decoration-blue-200"
                                    />
                                    {row.image_url && (
                                        <div className="w-6 h-6 rounded bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                                            <img src={formatGDriveUrl(row.image_url)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                  </div>
                              </td>
                              <td className="p-3">
                                  <select 
                                    value={row.status}
                                    onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-bold uppercase ${row.status === 'open' || row.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}
                                  >
                                      <option value="closed">Closed</option>
                                      <option value="open">Open</option>
                                      <option value="active">Active</option>
                                  </select>
                              </td>
                              <td className="p-3 text-right">
                                  <button onClick={() => removeRow(row.id)} className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          
          <button 
            onClick={addRow}
            className="w-full py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
              <Plus className="w-4 h-4" /> Add Row
          </button>
      </div>

    </div>
  );
}
