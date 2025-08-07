import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await params; // Use params to avoid unused variable warning

  // For now, return 404 since we need to implement cloud storage access
  return NextResponse.json(
    { error: "Post not found - cloud storage not yet implemented" },
    { status: 404 }
  );
}
