"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <button
            onClick={unstable_retry}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
