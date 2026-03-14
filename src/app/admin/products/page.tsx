"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Upload, Shield, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, ProductCategory } from "@/lib/types";
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

      {/* Product form modal */}
      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            product={editProduct}
            onClose={() => { setShowForm(false); setEditProduct(null); }}
            onSaved={loadProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Product Form Modal
// ============================================================

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "shampoo" as ProductCategory,
  subcategory: "",
  description: "",
  image_url: "",
  affiliate_url: "",
  affiliate_network: "Amazon Associates",
  price: "",
  rating: "4.5",
  hair_types: "",
  concerns: "",
  key_ingredients: "",
  is_active: true,
};

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(() =>
    product
      ? {
          ...EMPTY_FORM,
          name: product.name,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory || "",
          description: product.description,
          image_url: product.image_url,
          affiliate_url: product.affiliate_url,
          affiliate_network: product.affiliate_network,
          price: String(product.price),
          rating: String(product.rating),
          hair_types: product.hair_types.join(", "),
          concerns: product.concerns.join(", "),
          key_ingredients: product.key_ingredients.join(", "),
          is_active: product.is_active,
        }
      : EMPTY_FORM
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      subcategory: form.subcategory || null,
      description: form.description,
      image_url: form.image_url,
      affiliate_url: form.affiliate_url,
      affiliate_network: form.affiliate_network,
      price: parseFloat(form.price) || 0,
      rating: Math.min(5, Math.max(0, parseFloat(form.rating) || 0)),
      hair_types: form.hair_types
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      concerns: form.concerns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      key_ingredients: form.key_ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      is_active: form.is_active,
    };

    const { error: dbError } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setIsSaving(false);
      return;
    }

    await onSaved();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-charcoal/10">
          <h2 className="font-display text-lg text-charcoal">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream flex items-center justify-center"
          >
            <X className="w-4 h-4 text-charcoal/60" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3">
          {/* Row: name + brand */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Product name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className="input-field text-sm"
                placeholder="Product name"
              />
            </Field>
            <Field label="Brand *">
              <input
                type="text"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                required
                className="input-field text-sm"
                placeholder="Brand"
              />
            </Field>
          </div>

          {/* Row: category + subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="input-field text-sm"
              >
                {["shampoo", "conditioner", "styling", "treatment", "tool"].map(
                  (c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  )
                )}
              </select>
            </Field>
            <Field label="Subcategory">
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
                className="input-field text-sm"
                placeholder="e.g. moisturizing"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="textarea-field text-sm"
              placeholder="Short product description"
            />
          </Field>

          <Field label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              className="input-field text-sm"
              placeholder="https://..."
            />
          </Field>

          <Field label="Affiliate URL *">
            <input
              type="url"
              value={form.affiliate_url}
              onChange={(e) => set("affiliate_url", e.target.value)}
              required
              className="input-field text-sm"
              placeholder="https://amzn.to/..."
            />
          </Field>

          {/* Row: network + price + rating */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Network">
              <input
                type="text"
                value={form.affiliate_network}
                onChange={(e) => set("affiliate_network", e.target.value)}
                className="input-field text-sm"
              />
            </Field>
            <Field label="Price ($)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                step="0.01"
                min="0"
                className="input-field text-sm"
                placeholder="0.00"
              />
            </Field>
            <Field label="Rating (0–5)">
              <input
                type="number"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                step="0.1"
                min="0"
                max="5"
                className="input-field text-sm"
                placeholder="4.5"
              />
            </Field>
          </div>

          <Field label="Hair types (comma-separated)">
            <input
              type="text"
              value={form.hair_types}
              onChange={(e) => set("hair_types", e.target.value)}
              className="input-field text-sm"
              placeholder="straight, wavy, curly, coily, all"
            />
          </Field>

          <Field label="Concerns (comma-separated)">
            <input
              type="text"
              value={form.concerns}
              onChange={(e) => set("concerns", e.target.value)}
              className="input-field text-sm"
              placeholder="dryness, frizz, damage, thinning..."
            />
          </Field>

          <Field label="Key ingredients (comma-separated)">
            <input
              type="text"
              value={form.key_ingredients}
              onChange={(e) => set("key_ingredients", e.target.value)}
              className="input-field text-sm"
              placeholder="argan oil, keratin, biotin..."
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="w-4 h-4 accent-terracotta"
            />
            <label htmlFor="is_active" className="text-sm font-body text-charcoal">
              Active (visible to users)
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm font-body text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isSaving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-body font-medium text-charcoal/70">
        {label}
      </label>
      {children}
    </div>
  );
}
