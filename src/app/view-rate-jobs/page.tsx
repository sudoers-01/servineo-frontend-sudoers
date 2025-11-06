import { mockRatedJobs } from './utils';
import { RatedJobsList } from './components';

export default function RatedJobsPage() {
  return (
    <main
      className="max-w-3xl mx-auto p-6 space-y-6"
      style={{ color: 'var(--foreground)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Rated Jobs List
        </h1>

        <a
          href=".."
          className="text-sm px-3 py-1.5 border rounded-lg transition-colors hover:bg-white/60"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          Back
        </a>
      </header>

      {/* Listado visual con mock data */}
      <RatedJobsList jobs={mockRatedJobs} />
    </main>
  );
}  
