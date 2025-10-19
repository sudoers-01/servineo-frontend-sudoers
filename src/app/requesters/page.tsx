import Link from 'next/link';

export default function RequestersLanding() {
  return (
    <main className='min-h-screen bg-white flex items-center justify-center'>
      <div className='text-center space-y-8'>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-900'>Requesters</h1>
        <div className='flex items-center justify-center gap-4'>
          <Link
            href='/completed-jobs'
            className='px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition'
          >
            View Completed Jobs
          </Link>
          <Link
            href='/profile/68ec99ddf39c7c140f42fcfa'
            className='px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition'
          >
            View Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
