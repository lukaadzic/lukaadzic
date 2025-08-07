import JournalsClient from "./journals-client";
import { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export const metadata: Metadata = {
  title: "Journals - Luka Adzic",
  description: "My thoughts, insights, and experiences",
};

const reader = createReader(process.cwd(), keystaticConfig);

// Helper function to extract text from Markdoc AST
function extractTextFromMarkdoc(content: any): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromMarkdoc).join("");
  }

  if (content && typeof content === "object") {
    if (content.type === "text") {
      return content.text || "";
    }

    if (content.children) {
      return extractTextFromMarkdoc(content.children);
    }

    // Try to extract from common Markdoc properties
    if (content.content) {
      return extractTextFromMarkdoc(content.content);
    }
  }

  return "";
}

type Post = {
  slug: string;
  title: string;
  publishedDate: string | null;
  postType: "post" | "take";
  excerpt: string;
  featuredImage?: string | null;
  featuredImagePosition?: string; // Legacy field - ignored
  featuredImageCrop?: {
    x: number;
    y: number;
  };
  additionalImages?: Array<{
    image: string | null;
    alt: string;
  }>;
  content: string;
};

async function getPosts(): Promise<Post[]> {
  try {
    // Use Keystatic reader with local storage (no authentication needed)
    const allPosts = await reader.collections.posts.all();

    const postsWithContent = await Promise.all(
      allPosts.map(async (post) => {
        try {
          // Get the content from the post
          const content = await post.entry.content();

          // Convert Markdoc content to a readable string
          let contentString = "";
          if (typeof content === "string") {
            contentString = content;
          } else if (content && typeof content === "object") {
            // For Markdoc AST, try to extract text content
            contentString = extractTextFromMarkdoc(content);
          }

          // Generate excerpt if not provided
          const excerpt =
            post.entry.excerpt ||
            (contentString ? contentString.substring(0, 200) + "..." : "");

          return {
            slug: post.slug,
            title: post.entry.title || "",
            publishedDate: post.entry.publishedDate || null,
            postType: post.entry.postType || "post",
            excerpt,
            featuredImage: post.entry.featuredImage || null,
            featuredImagePosition: post.entry.featuredImagePosition || "",
            featuredImageCrop: {
              x: post.entry.featuredImageCrop?.x ?? 50,
              y: post.entry.featuredImageCrop?.y ?? 50,
            },
            additionalImages: (post.entry.additionalImages || []).map(
              (img) => ({
                image: img.image,
                alt: img.alt,
              })
            ),
            content: contentString,
          };
        } catch (contentError) {
          console.error(`Error processing post ${post.slug}:`, contentError);

          // Fallback: create post without content
          const excerpt = post.entry.excerpt || "Content unavailable";

          return {
            slug: post.slug,
            title: post.entry.title || "",
            publishedDate: post.entry.publishedDate || null,
            postType: post.entry.postType || "post",
            excerpt,
            featuredImage: post.entry.featuredImage || null,
            featuredImagePosition: post.entry.featuredImagePosition || "",
            featuredImageCrop: {
              x: post.entry.featuredImageCrop?.x ?? 50,
              y: post.entry.featuredImageCrop?.y ?? 50,
            },
            additionalImages: (post.entry.additionalImages || []).map(
              (img) => ({
                image: img.image,
                alt: img.alt,
              })
            ),
            content: "",
          };
        }
      })
    );

    // Sort by date
    return postsWithContent.sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching posts from Keystatic:", error);
    return [];
  }
}

export default async function Journals() {
  const posts = await getPosts();
  return <JournalsClient posts={posts} />;
}
