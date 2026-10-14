import React from 'react';

export function WorkshopCardSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
        >
          {/* Banner Skeleton (16:10 aspect ratio) */}
          <div className="w-full aspect-[16/10] bg-[#F5F5F5] relative">
            <div className="absolute top-3 left-3 w-20 h-5 bg-[#E8E8E8] rounded-full" />
            <div className="absolute top-3 right-3 w-16 h-5 bg-[#E8E8E8] rounded-full" />
          </div>

          {/* Content Skeleton */}
          <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
            <div className="space-y-3">
              <div className="h-4 w-3/4 bg-[#E8E8E8] rounded" />
              <div className="h-3 w-full bg-[#F0F0F0] rounded" />
              <div className="h-3 w-2/3 bg-[#F0F0F0] rounded" />
            </div>

            {/* Date & Time Skeleton */}
            <div className="space-y-2 pt-2 border-t border-[#E8E8E8]">
              <div className="h-3 w-1/2 bg-[#E8E8E8] rounded" />
              <div className="h-2 w-full bg-[#F0F0F0] rounded-full" />
            </div>

            {/* Bottom Buttons Skeleton */}
            <div className="pt-2 flex items-center gap-2">
              <div className="h-10 flex-1 bg-[#E8E8E8] rounded-xl" />
              <div className="h-10 w-24 bg-[#F0F0F0] rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function WorkshopListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E8E8E8] rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 animate-pulse"
        >
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-[#F0F0F0] shrink-0" />
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="h-3 w-24 bg-[#E8E8E8] rounded-full" />
              <div className="h-4 w-48 sm:w-72 bg-[#E8E8E8] rounded" />
              <div className="h-3 w-32 bg-[#F0F0F0] rounded" />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E8E8E8]">
            <div className="h-10 w-28 bg-[#F0F0F0] rounded-xl" />
            <div className="h-10 w-36 bg-[#E8E8E8] rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
