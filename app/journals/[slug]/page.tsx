import fs from "node:fs";
import path from "node:path";
import { createReader } from "@keystatic/core/reader";
import { notFound } from "next/navigation";
import keystaticConfig from "../../../keystatic.config";
import PostClient from "./post-client";

const reader = createReader(process.cwd(), keystaticConfig);

type Post = {
	slug: string;
	title: string;
	publishedDate: string | null;
	postType: "post" | "take";
	excerpt: string;
	featuredImage?: string | null;
	featuredImagePosition?: string;
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

// Helper function to extract text from Markdoc AST
function extractTextFromMarkdoc(content: unknown): string {
	if (typeof content === "string") {
		return content;
	}

	if (Array.isArray(content)) {
		return content.map(extractTextFromMarkdoc).join("");
	}

	if (content && typeof content === "object") {
		// Handle Markdoc Node objects (with $mdtype)
		const node = content as {
			$mdtype?: string;
			attributes?: { content?: unknown };
			children?: unknown[];
			text?: string;
			value?: string;
			[key: string]: unknown;
		};
		// Handle Markdoc Node objects (with $mdtype)
		if (node.$mdtype === "Node") {
			// Handle text nodes
			if (node.type === "text") {
				return String(
					node.attributes?.content ||
						node.value ||
						node.text ||
						node.content ||
						"",
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
					return `${extractTextFromMarkdoc(node.children)}\n\n`;
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
				return `${extractTextFromMarkdoc(node.children)}\n\n`;
			}

			// Handle list nodes
			if (node.type === "list" && node.children) {
				return `${extractTextFromMarkdoc(node.children)}\n`;
			}

			// Handle list item nodes
			if (node.type === "item" && node.children) {
				return `• ${extractTextFromMarkdoc(node.children)}\n`;
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
			return String(node.text || node.value || "");
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

async function getPost(slug: string): Promise<Post | null> {
	try {
		// Use Keystatic reader directly instead of API route
		const post = await reader.collections.posts.read(slug);

		if (!post) {
			return null;
		}

		// Read the content directly from the file since Keystatic Cloud returns complex objects
		let cleanContent = "";

		try {
			const contentPath = path.join(
				process.cwd(),
				"public",
				"content",
				"posts",
				`${slug}.mdoc`,
			);
			const rawContent = fs.readFileSync(contentPath, "utf8");

			// Extract content after the frontmatter (after the second ---)
			// More flexible regex to handle different line endings
			const contentMatch = rawContent.match(
				/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/,
			);
			let markdownContent = contentMatch ? contentMatch[1].trim() : "";

			// If the first regex doesn't work, try a simpler approach
			if (!markdownContent) {
				const parts = rawContent.split(/\r?\n---\r?\n/);
				if (parts.length >= 2) {
					markdownContent = parts[1].trim();
				}
			}

			// If still no content, try splitting on just "---"
			if (!markdownContent) {
				const sections = rawContent.split("---");
				if (sections.length >= 3) {
					markdownContent = sections[2].trim();
				}
			}

			// If still no content, try a different approach - look for the closing ---
			if (!markdownContent) {
				const lines = rawContent.split("\n");
				let foundSecondDash = false;
				let contentLines: string[] = [];

				for (let i = 0; i < lines.length; i++) {
					if (lines[i].trim() === "---") {
						if (foundSecondDash) {
							// Start collecting content after the second ---
							contentLines = lines.slice(i + 1);
							break;
						} else {
							foundSecondDash = true;
						}
					}
				}

				if (contentLines.length > 0) {
					markdownContent = contentLines.join("\n").trim();
				}
			}

			// Clean up the content - replace backslashes at end of lines with proper line breaks
			cleanContent = markdownContent.replace(/\\\s*$/gm, "  "); // Two spaces for markdown line breaks
		} catch {
			// Fallback to Keystatic content extraction
			try {
				const content = await post.content();

				if (typeof content === "string") {
					cleanContent = content;
				} else if (content) {
					cleanContent = extractTextFromMarkdoc(content);
				}
			} catch {}
		}

		// Generate excerpt if not provided
		const excerpt =
			post.excerpt ||
			(cleanContent ? `${cleanContent.substring(0, 200)}...` : "");

		return {
			slug,
			title: post.title || "",
			publishedDate: post.publishedDate || null,
			postType: post.postType || "post",
			excerpt,
			featuredImage: post.featuredImage || null,
			featuredImagePosition: post.featuredImagePosition || "",
			featuredImageCrop: {
				x: post.featuredImageCrop?.x ?? 50,
				y: post.featuredImageCrop?.y ?? 50,
			},
			additionalImages: (post.additionalImages || []).map(
				(img: { image: string | null; alt: string }) => ({
					image: img.image || "",
					alt: img.alt,
				}),
			),
			content: cleanContent,
		};
	} catch {
		return null;
	}
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	return <PostClient post={post} />;
}

// Generate static params for all posts
export async function generateStaticParams() {
	try {
		const allPosts = await reader.collections.posts.all();
		return allPosts.map((post) => ({
			slug: post.slug,
		}));
	} catch {
		return [];
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	return {
		title: `${post.title} | Luka Adzic`,
		description: post.excerpt,
	};
}
