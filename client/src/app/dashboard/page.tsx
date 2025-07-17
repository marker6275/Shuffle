'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const playingStatus: { [key: string]: string } = {
  NOT_PLAYING: 'NOT PLAYING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED'
}

function setSong(data: any, setCurrentPlaying: any) {
  if (data.message) {
    const song = data.message
    const status = data.playing_status
    setCurrentPlaying({name: song.name, artists: song.artists[0].name, image: song.album.images[1].url, status: playingStatus[status]})
  } else { 
    const status = data.playing_status
    console.log(status);
    setCurrentPlaying({name: "", artists: "", image: "", status: playingStatus[status]})
  }
}

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

  const [currentPlaying, setCurrentPlaying] = useState({name: "", artists: "", image: "", status: playingStatus.NOT_PLAYING});

  useEffect(() => {
    fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => {
        setSong(data, setCurrentPlaying)
      });

    const playingInterval = setInterval(() => {
      fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => {
        setSong(data, setCurrentPlaying)
      });
    }, 5000);

    const notPlayingInterval = setInterval(() => {
      fetch(API_BASE + '/current_playing')
      .then(res => res.json())
      .then(data => {
        setSong(data, setCurrentPlaying)
      });
    }, 10000);

    return () => {currentPlaying.status === playingStatus.NOT_PLAYING ? clearInterval(notPlayingInterval) : clearInterval(playingInterval)};
  }, []);

  return (
    <main className='flex items-center justify-center h-screen'>
      <div className='flex flex-col items-center bg-green-400 rounded-lg p-6 transition-all duration-300'>
        <h1 className="text-3xl font-bold flex justify-center items-center pb-2">Currently Playing</h1>
        <p className='text-sm mb-4'><span className="underline">Username</span>: {user}</p>
        <p className='font-semibold mb-4'>{currentPlaying.status}</p>
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
