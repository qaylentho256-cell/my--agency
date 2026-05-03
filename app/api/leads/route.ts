import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { homeownerName, homeownerEmail, homeownerPhone, address, roofType, damageType, notes } = body;

  if (!homeownerName || !homeownerEmail || !homeownerPhone || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { homeownerName, homeownerEmail, homeownerPhone, address, roofType, damageType, notes },
  });

  return NextResponse.json(lead, { status: 201 });
}
