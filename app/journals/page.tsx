import { createReader } from "@keystatic/core/reader";
import config from "../../keystatic.config";
import JournalsClient from "./journals-client";
import Markdoc from "@markdoc/markdoc";
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

const reader = createReader(process.cwd(), config);

// Function to convert Markdoc content to markdown string
function convertToMarkdown(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  try {
    // Handle different content formats
    let nodeToTransform;

    if (typeof content === "object" && content !== null) {
      const contentObj = content as Record<string, unknown>;
      if (contentObj.node) {
        nodeToTransform = contentObj.node;
      } else {
        nodeToTransform = content;
      }
    } else {
      nodeToTransform = content;
    }

    // Transform Markdoc AST to renderable content
    const transformed = Markdoc.transform(
      nodeToTransform as Parameters<typeof Markdoc.transform>[0]
    );

    // Convert to markdown-like string
    const markdown = renderToMarkdown(transformed);

    // Clean up Markdoc-specific formatting
    return cleanMarkdocFormatting(markdown);
  } catch {
    return "";
  }
}

// Clean up Markdoc-specific formatting for better markdown compatibility
function cleanMarkdocFormatting(text: string): string {
  return (
    text
      // Convert Markdoc line breaks (backslash) to proper markdown line breaks
      .replace(/\\\s*$/gm, "  \n") // Backslash at end of line becomes markdown line break
      .replace(/\\\s*\n/g, "  \n") // Backslash followed by newline
      // Clean up multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  );
}

// Simple function to convert transformed content to markdown
function renderToMarkdown(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(renderToMarkdown).join("");
  }

  if (typeof content === "object" && content !== null) {
    const contentObj = content as Record<string, unknown>;
    if (contentObj.name) {
      const children = contentObj.children
        ? (contentObj.children as unknown[]).map(renderToMarkdown).join("")
        : "";

      switch (contentObj.name) {
        case "p":
          return children + "\n\n";
        case "h1":
          return `# ${children}\n\n`;
        case "h2":
          return `## ${children}\n\n`;
        case "h3":
          return `### ${children}\n\n`;
        case "h4":
          return `#### ${children}\n\n`;
        case "h5":
          return `##### ${children}\n\n`;
        case "h6":
          return `###### ${children}\n\n`;
        case "strong":
          return `**${children}**`;
        case "em":
          return `*${children}*`;
        case "code":
          return `\`${children}\``;
        case "pre":
          return `\`\`\`\n${children}\n\`\`\`\n\n`;
        case "a":
          const attrs = contentObj.attributes as
            | Record<string, unknown>
            | undefined;
          const href = attrs?.href || "#";
          return `[${children}](${href})`;
        case "ul":
          return children + "\n";
        case "ol":
          return children + "\n";
        case "li":
          return `- ${children}\n`;
        case "blockquote":
          return `> ${children}\n\n`;
        case "hr":
          return `---\n\n`;
        case "br":
          return "  \n";
        default:
          return children;
      }
    }
  }

  return String(content);
}

export default async function Journals() {
  // Fetch posts with full content on the server
  let posts: Post[] = [];

  try {
    const allPosts = await reader.collections.posts.all();
    const postsWithContent = await Promise.all(
      allPosts.map(async (post) => {
        const content = await post.entry.content();

        // Convert Markdoc content to markdown for client component
        let markdownContent = "";
        if (content && typeof content === "object") {
          markdownContent = convertToMarkdown(content);
        } else if (typeof content === "string") {
          markdownContent = content;
        }

        return {
          slug: post.slug,
          title: post.entry.title,
          publishedDate: post.entry.publishedDate,
          postType: post.entry.postType || "post",
          excerpt: post.entry.excerpt,
          featuredImage: post.entry.featuredImage,
          featuredImagePosition: post.entry.featuredImagePosition, // Legacy - ignored
          featuredImageCrop: {
            x: post.entry.featuredImageCrop?.x || 50,
            y: post.entry.featuredImageCrop?.y || 50,
          },
          additionalImages: (post.entry.additionalImages || []).map((img) => ({
            image: img.image,
            alt: img.alt,
          })),
          content: markdownContent,
        };
      })
    );

    posts = postsWithContent.sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch {
    // Silently handle error, posts will be empty array
  }

  return <JournalsClient posts={posts} />;
}
