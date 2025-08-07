import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch from Keystatic Cloud API
    const response = await fetch(
      `https://api.keystatic.cloud/v1/projects/luka-adzic-portfolio/lukaadzic/collections/posts/${slug}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postData = await response.json();

    // Format the response to match our Post type
    const formattedPost = {
      slug,
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

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Error fetching post from Keystatic Cloud:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
