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
  // Temporary hardcoded posts until we implement proper Keystatic Cloud integration
  return [
    {
      slug: "greek-shipowners-dominate-the-maritime-world-and-it-s-not-even-close",
      title:
        "Greek Shipowners Dominate the Maritime World...And It's Not Even Close",
      publishedDate: "2025-01-27",
      postType: "post" as const,
      excerpt:
        "This month, I had the chance to hop on a few calls with Greek shipowners, and it became crystal clear why Greece remains the world's leading shipowning nation.",
      featuredImage:
        "/images/posts/greek-shipowners-dominate-the-maritime-world-and-it-s-not-even-close/featuredImage.jfif",
      featuredImageCrop: { x: 50, y: 50 },
      additionalImages: [
        {
          image:
            "/images/posts/greek-shipowners-dominate-the-maritime-world-and-it-s-not-even-close/additionalImages/0/image.jfif",
          alt: "greek flag",
        },
      ],
      content:
        "This month, I had the chance to hop on a few calls with Greek shipowners, and it became crystal clear why Greece remains the world's leading shipowning nation.\n\nThe secret? Hands-on leadership.\n\nIn every conversation, one thing stood out: the owner or founder isn't just a name on the board. They're the beating heart of their companies:\n\n✔ First in the office, last to leave.\n✔ Watching, engaging, and driving excellence.\n✔ Recognizing and rewarding the talent that goes the extra mile.\n\nIt's a reminder for all leaders, no matter the industry: Leadership isn't just about vision; it's about being present. By staying involved, you build a culture of accountability, reward excellence, and set a standard that inspires others to follow.\n\nGreece leading the maritime world isn't luck...it's leadership done right.",
    },
  ];
}

export default async function Journals() {
  const posts = await getPosts();
  return <JournalsClient posts={posts} />;
}
