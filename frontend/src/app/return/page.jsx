"use client"; // Can often be removed from the page if the dynamic component handles client-side logic

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PhaserGame component with SSR turned off
const PhaserGameNoSSR = dynamic(
  () => import('@/app/components/PhaserGame'), // Path to your Phaser game component
  {
    ssr: false, // This is crucial
    loading: () => <p style={{ textAlign: 'center' }}>Loading Game...</p> // Optional loading indicator
  }
);

export default function GamePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>My Phaser Game in Next.js</h1>
      <PhaserGameNoSSR />
      <p style={{ marginTop: '20px' }}>This page is a JavaScript React component (.jsx).</p>
      <p>The Phaser game itself is a TypeScript component (.tsx), now loaded dynamically.</p>
    </main>
  );
}
