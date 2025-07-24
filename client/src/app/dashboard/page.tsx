'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNowPlaying } from '../context/Polling';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(searchParams.get('user'));

  useEffect(() => {
    const storedUser = window.localStorage.getItem('user');

    if (storedUser === null || (user !== storedUser && user !== null)) {
      localStorage.setItem('user', user ?? '');
    }

    setUser(storedUser);
  }, [user]);

  const currentPlaying = getNowPlaying();

  return (
    <main className='flex items-center justify-center py-12'>
      <div className='flex flex-col items-center bg-green-400 rounded-lg p-6 transition-all duration-300 max-w-84 md:max-w-96'>
        <h1 className="text-3xl font-bold flex justify-center items-center mb-2">Currently Playing</h1>
        <hr className='w-full mb-2'/>
        <div className="flex w-full justify-between items-center">
          <p className='text-sm mb-2'><span className="underline">Username</span>: {user}</p>
          <p className='font-semibold mb-2'>{currentPlaying.status}</p>
        </div>
        {currentPlaying.name !== "" && (
          <div className="w-full flex flex-col items-center">
            <img src={currentPlaying.image} alt="Album Art" className='w-full h-full'/>
            <p className='text-xl font-bold text-left w-full'>{currentPlaying.name}</p>
            <p className='text-sm text-left w-full'>By: <span className='font-bold'>{currentPlaying.artists}</span></p>
          </div>
        )}
        {currentPlaying.name === "" && (
          <div className="w-full flex justify-center items-center">
            <p className='text-2xl font-bold border-2 border-white rounded-sm p-4'>Nothing is playing</p>
          </div>
        )}
      </div>
    </main>
  );
}
