import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-500">Name</th>
              <th className="p-4 font-medium text-slate-500">Price</th>
              <th className="p-4 font-medium text-slate-500">Category</th>
              <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{product.name}</div>
                  <div className="text-xs text-slate-500">{product.slug}</div>
                </td>
                <td className="p-4">₹ {product.price?.toLocaleString() || '-'}</td>
                <td className="p-4 text-slate-500">-</td> 
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No products found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
