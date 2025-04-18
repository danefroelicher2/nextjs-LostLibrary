// src/app/feed/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published_at: string;
  view_count: number;
  image_url?: string | null;
  user_id: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function PublicFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [followingArticles, setFollowingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const { user } = useAuth();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const articlesPerPage = 6;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "forYou") {
      fetchArticles();
    } else if (activeTab === "following" && user) {
      fetchFollowingArticles(1);
    }
  }, [activeTab, selectedCategory, user]);

  async function fetchArticles() {
    setLoading(true);

    try {
      let query = (supabase as any)
        .from("public_articles")
        .select(
          `
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Articles fetched:", data?.length || 0);
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowingArticles(pageNum: number) {
    try {
      if (!user) {
        // If not logged in, don't try to fetch
        setFollowingLoading(false);
        return;
      }

      setFollowingLoading(true);
      setError(null);

      console.log(
        `Fetching following articles for user ${user.id}, page ${pageNum}`
      );

      // First get list of users the current user follows
      const { data: followingData, error: followingError } = await (
        supabase as any
      )
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;

      // If not following anyone, show empty state
      if (!followingData || followingData.length === 0) {
        console.log("User is not following anyone");
        setFollowingArticles([]);
        setHasMore(false);
        setFollowingLoading(false);
        return;
      }

      // Extract the user IDs the user is following
      const followingIds = followingData.map(
        (follow: { following_id: string }) => follow.following_id
      );
      console.log("Following IDs:", followingIds);

      // Fetch articles from followed users with pagination
      const from = (pageNum - 1) * articlesPerPage;
      const to = from + articlesPerPage - 1;

      const { data: articlesData, error: articlesError } = await (
        supabase as any
      )
        .from("public_articles")
        .select(
          `
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `
        )
        .in("user_id", followingIds)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (articlesError) throw articlesError;

      console.log(
        `Found ${articlesData?.length || 0} articles from followed users`
      );

      // Determine if there are more articles to load
      setHasMore(articlesData?.length === articlesPerPage);

      // If loading more, append to existing articles
      if (pageNum > 1) {
        setFollowingArticles((prev) => [...prev, ...(articlesData || [])]);
      } else {
        setFollowingArticles(articlesData || []);
      }

      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching following articles:", err);
      setError("Failed to load articles from people you follow");
    } finally {
      setFollowingLoading(false);
    }
  }

  function loadMore() {
    if (hasMore && !followingLoading) {
      fetchFollowingArticles(page + 1);
    }
  }

  // Format date (e.g., "Mar 15, 2024")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Categories matching your existing ones
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "ancient-history", label: "Ancient History" },
    { value: "medieval-period", label: "Medieval Period" },
    { value: "renaissance", label: "Renaissance" },
    { value: "early-modern-period", label: "Early Modern Period" },
    { value: "industrial-age", label: "Industrial Age" },
    { value: "20th-century", label: "20th Century" },
    { value: "world-wars", label: "World Wars" },
    { value: "cold-war-era", label: "Cold War Era" },
    { value: "modern-history", label: "Modern History" },
  ];

  const renderArticleGrid = (
    articlesToShow: Article[],
    isLoadingState: boolean
  ) => {
    if (isLoadingState) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden article-card animate-pulse"
            >
              <div className="h-48 bg-slate-200"></div>
              <div className="p-4">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 mr-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (articlesToShow.length === 0) {
      if (activeTab === "following") {
        return (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
              Your Following Feed is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Follow other users to see their articles here
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={() => setActiveTab("forYou")}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Browse Community Feed
              </button>
              <Link
                href="/search-users"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Find Users to Follow
              </Link>
            </div>
          </div>
        );
      } else {
        return (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600">
              No articles found in this category.
            </p>
            {user && (
              <Link
                href="/write"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Write the First Article
              </Link>
            )}
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articlesToShow.map((article: Article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg shadow-md overflow-hidden article-card"
          >
            <div className="h-48 bg-slate-200 overflow-hidden">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <span className="text-center p-4">{article.title}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                  {article.title}
                </h2>
              </Link>

              <Link
                href={`/user/${article.user_id}`}
                className="flex items-center mb-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2 overflow-hidden">
                  {article.profiles?.avatar_url ? (
                    <img
                      src={article.profiles.avatar_url}
                      alt={article.profiles.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {(
                        article.profiles?.username?.charAt(0) ||
                        article.profiles?.full_name?.charAt(0) ||
                        "U"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 group-hover:text-blue-600">
                  {article.profiles?.full_name ||
                    article.profiles?.username ||
                    "Anonymous"}
                </span>
              </Link>

              <p className="text-gray-600 text-sm mb-2">
                {formatDate(article.published_at)}
              </p>

              <p className="text-gray-700 mb-3 line-clamp-3">
                {article.excerpt || "No excerpt available"}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {categories.find((c) => c.value === article.category)
                    ?.label ||
                    article.category ||
                    "Uncategorized"}
                </span>

                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {article.view_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Feed</h1>
          <p className="text-gray-600">
            Discover articles from the community and people you follow
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-4">
          <Link
            href="/search-users"
            className="text-blue-600 hover:text-blue-800 self-center"
          >
            Find Users
          </Link>
          {user && (
            <Link
              href="/write"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Write Article
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`px-6 py-3 text-lg font-medium border-b-2 ${
              activeTab === "forYou"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-6 py-3 text-lg font-medium border-b-2 ${
              activeTab === "following"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "forYou" ? (
        <>
          {/* Category Filter - only shown for "For You" tab */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* For You tab content */}
          {renderArticleGrid(articles, loading)}
        </>
      ) : (
        <>
          {/* Following tab content */}
          {!user ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">
                See articles from people you follow
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in to see articles from people you follow
              </p>
              <Link
                href="/signin"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {renderArticleGrid(followingArticles, followingLoading)}

              {/* "Load More" button for Following tab */}
              {hasMore && followingArticles.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={followingLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {followingLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
