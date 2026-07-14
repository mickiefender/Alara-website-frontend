'use client';

import React from 'react';

const Loader = () => {
  return (
    <div
      className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-red-600 dark:border-white/15 dark:border-t-red-500"
      role="status"
      aria-label="Loading"
    />
  );
}

export default Loader;
