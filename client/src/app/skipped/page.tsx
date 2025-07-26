'use client'

import { useEffect, useState } from "react";
import SkippedCard from "../components/SkippedCard";
import { getNowPlaying } from "../context/Polling";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Skipped() {
  const [skippedSongs, setSkippedSongs] = useState<{ [id: string]: { name: string, artist: string, uri: string, strikes: number, image: string } }>({});
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [action, setAction] = useState<(() => void) | null>(null);

  const currentPlaying = getNowPlaying();

  function removeFromPlaylist(): void {
    // TODO: Implement this
    console.log("Removing from playlist");
  }

  function clearSongs(): void {
    fetch(API_BASE + '/clear_skipped_songs')
      .then(res => res.json())
      .then(data => {
        console.log(data.message)
      });
  }

  function clearSkippedSongs(): void {
    setAction(() => clearSongs);
    setShowConfirmScreen(true);
  }

  function handleConfirm(button: 1 | 0) : void {
    if (button == 1 && action) {
      action();
    }
    setAction(null);
    setShowConfirmScreen(false);
  }
  
  useEffect(() => {
    fetch(API_BASE + '/refresh_skipped')
      .then(res => res.json())
      .then(data => {
        if (data.message != 1) {
          console.log(data.message)
        }
      });

    const fetchSkippedSongs = () => {
      fetch(API_BASE + '/skipped_songs')
        .then(res => res.json())
        .then(data => {
          setSkippedSongs(data.message)
        });
    }

    fetchSkippedSongs();

    const interval = setInterval(fetchSkippedSongs, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      {Object.entries(skippedSongs).length > 0 ? (
        Object.entries(skippedSongs)
          .sort(([, a], [, b]) => a.name.localeCompare(b.name))
          .map(([id, value]) => (
            <SkippedCard key={id} id={id} song={value} current={id === currentPlaying.id}/>
          ))
      ) : (
        <h1 className="text-2xl font-bold">No songs skipped</h1>
      )}
      {Object.entries(skippedSongs).length > 0 && (
        <div className="flex items-center justify-center gap-4 w-full md:w-128">
          <div className="flex flex-col items-center justify-center py-4 px-3 bg-green-500 rounded-lg w-full cursor-pointer hover:bg-green-600" onClick={removeFromPlaylist}>
            <h1 className="text-xs md:text-xl font-bold text-white">Remove from playlist</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-3 bg-red-500 rounded-lg w-full cursor-pointer hover:bg-red-600" onClick={clearSkippedSongs}>
            <h1 className="text-xs md:text-xl font-bold text-white">Clear skipped songs</h1>
          </div>
        </div>
      )}
      {showConfirmScreen && (
        <div className="bg-white fixed w-screen h-screen flex items-center justify-center top-0 left-0">
          <div className="flex flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-2xl font-bold">Are you sure?</h1>
          <div className="flex items-center justify-center gap-4 w-full md:w-128">
            <button className="flex flex-col items-center justify-center p-4 w-30 md:w-50 md:h-16 bg-green-500 rounded-lg cursor-pointer hover:bg-green-600" onClick={() => handleConfirm(1)}>Yes</button>
            <button className="flex flex-col items-center justify-center p-4 w-30 md:w-50 md:h-16 bg-red-500 rounded-lg cursor-pointer hover:bg-red-600" onClick={() => handleConfirm(0)}>No</button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}