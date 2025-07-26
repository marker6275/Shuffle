'use client'

import { useEffect, useState } from "react";
import SkippedCard from "../components/SkippedCard";
import { getNowPlaying } from "../context/Polling";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Skipped() {
  const [skippedSongs, setSkippedSongs] = useState<{ [id: string]: { name: string, artist: string, uri: string, strikes: number, image: string } }>({});

  const currentPlaying = getNowPlaying();

  function removeFromPlaylist(): void {
    console.log("Removing from playlist");
  }

  function clearSkippedSongs(): void {
    console.log("Clearing skipped songs");
    fetch(API_BASE + '/clear_skipped_songs')
      .then(res => res.json())
      .then(data => {
        console.log(data.message)
      });
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
          <div className="flex flex-col items-center justify-center py-4 px-3 bg-red-500 rounded-lg w-full cursor-pointer" onClick={clearSkippedSongs}>
            <h1 className="text-xs md:text-xl font-bold text-white">Clear skipped songs</h1>
          </div>
        </div>
      )}
    </div>
  );
}