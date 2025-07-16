'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const searchParams = useSearchParams();
  const user = searchParams.get('user');

  const [currentPlaying, setCurrentPlaying] = useState({name: "", artists: "", image: ""});
  useEffect(() => {

    fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setCurrentPlaying({name: data.message.name, artists: data.message.artists[0].name, image: data.message.album.images[1].url})
        } else { 
          setCurrentPlaying({name: "", artists: "", image: ""})
        }
      });

    const interval = setInterval(() => {
      fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setCurrentPlaying({name: data.message.name, artists: data.message.artists[0].name, image: data.message.album.images[1].url})
        } else { 
          setCurrentPlaying({name: "", artists: "", image: ""})
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className='flex items-center justify-center h-screen'>
      <div className='flex flex-col items-center bg-green-400 rounded-lg p-6 transition-all duration-300'>
        <h1 className="text-3xl font-bold flex justify-center items-center pb-2">Currently Playing</h1>
        <p className='text-sm mb-4'><span className="underline">Username</span>: {user}</p>
        {currentPlaying.name !== "" && (
          <div className="w-full">
            <img src={currentPlaying.image} alt="Album Art" className='w-full h-full'/>
            <p className='text-xl font-bold'>{currentPlaying.name}</p>
            <p className='text-sm'>By: <span className='font-bold'>{currentPlaying.artists}</span></p>
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
