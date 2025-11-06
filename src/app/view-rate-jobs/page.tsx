import { mockRatedJobs } from './utils';
import { RatedJobsList } from './components';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function RatedJobsPage() {
  return (
    <main className={`min-h-screen bg-white text-gray-900 ${roboto.className}`}>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Rated Jobs List</h1>

          <a
            href=".."
            className="text-sm px-3 py-1.5 border rounded-lg transition-colors hover:bg-gray-50 border-gray-200 text-gray-700"
          >
            Back
          </a>
        </header>

        {/* Listado visual con mock data */}
        <RatedJobsList jobs={mockRatedJobs} />
      </div>
    </main>
  );
}
