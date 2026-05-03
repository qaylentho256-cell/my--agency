import Link from "next/link";

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "RoofRapid";
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="text-center text-white space-y-6 max-w-md">
        <h1 className="text-5xl font-extrabold">{appName}</h1>
        <p className="text-xl text-blue-100">
          Send professional roofing quotes in minutes — right from the job site.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Link href="/new-lead"
            className="bg-white text-blue-700 font-bold py-4 px-8 rounded-xl text-lg hover:bg-blue-50 transition">
            + New Lead
          </Link>
          <Link href="/dashboard"
            className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl text-lg hover:bg-blue-700 transition">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
