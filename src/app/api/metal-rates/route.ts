import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET latest rate
export async function GET() {
  const latest = await prisma.metalRate.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(latest || {});
}

// POST to save/update rates
export async function POST(req: Request) {
  const data = await req.json();

  const newRate = await prisma.metalRate.create({
    data: {
      karat24: data.karat24,
      karat22: data.karat22,
      karat18: data.karat18,
      silverRate: data.silverRate,
    },
  });

  return NextResponse.json(newRate);
}
