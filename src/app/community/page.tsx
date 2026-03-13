"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, X, Upload, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { formatRelativeTime, cn, fileToDataUrl, compressImage } from "@/lib/utils";
import Link from "next/link";

interface CommunityPost {
  id: string;
  user_id: string;
  before_photo: string;
  after_photo: string;
  style_name: string;
  caption: string | null;
  hair_type: string | null;
  likes_count: number;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
}

const HAIR_TYPES = [
  { value: "all", label: "All" },
  { value: "straight", label: "Straight" },
  { value: "wavy", label: "Wavy" },
  { value: "curly", label: "Curly" },
  { value: "coily", label: "Coily" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/community?limit=30"
          : `/api/community?hair_type=${filter}&limit=30`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Load which posts current user has liked
  useEffect(() => {
    if (!user) return;
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setLikedPosts(new Set(data.map((l) => l.post_id)));
      });
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const wasLiked = likedPosts.has(postId);

    // Optimistic update
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count + (wasLiked ? -1 : 1) }
          : p
      )
    );

    try {
      const res = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Sync with server value
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: data.likes_count } : p
          )
        );
        setLikedPosts((prev) => {
          const next = new Set(prev);
          if (data.liked) next.add(postId);
          else next.delete(postId);
          return next;
        });
      }
    } catch {
      // Revert optimistic update on failure
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  };

  const handlePostCreated = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-cream pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl text-charcoal">
              Community
            </h1>
            <p className="font-body text-sm text-charcoal/50">
              Real transformations from real people
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              Share Look
            </button>
          ) : (
            <Link href="/auth" className="btn-secondary text-sm">
              Sign in to share
            </Link>
          )}
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {HAIR_TYPES.map((ht) => (
            <button
              key={ht.value}
              onClick={() => setFilter(ht.value)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all",
                filter === ht.value
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/60 border border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {ht.label}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8 text-terracotta/40" />
            </div>
            <p className="font-display text-lg text-charcoal">No posts yet</p>
            <p className="font-body text-sm text-charcoal/50">
              {user
                ? "Be the first to share your transformation!"
                : "Sign in and be the first to share your transformation!"}
            </p>
            {user ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Share Your Look
              </button>
            ) : (
              <Link href="/auth" className="btn-primary inline-flex">
                Sign In
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  isLiked={likedPosts.has(post.id)}
                  canLike={!!user}
                  onLike={handleLike}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create post modal */}
      <AnimatePresence>
        {showCreateModal && user && (
          <CreatePostModal
            user={user}
            onClose={() => setShowCreateModal(false)}
            onCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Post Card
// ============================================================

function PostCard({
  post,
  index,
  isLiked,
  canLike,
  onLike,
}: {
  post: CommunityPost;
  index: number;
  isLiked: boolean;
  canLike: boolean;
  onLike: (id: string) => void;
}) {
  const [showAfter, setShowAfter] = useState(true);
  const displayName =
    post.profiles?.display_name || "StyleSense User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      {/* Before / After image */}
      <div className="relative aspect-[4/3] bg-charcoal/5 overflow-hidden">
        <img
          src={showAfter ? post.after_photo : post.before_photo}
          alt={showAfter ? "After" : "Before"}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
        {/* Before/After toggle */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <button
            onClick={() => setShowAfter(false)}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-body font-medium transition-all",
              !showAfter
                ? "bg-charcoal text-white"
                : "bg-white/80 text-charcoal backdrop-blur-sm"
            )}
          >
            Before
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-body font-medium transition-all",
              showAfter
                ? "bg-terracotta text-white"
                : "bg-white/80 text-charcoal backdrop-blur-sm"
            )}
          >
            After
          </button>
        </div>
        {/* Hair type badge */}
        {post.hair_type && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-xs font-body text-charcoal capitalize">
              {post.hair_type}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-sm text-charcoal truncate">
              {post.style_name}
            </p>
            {post.caption && (
              <p className="font-body text-xs text-charcoal/60 leading-relaxed mt-0.5 line-clamp-2">
                {post.caption}
              </p>
            )}
          </div>
          <button
            onClick={() => canLike && onLike(post.id)}
            disabled={!canLike}
            className={cn(
              "flex items-center gap-1 flex-shrink-0 transition-colors",
              isLiked ? "text-red-500" : "text-charcoal/40",
              canLike && "hover:text-red-400"
            )}
            title={canLike ? undefined : "Sign in to like"}
          >
            <Heart
              className="w-4 h-4"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="font-body text-xs">{post.likes_count}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-charcoal/50 truncate">
            {displayName}
          </p>
          <p className="font-body text-xs text-charcoal/40 flex-shrink-0">
            {formatRelativeTime(post.created_at)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Create Post Modal
// ============================================================

function CreatePostModal({
  user,
  onClose,
  onCreated,
}: {
  user: User;
  onClose: () => void;
  onCreated: (post: CommunityPost) => void;
}) {
  const [beforePhoto, setBeforePhoto] = useState<string>("");
  const [afterPhoto, setAfterPhoto] = useState<string>("");
  const [styleName, setStyleName] = useState("");
  const [caption, setCaption] = useState("");
  const [hairType, setHairType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const compressed = await compressImage(dataUrl, 800, 0.8);
    setter(compressed);
    e.target.value = "";
  };

  const handleUploadToStorage = async (
    dataUrl: string,
    label: string
  ): Promise<string> => {
    const base64Data = dataUrl.split(",")[1];
    const blob = new Blob(
      [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
      { type: "image/jpeg" }
    );
    const path = `community/${user.id}/${Date.now()}_${label}.jpg`;
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforePhoto || !afterPhoto || !styleName) return;
    setIsSubmitting(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload photos to storage
      const [beforeUrl, afterUrl] = await Promise.all([
        handleUploadToStorage(beforePhoto, "before"),
        handleUploadToStorage(afterPhoto, "after"),
      ]);

      const res = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          before_photo: beforeUrl,
          after_photo: afterUrl,
          style_name: styleName,
          caption: caption || null,
          hair_type: hairType || null,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onCreated(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal/10">
          <h2 className="font-display text-lg text-charcoal">Share Your Look</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream flex items-center justify-center"
          >
            <X className="w-4 h-4 text-charcoal/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Photo uploads */}
          <div className="grid grid-cols-2 gap-3">
            <PhotoUploadBox
              label="Before"
              value={beforePhoto}
              onChange={(e) => handlePhotoSelect(e, setBeforePhoto)}
            />
            <PhotoUploadBox
              label="After"
              value={afterPhoto}
              onChange={(e) => handlePhotoSelect(e, setAfterPhoto)}
            />
          </div>

          {/* Style name */}
          <div className="space-y-1">
            <label className="text-xs font-body font-medium text-charcoal">
              Style name *
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="e.g. Textured Bob, Blowout Waves..."
              required
              className="input-field text-sm"
            />
          </div>

          {/* Hair type */}
          <div className="space-y-1">
            <label className="text-xs font-body font-medium text-charcoal">
              Hair type
            </label>
            <select
              value={hairType}
              onChange={(e) => setHairType(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Select hair type (optional)</option>
              <option value="straight">Straight</option>
              <option value="wavy">Wavy</option>
              <option value="curly">Curly</option>
              <option value="coily">Coily</option>
            </select>
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <label className="text-xs font-body font-medium text-charcoal">
              Caption (optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your experience, products used, tips..."
              rows={3}
              className="textarea-field text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm font-body text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !beforePhoto || !afterPhoto || !styleName}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Share Transformation"
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PhotoUploadBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <div
        className={cn(
          "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors",
          value
            ? "border-terracotta/30"
            : "border-charcoal/20 hover:border-charcoal/40 bg-cream"
        )}
      >
        {value ? (
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Upload className="w-6 h-6 text-charcoal/30 mb-1" />
            <span className="font-body text-xs text-charcoal/50">{label}</span>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
