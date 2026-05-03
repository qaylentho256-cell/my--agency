"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react";

const ROOF_TYPES = ["Asphalt Shingle", "Metal", "Tile", "Flat/TPO", "Wood Shake", "Other"];
const DAMAGE_TYPES = ["Storm / Hail", "Wind", "Age / Wear", "Leak", "Fallen Tree", "Other"];

export default function LeadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"info" | "photos" | "sending" | "done">("info");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    homeownerName: "",
    homeownerEmail: "",
    homeownerPhone: "",
    address: "",
    roofType: "",
    damageType: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const lead = await res.json();
      if (!res.ok) throw new Error(lead.error ?? `Server error ${res.status}`);
      setLeadId(lead.id);
      setStep("photos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((p) => [...p, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  async function sendQuote() {
    if (!leadId) return;
    setStep("sending");
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("photos");
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold">Quote Sent!</h2>
        <p className="text-gray-600">
          {form.homeownerName} will receive their quote at {form.homeownerEmail} within seconds.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          View Dashboard
        </button>
        <button
          onClick={() => { setStep("info"); setPhotos([]); setLeadId(null); setForm({ homeownerName:"",homeownerEmail:"",homeownerPhone:"",address:"",roofType:"",damageType:"",notes:"" }); }}
          className="text-gray-500 underline text-sm"
        >
          Add another lead
        </button>
      </div>
    );
  }

  if (step === "sending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <h2 className="text-2xl font-bold">Analyzing roof & sending quote...</h2>
        <p className="text-gray-500">AI is reviewing your photos. This takes ~15 seconds.</p>
      </div>
    );
  }

  if (step === "photos") {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold">Upload Roof Photos</h2>
        <p className="text-gray-600">More photos = better estimate. Take shots of all damage areas.</p>

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
          onClick={() => fileRef.current?.click()}
        >
          <Camera className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Tap to take or upload photos</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p} alt={`photo-${i}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={sendQuote}
          disabled={photos.length === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload className="inline w-5 h-5 mr-2" />
          Analyze & Send Quote Now
        </button>

        <p className="text-xs text-gray-400 text-center">
          Quote will be emailed to {form.homeownerEmail} automatically
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submitInfo} className="max-w-lg mx-auto p-6 space-y-5">
      <h1 className="text-3xl font-bold">New Lead</h1>
      <p className="text-gray-500">Fill this in while you&apos;re on-site. Takes 60 seconds.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Homeowner Name</label>
          <input name="homeownerName" value={form.homeownerName} onChange={handleChange} required
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jane Smith" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="homeownerEmail" type="email" value={form.homeownerEmail} onChange={handleChange} required
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="jane@email.com" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="homeownerPhone" type="tel" value={form.homeownerPhone} onChange={handleChange} required
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(555) 000-0000" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Property Address</label>
          <input name="address" value={form.address} onChange={handleChange} required
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, Austin TX 78701" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Roof Type</label>
            <select name="roofType" value={form.roofType} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              {ROOF_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Damage Type</label>
            <select name="damageType" value={form.damageType} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              {DAMAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Anything else the AI should know..." />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg">
        Next: Add Photos →
      </button>
    </form>
  );
}
