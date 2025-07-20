'use client'

import { useEffect, useState } from "react";
import SkippedCard from "../components/SkippedCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Skipped() {
  const [skippedSongs, setSkippedSongs] = useState<{ [key: string]: { name: string, artist: string, uri: string, strikes: number, image: string } }>({});

  useEffect(() => {
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
      {Object.entries(skippedSongs).map(([key, value]) => (
          <SkippedCard key={key} song={value}/>
      ))}
    </div>
  );
}