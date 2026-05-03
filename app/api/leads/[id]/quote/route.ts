import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeRoofPhotos, generateQuoteEmail } from "@/lib/ai";
import { sendQuoteEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { photos } = await req.json(); // array of base64 strings

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  try {
    // 1. AI analysis
    const analysis = await analyzeRoofPhotos(
      photos ?? [],
      lead.notes ?? "",
      lead.roofType ?? ""
    );

    // 2. Generate email copy
    const companyName = process.env.NEXT_PUBLIC_APP_NAME ?? "Your Roofing Company";
    const emailContent = await generateQuoteEmail(analysis, lead.homeownerName, lead.address, companyName);

    // 3. Send email
    await sendQuoteEmail({
      to: lead.homeownerEmail,
      subject: emailContent.subject,
      body: emailContent.body,
    });

    // 4. Save to DB
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        aiAnalysis: JSON.stringify(analysis),
        squareFootage: analysis.squareFootage,
        quoteAmount: (analysis.estimatedCost.low + analysis.estimatedCost.high) / 2,
        quoteDetails: emailContent.body,
        quoteSentAt: new Date(),
        quoteStatus: "sent",
        photoUrls: JSON.stringify(photos ?? []),
      },
    });

    return NextResponse.json({ lead: updated, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[quote]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
