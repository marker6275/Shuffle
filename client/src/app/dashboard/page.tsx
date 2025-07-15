'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE = process.env.API_URL;

export default function Dashboard() {
  const searchParams = useSearchParams();
  const user = searchParams.get('user');

  const [currentPlaying, setCurrentPlaying] = useState(null);

  useEffect(() => {
    fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => setCurrentPlaying(data.message));
  }, []);

  return (
    <main className='flex items-center justify-center h-screen'>
      <div className='flex flex-col items-center bg-green-400 rounded-lg p-4 h-1/2'>
        <h1 className="text-3xl font-bold flex justify-center items-center pb-2">Currently Playing</h1>
        <p className='text-sm'><span className="underline">Username</span>: {user}</p>
        <p>{currentPlaying}</p>
      </div>
    </main>
  );
}
