"use client"; // Required for components with useEffect and event listeners

import React from 'react';
import PhaserGame from '@/components/PhaserGame'; // Using the import alias @

export default function HomePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>My Phaser Game in Next.js</h1>
      <PhaserGame />
      <p style={{ marginTop: '20px' }}>This page is a JavaScript React component (.jsx).</p>
      <p>The Phaser game itself is a TypeScript component (.tsx).</p>
    </main>
  );
}
