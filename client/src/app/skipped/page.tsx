'use client'

import { useEffect, useState } from "react";
import SkippedCard from "../components/SkippedCard";
import { getNowPlaying } from "../context/Polling";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Skipped() {
  const [skippedSongs, setSkippedSongs] = useState<{ [key: string]: { name: string, artist: string, uri: string, strikes: number, image: string } }>({});

  const currentPlaying = getNowPlaying();

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
          .map(([key, value]) => (
            <SkippedCard key={key} song={value} current={key === currentPlaying.id}/>
          ))
      ) : (
        <h1 className="text-2xl font-bold">No songs skipped</h1>
      )}
    </div>
  );
}