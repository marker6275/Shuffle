'use client'

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function convertToList(songs: any) {

}

export default function Skipped() {
  const [skippedSongs, setSkippedSongs] = useState<{ [key: string]: { name: string, artist: string, uri: string, strikes: number } }>({});

  useEffect(() => {
    fetch(API_BASE + '/skipped_songs')
      .then(res => res.json())
      .then(data => {
        setSkippedSongs(data.message)
      });
  }, []);

  return (
    <div>
      {Object.entries(skippedSongs).map(([key, value]) => (
        <div key={key}>
          <h1>{value.name} - {value.artist}</h1>
        </div>
      ))}
    </div>
  );
}