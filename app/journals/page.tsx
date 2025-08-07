import JournalsClient from "./journals-client";
import { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export const metadata: Metadata = {
  title: "Journals - Luka Adzic",
  description: "My thoughts, insights, and experiences",
};

const reader = createReader(process.cwd(), keystaticConfig);

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
          const content = await post.entry.content();

          // Convert content to string if needed
          let contentString = "";
          if (typeof content === "string") {
            contentString = content;
          } else if (content && typeof content === "object") {
            // For Markdoc content, convert to string representation
            contentString = JSON.stringify(content);
          }

          return {
            slug: post.slug,
            title: post.entry.title || "",
            publishedDate: post.entry.publishedDate || null,
            postType: post.entry.postType || "post",
            excerpt: post.entry.excerpt || "",
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
          return {
            slug: post.slug,
            title: post.entry.title || "",
            publishedDate: post.entry.publishedDate || null,
            postType: post.entry.postType || "post",
            excerpt: post.entry.excerpt || "",
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
