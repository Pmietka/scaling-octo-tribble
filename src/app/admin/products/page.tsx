"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Upload, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const ADMIN_EMAILS = ["admin@stylesense.app"];

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState("all");
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/");
        return;
      }
      setIsAdmin(true);
      await loadProducts();
    };
    checkAdmin();
  }, [router]);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setIsLoading(false);
  };

  const toggleActive = async (product: Product) => {
    await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      )
    );
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");

    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const requiredHeaders = ["name", "brand", "category", "price", "affiliate_url"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      setCsvError(`Missing required columns: ${missingHeaders.join(", ")}`);
      return;
    }

    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      return row;
    });

    const products = rows.map((row) => ({
      name: row.name,
      brand: row.brand,
      category: row.category,
      subcategory: row.subcategory || null,
      description: row.description || "",
      image_url: row.image_url || "",
      affiliate_url: row.affiliate_url,
      affiliate_network: row.affiliate_network || "Amazon Associates",
      price: parseFloat(row.price) || 0,
      rating: parseFloat(row.rating) || 4.0,
      hair_types: row.hair_types ? row.hair_types.split("|") : [],
      concerns: row.concerns ? row.concerns.split("|") : [],
      key_ingredients: row.key_ingredients ? row.key_ingredients.split("|") : [],
      is_active: row.is_active !== "false",
    }));

    const { error } = await supabase.from("products").insert(products);
    if (error) {
      setCsvError(error.message);
    } else {
      await loadProducts();
    }
    e.target.value = "";
  };

  const filteredProducts = filter === "all"
    ? products
    : products.filter((p) => p.category === filter);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-charcoal/30 mx-auto mb-3" />
          <p className="font-body text-charcoal/50">Access restricted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-14">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-charcoal">Product Management</h1>
            <p className="font-body text-sm text-charcoal/50">
              {products.length} products, {products.filter(p => p.is_active).length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* CSV Import */}
            <label className="btn-secondary text-xs cursor-pointer flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => { setEditProduct(null); setShowForm(true); }}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {csvError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm font-body text-red-600">{csvError}</p>
          </div>
        )}

        {/* CSV Format help */}
        <details className="mb-4 card p-4 text-sm font-body">
          <summary className="cursor-pointer text-charcoal/60 font-medium">
            CSV Format Guide
          </summary>
          <div className="mt-3 space-y-1 text-charcoal/50 text-xs">
            <p>Required columns: <code className="bg-cream px-1 rounded">name, brand, category, price, affiliate_url</code></p>
            <p>Category values: <code className="bg-cream px-1 rounded">shampoo, conditioner, styling, treatment, tool</code></p>
            <p>Use <code className="bg-cream px-1 rounded">|</code> to separate multiple values in array fields (hair_types, concerns, key_ingredients)</p>
            <p>Example: <code className="bg-cream px-1 rounded">curly|wavy</code> for hair_types</p>
          </div>
        </details>

        {/* Category filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["all", "shampoo", "conditioner", "styling", "treatment", "tool"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium capitalize transition-all ${
                filter === cat
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/60 border border-charcoal/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card p-4 flex items-center gap-3 ${!product.is_active ? "opacity-60" : ""}`}
              >
                {/* Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-charcoal truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-body text-charcoal/50">{product.brand}</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/20" />
                    <span className="text-xs font-body text-charcoal/50 capitalize">{product.category}</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/20" />
                    <span className="text-xs font-body text-charcoal">{formatPrice(product.price)}</span>
                  </div>
                </div>

                {/* Status toggle */}
                <button
                  onClick={() => toggleActive(product)}
                  className={`px-2 py-1 rounded-full text-xs font-body font-medium transition-colors ${
                    product.is_active
                      ? "bg-sage/20 text-sage-700"
                      : "bg-charcoal/10 text-charcoal/50"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditProduct(product); setShowForm(true); }}
                    className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center hover:bg-cream-400 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-charcoal/60" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-charcoal/60 hover:text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-charcoal/40 font-body text-sm">
                No products in this category
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
