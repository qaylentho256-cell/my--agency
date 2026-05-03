import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

export default async function Dashboard() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const stats = {
    total: leads.length,
    sent: leads.filter((l) => l.quoteStatus !== "pending").length,
    accepted: leads.filter((l) => l.quoteStatus === "accepted").length,
    revenue: leads
      .filter((l) => l.quoteStatus === "accepted" && l.quoteAmount)
      .reduce((sum, l) => sum + (l.quoteAmount ?? 0), 0),
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/new-lead"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold">
          <Plus className="w-4 h-4" /> New Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Leads", value: stats.total },
          { label: "Quotes Sent", value: stats.sent },
          { label: "Accepted", value: stats.accepted },
          { label: "Pipeline $", value: `$${stats.revenue.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leads list */}
      {leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No leads yet.</p>
          <Link href="/new-lead" className="text-blue-600 underline mt-2 inline-block">Add your first lead →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const analysis = lead.aiAnalysis ? JSON.parse(lead.aiAnalysis) : null;
            return (
              <div key={lead.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{lead.homeownerName}</p>
                    <p className="text-sm text-gray-500">{lead.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.quoteStatus] ?? ""}`}>
                    {lead.quoteStatus}
                  </span>
                </div>

                {lead.quoteAmount && (
                  <p className="text-sm font-medium text-green-700">
                    Quote: ${lead.quoteAmount.toLocaleString()}
                  </p>
                )}

                {analysis && (
                  <p className="text-xs text-gray-500">
                    {analysis.damageDescription}
                  </p>
                )}

                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{lead.roofType}</span>
                  {lead.damageType && <span>· {lead.damageType}</span>}
                  <span>· {new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
