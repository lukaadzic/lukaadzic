import JournalsClient from "./journals-client";
import { Metadata } from "next";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export const metadata: Metadata = {
  title: "Journals - Luka Adzic",
  description: "My thoughts, insights, and experiences",
};

const reader = createReader(process.cwd(), keystaticConfig);

// Type for Markdoc Node
interface MarkdocNode {
  $$mdtype?: string;
  type?: string;
  attributes?: {
    content?: string;
    [key: string]: unknown;
  };
  children?: MarkdocNode[];
  value?: string;
  text?: string;
  content?: string;
  node?: MarkdocNode;
}

// Helper function to extract text from Markdoc AST
function extractTextFromMarkdoc(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromMarkdoc).join("");
  }

  if (content && typeof content === "object") {
    const node = content as MarkdocNode;
    // Handle Markdoc Node objects (with $$mdtype)
    if (node.$$mdtype === "Node") {
      // Handle text nodes
      if (node.type === "text") {
        return (
          node.attributes?.content ||
          node.value ||
          node.text ||
          node.content ||
          ""
        );
      }

      // Handle softbreak nodes (line breaks)
      if (node.type === "softbreak") {
        return " ";
      }

      // Handle hardbreak nodes (line breaks)
      if (node.type === "hardbreak") {
        return "\n";
      }

      // Handle document/root nodes
      if (node.type === "document" && node.children) {
        return extractTextFromMarkdoc(node.children);
      }

      // Handle paragraph nodes
      if (node.type === "paragraph") {
        if (node.children) {
          return extractTextFromMarkdoc(node.children) + "\n\n";
        }
        return "\n\n";
      }

      // Handle inline nodes (contain the actual text nodes)
      if (node.type === "inline") {
        if (node.children) {
          return extractTextFromMarkdoc(node.children);
        }
        return "";
      }

      // Handle heading nodes
      if (node.type === "heading" && node.children) {
        return extractTextFromMarkdoc(node.children) + "\n\n";
      }

      // Handle list nodes
      if (node.type === "list" && node.children) {
        return extractTextFromMarkdoc(node.children) + "\n";
      }

      // Handle list item nodes
      if (node.type === "item" && node.children) {
        return "• " + extractTextFromMarkdoc(node.children) + "\n";
      }

      // Handle strong/emphasis nodes
      if (
        (node.type === "strong" || node.type === "emphasis") &&
        node.children
      ) {
        return extractTextFromMarkdoc(node.children);
      }

      // Handle link nodes
      if (node.type === "link" && node.children) {
        return extractTextFromMarkdoc(node.children);
      }

      // Handle generic children for Markdoc nodes
      if (node.children) {
        return extractTextFromMarkdoc(node.children);
      }
    }

    // Handle regular objects (non-Markdoc)
    // Handle text nodes
    if (node.type === "text") {
      return node.text || node.value || "";
    }

    // Handle generic children
    if (node.children) {
      return extractTextFromMarkdoc(node.children);
    }

    // Handle content property
    if (node.content) {
      return extractTextFromMarkdoc(node.content);
    }

    // Handle node property (Keystatic wrapper)
    if (node.node) {
      return extractTextFromMarkdoc(node.node);
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
    // Use Keystatic reader to get all posts
    const allPosts = await reader.collections.posts.all();

    const postsWithContent = await Promise.all(
      allPosts.map(async (post) => {
        try {
          // Get the content from the post
          const content = await post.entry.content();

          // Convert content to string using proper Markdoc extraction
          let contentString = "";
          if (typeof content === "string") {
            contentString = content;
          } else if (content) {
            // Try different approaches to extract content
            const contentNode = content as MarkdocNode;
            if (contentNode.children) {
              contentString = extractTextFromMarkdoc(content);
            } else if (Array.isArray(content)) {
              contentString = content
                .map((item) => extractTextFromMarkdoc(item))
                .join("\n");
            } else if (contentNode.node) {
              // Keystatic might return { node: Node } format
              contentString = extractTextFromMarkdoc(contentNode.node);
            } else {
              // Fallback: try to stringify and extract meaningful content
              const contentStr = JSON.stringify(content);
              contentString = extractTextFromMarkdoc(content);
            }
          }

          // Clean up content by replacing backslashes with proper line breaks
          const cleanContent = contentString.trim().replace(/\\\s*$/gm, "");

          // Generate excerpt if not provided
          const excerpt =
            post.entry.excerpt ||
            (cleanContent ? cleanContent.substring(0, 200) + "..." : "");

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
              (img: { image: string | null; alt: string }) => ({
                image: img.image || "",
                alt: img.alt,
              })
            ),
            content: cleanContent,
          };
        } catch (contentError) {
          console.error(`Error processing post ${post.slug}:`, contentError);
          return {
            slug: post.slug,
            title: post.entry.title || "",
            publishedDate: post.entry.publishedDate || null,
            postType: post.entry.postType || "post",
            excerpt: post.entry.excerpt || "Content unavailable",
            featuredImage: post.entry.featuredImage || null,
            featuredImagePosition: post.entry.featuredImagePosition || "",
            featuredImageCrop: {
              x: post.entry.featuredImageCrop?.x ?? 50,
              y: post.entry.featuredImageCrop?.y ?? 50,
            },
            additionalImages: (post.entry.additionalImages || []).map(
              (img: { image: string | null; alt: string }) => ({
                image: img.image || "",
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
