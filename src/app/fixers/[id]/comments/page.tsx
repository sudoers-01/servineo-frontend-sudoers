'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useComments } from '@/app/components/hooks/useComments';

type FilterType = 'all' | 'positive' | 'negative';

export default function CommentsPage() {
  const params = useParams();
  const fixerId = params.id as string;
  const [filter, setFilter] = useState<FilterType>('all');
  const { data, loading, error } = useComments(fixerId, filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex gap-0.5'>
        {[1, 2, 3].map((star) => (
          <svg
            key={star}
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill={star <= rating ? '#FFA500' : 'none'}
            stroke='#FFA500'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Jobs Comments</h1>
          <div className='flex gap-2'>
            <button
              onClick={() => setFilter('positive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                filter === 'positive'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                filter === 'negative'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Negative
            </button>
          </div>
        </div>
        <div className='mb-4 flex gap-x-2 flex-row-reverse justify-between align-middle text-black'>
          {/* Here Heidy's DropDown will be implemented or idk */}
          <button
            onClick={() => alert('Otro equipo hace esta parte')}
            className='flex align-middle  gap-x-2 hover:bg-gray-200 h-full text-sm cursor-pointer rounded-3xl p-2 font-bold transition duration-150'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='15'
              height='15'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='my-auto lucide lucide-funnel-icon lucide-funnel'
            >
              <path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z' />
            </svg>
            <span className='leading-5'>Ordenar</span>
          </button>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className='hover:bg-gray-200  text-sm cursor-pointer rounded-3xl p-2 text-black font-bold flex gap-x-2 align-middle leading-5 transition duration-150'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-arrow-left-icon lucide-arrow-left'
              >
                <path d='m12 19-7-7 7-7' />
                <path d='M19 12H5' />
              </svg>
              Show all comments
            </button>
          )}
        </div>
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='40'
              height='40'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='animate-spin text-gray-600'
            >
              <path d='M21 12a9 9 0 1 1-6.219-8.56' />
            </svg>
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
            Error loading comments: {error}
          </div>
        ) : data.length === 0 ? (
          <div className='bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500'>
            No comments found
          </div>
        ) : (
          <div className='space-y-4'>
            {data.map((comment) => (
              <div
                key={comment._id}
                className='bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold text-gray-900 text-sm'>
                      {comment.requesterName} - {comment.title}
                    </h3>
                    <p className='text-xs text-gray-500 mt-1'>
                      Date: {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {renderStars(comment.rating)}
                </div>
                <p className='text-sm text-gray-700 leading-relaxed'>{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
