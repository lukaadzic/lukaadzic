import { NextRequest, NextResponse } from "next/server";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import Markdoc from "@markdoc/markdoc";

const reader = createReader(process.cwd(), keystaticConfig);

// Convert Markdoc content to markdown string
function convertMarkdocToMarkdown(content: any): string {
  if (!content) return "";

  try {
    // Transform Markdoc AST to renderable content
    const transformed = Markdoc.transform(content.node || content);

    // Convert to markdown-like string
    const markdown = renderToMarkdown(transformed);

    // Clean up Markdoc-specific formatting
    return cleanMarkdocFormatting(markdown);
  } catch (error) {
    console.error("Error converting Markdoc to markdown:", error);
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
function renderToMarkdown(node: any): string {
  if (typeof node === "string") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(renderToMarkdown).join("");
  }

  if (!node || typeof node !== "object") {
    return "";
  }

  const { name, attributes, children } = node;

  // Handle different node types
  switch (name) {
    case "h1":
      return `# ${renderToMarkdown(children)}\n\n`;
    case "h2":
      return `## ${renderToMarkdown(children)}\n\n`;
    case "h3":
      return `### ${renderToMarkdown(children)}\n\n`;
    case "h4":
      return `#### ${renderToMarkdown(children)}\n\n`;
    case "h5":
      return `##### ${renderToMarkdown(children)}\n\n`;
    case "h6":
      return `###### ${renderToMarkdown(children)}\n\n`;
    case "p":
      return `${renderToMarkdown(children)}\n\n`;
    case "strong":
      return `**${renderToMarkdown(children)}**`;
    case "em":
      return `*${renderToMarkdown(children)}*`;
    case "code":
      return `\`${renderToMarkdown(children)}\``;
    case "pre":
      return `\`\`\`\n${renderToMarkdown(children)}\n\`\`\`\n\n`;
    case "a":
      return `[${renderToMarkdown(children)}](${attributes?.href || ""})`;
    case "ul":
      return `${renderToMarkdown(children)}\n`;
    case "ol":
      return `${renderToMarkdown(children)}\n`;
    case "li":
      return `- ${renderToMarkdown(children)}\n`;
    case "blockquote":
      return `> ${renderToMarkdown(children)}\n\n`;
    case "br":
      return "\n";
    case "hr":
      return "---\n\n";
    default:
      return renderToMarkdown(children);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get the post from Keystatic
    const post = await reader.collections.posts.read(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Process the content - convert Markdoc to markdown
    const contentResult = await post.content();
    const content = convertMarkdocToMarkdown(contentResult);

    // Format the response
    const formattedPost = {
      slug,
      title: post.title,
      publishedDate: post.publishedDate,
      postType: post.postType,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      featuredImagePosition: post.featuredImagePosition,
      featuredImageCrop: post.featuredImageCrop,
      additionalImages: post.additionalImages,
      content,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
