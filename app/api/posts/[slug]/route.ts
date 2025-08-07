import { NextRequest, NextResponse } from "next/server";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../../keystatic.config";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Use Keystatic reader to get the post
    const post = await reader.collections.posts.read(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get the content
    const content = await post.content();

    
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

    // Format the response to match our Post type
    const formattedPost = {
      slug,
      title: post.title || "",
      publishedDate: post.publishedDate || null,
      postType: post.postType || "post",
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || null,
      featuredImagePosition: post.featuredImagePosition || "",
      featuredImageCrop: post.featuredImageCrop || { x: 50, y: 50 },
      additionalImages: post.additionalImages || [],
      content: cleanContent,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Error fetching post from Keystatic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
