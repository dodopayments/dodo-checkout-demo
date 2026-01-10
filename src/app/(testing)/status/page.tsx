"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function StatusPageContent() {
  const searchParams = useSearchParams();
  
  // Get all query parameters
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const hasParams = Object.keys(params).length > 0;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment Status</h1>
        
        {hasParams ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Query Parameters</h2>
            <div className="space-y-3">
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="border-b pb-3 last:border-b-0">
                  <div className="font-medium text-gray-700 mb-1">{key}</div>
                  <div className="text-gray-900 break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">No query parameters present in the URL.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Payment Status</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <StatusPageContent />
    </Suspense>
  );
}
