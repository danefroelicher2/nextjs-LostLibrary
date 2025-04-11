// src/app/articles/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);

  // Extract slug from params
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?.id && user) {
      checkIfLiked();
    }
  }, [article, user]);

  async function fetchArticle() {
    setLoading(true);
    try {
      console.log("Fetching article with slug:", slug);

      // Use type assertion to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        setNotFoundTriggered(true);
        return;
      }

      console.log("Article found:", data);
      setArticle(data);

      // 2. Fetch the author if we have user_id
      if (data.user_id) {
        const { data: authorData, error: authorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user_id)
          .single();

        if (!authorError && authorData) {
          setAuthor(authorData);
        }
      }

      // 3. Get like count
      const { count, error: likesError } = await (supabase as any)
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("article_id", data.id);

      if (!likesError && count !== null) {
        setLikeCount(count);
      }

      // 4. Update view count
      if (data.id) {
        const currentViewCount =
          typeof data.view_count === "number" ? data.view_count : 0;
        await (supabase as any)
          .from("public_articles")
          .update({ view_count: currentViewCount + 1 })
          .eq("id", data.id);
      }
    } catch (error) {
      console.error("Error in article fetch flow:", error);
      setNotFoundTriggered(true);
    } finally {
      setLoading(false);
    }
  }

  async function checkIfLiked() {
    if (!user || !article?.id) return;

    try {
      const { data, error } = await (supabase as any)
        .from("likes")
        .select("*")
        .eq("article_id", article.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) {
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  }

  async function handleLike() {
    if (!user) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/articles/${slug}`)}`
      );
      return;
    }

    if (!article?.id) return;

    try {
      if (isLiked) {
        // Unlike
        await (supabase as any)
          .from("likes")
          .delete()
          .eq("article_id", article.id)
          .eq("user_id", user.id);

        setLikeCount((prev) => prev - 1);
      } else {
        // Like
        await (supabase as any).from("likes").insert({
          article_id: article.id,
          user_id: user.id,
        });

        setLikeCount((prev) => prev + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  // Render not-found if the article doesn't exist
  if (notFoundTriggered) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.username || "User"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                (author?.username || "U")[0].toUpperCase()
              )}
            </div>
            <div>
              {author?.id ? (
                <Link
                  href={`/profile/${author.id}`}
                  className="font-medium hover:text-blue-600"
                >
                  {author?.full_name || author?.username || "Anonymous"}
                </Link>
              ) : (
                <span className="font-medium">
                  {author?.full_name || author?.username || "Anonymous"}
                </span>
              )}
              <p className="text-sm text-gray-500">
                {new Date(article.published_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {article.image_url && (
          <div className="mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div className="prose max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
        </div>

        <div className="border-t border-b py-4 mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex items-center ${
                isLiked ? "text-red-600" : "text-gray-600"
              }`}
              aria-label={isLiked ? "Unlike this article" : "Like this article"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="ml-2">
                {likeCount} {likeCount === 1 ? "Like" : "Likes"}
              </span>
            </button>
          </div>

          <div className="text-gray-600 text-sm">
            {article.view_count || 0}{" "}
            {article.view_count === 1 ? "View" : "Views"}
          </div>
        </div>

        {article.id && <CommentSection articleId={article.id} />}
      </div>
    </div>
  );
}
