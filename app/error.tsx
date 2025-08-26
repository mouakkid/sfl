'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body className="p-6">
        <h2 className="text-red-600 font-semibold mb-2">Une erreur est survenue côté client</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{String(error?.message || error)}</pre>
        <button onClick={() => reset()} className="mt-4 border rounded px-3 py-1">Recharger</button>
      </body>
    </html>
  )
}
