import JournalsClient from "./journals-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journals - Luka Adzic",
  description: "My thoughts, insights, and experiences",
};

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
    // Fetch from Keystatic Cloud API
    const response = await fetch(
      `https://api.keystatic.cloud/v1/projects/luka-adzic-portfolio/lukaadzic/collections/posts`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch from Keystatic Cloud:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();

    // Transform the Keystatic Cloud data to our Post format
    const posts = await Promise.all(
      data.map(async (item: any) => {
        // Fetch individual post content
        const postResponse = await fetch(
          `https://api.keystatic.cloud/v1/projects/luka-adzic-portfolio/lukaadzic/collections/posts/${item.slug}`,
          {
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!postResponse.ok) {
          return null;
        }

        const postData = await postResponse.json();

        return {
          slug: item.slug,
          title: postData.title || "",
          publishedDate: postData.publishedDate || null,
          postType: postData.postType || "post",
          excerpt: postData.excerpt || "",
          featuredImage: postData.featuredImage || null,
          featuredImagePosition: postData.featuredImagePosition || "",
          featuredImageCrop: postData.featuredImageCrop || { x: 50, y: 50 },
          additionalImages: postData.additionalImages || [],
          content: postData.content || "",
        };
      })
    );

    // Filter out null posts and sort by date
    const validPosts = posts.filter(Boolean) as Post[];
    return validPosts.sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching posts from Keystatic Cloud:", error);
    return [];
  }
}

export default async function Journals() {
  const posts = await getPosts();
  return <JournalsClient posts={posts} />;
}
