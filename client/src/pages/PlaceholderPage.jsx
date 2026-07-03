import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[75vh] bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="bg-indigo-50 p-4 rounded-full mb-6">
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {title}</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        The routing and architecture for this module are set up. We will implement the frontend forms and backend database connections for this section when you are ready.
      </p>
      <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Ready for Backend Integration
      </div>
    </div>
  );
}