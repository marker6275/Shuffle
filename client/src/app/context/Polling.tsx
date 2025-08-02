"use client";

import { useEffect, useState, useContext, createContext } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const playingStatus: { [key: string]: string } = {
  NOT_PLAYING: "NOT PLAYING",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
};

const NowPlayingContext = createContext({
  id: "",
  name: "",
  artists: "",
  image: "",
  status: playingStatus.NOT_PLAYING,
  queue: {},
});

function updatePollData(songData: any, setPollData: any) {
  setPollData((prev: any) => {
    const song = songData.message;
    const status = songData.playing_status;
    return {
      ...prev,
      id: song ? song.id : "",
      name: song ? song.name : "",
      artists: song ? song.artists[0].name : "",
      image: song ? song.album.images[1].url : "",
      status: playingStatus[status],
    };
  });
}

export function NowPlayingProvider({ children }: { children: any }) {
  const [pollData, setPollData] = useState({
    id: "",
    name: "",
    artists: "",
    image: "",
    status: playingStatus.NOT_PLAYING,
    queue: {},
  });

  const [intervalTime, setIntervalTime] = useState(10000);

  useEffect(() => {
    const fetchNowPlaying = () => {
      fetch(API_BASE + "/current_playing")
        .then((res) => res.json())
        .then((data) => {
          updatePollData(data, setPollData);
          setIntervalTime(
            data.playing_status === playingStatus.NOT_PLAYING ? 10000 : 5000
          );
        });
    };

    fetchNowPlaying();

    const interval = setInterval(fetchNowPlaying, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [intervalTime]);

  useEffect(() => {
    const fetchQueue = () => {
      console.log("fetching queue");
      fetch(API_BASE + "/queue")
        .then((res) => res.json())
        .then((data) => {
          setPollData((prev) => ({
            ...prev,
            queue: data.message,
          }));
        });
    };

    fetchQueue();
  }, [pollData.id]);

  return (
    <NowPlayingContext.Provider value={pollData}>
      {children}
    </NowPlayingContext.Provider>
  );
}

export function getNowPlaying() {
  return useContext(NowPlayingContext);
}
