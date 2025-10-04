import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Date Planner
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
          Plan, organize, and enjoy perfect dates with your special someone
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/login" className="btn btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link href="/about" className="btn btn-outline text-lg px-8 py-3">
            Learn More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="card p-6">
            <div className="text-3xl mb-4">🗓️</div>
            <h3 className="text-xl font-semibold mb-2">Create Circles</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Form groups with your partner, friends, or family to plan and share special events.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Set Checkpoints</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create a series of locations and objectives that unfold during your date.
            </p>
          </div>
          
          <div className="card p-6">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-2">Share Location</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Safely share your location in real-time with your circle during active events.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
