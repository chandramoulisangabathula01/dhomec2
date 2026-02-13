import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query && !category) {
      return NextResponse.json({ results: [], total: 0 });
    }

    let dbQuery = supabase
      .from("products")
      .select("id, name, slug, price, image_url, type, brand, model_name, category_id, categories(name, slug)", { count: "exact" })
      .eq("status", "active");

    if (query) {
      // Use ilike for flexible text search across multiple fields
      const searchPattern = `%${query}%`;
      dbQuery = dbQuery.or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern},brand.ilike.${searchPattern},model_name.ilike.${searchPattern},material.ilike.${searchPattern}`
      );
    }

    if (category) {
      // Filter by category slug
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .single();

      if (catData) {
        dbQuery = dbQuery.eq("category_id", catData.id);
      }
    }

    const { data, error, count } = await dbQuery
      .order("is_featured", { ascending: false })
      .order("name")
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Search] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      query,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (err: any) {
    console.error("[Search] Error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
