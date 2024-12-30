import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { paths } = await req.json();

    // Check if paths is an array and has at least one path
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "Paths is required and must be a non-empty array." },
        { status: 400 }
      );
    }

    // Trigger revalidation for each path
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      message: `Revalidation triggered for ${paths.length} path(s)`,
    });
  } catch (error) {
    console.error("Error during revalidation:", error);
    return NextResponse.json(
      { error: "Failed to trigger revalidation" },
      { status: 500 }
    );
  }
}
