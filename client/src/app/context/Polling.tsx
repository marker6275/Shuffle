'use client'

import { useEffect, useState, useContext, createContext } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const playingStatus: { [key: string]: string } = {
    NOT_PLAYING: 'NOT PLAYING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED'
}

const NowPlayingContext = createContext({
    id: "",
    name: "",
    artists: "",
    image: "",
    status: playingStatus.NOT_PLAYING
  });

function setSong(data: any, setCurrentPlaying: any) {
    if (data.message) {
      const song = data.message
      const status = data.playing_status
      setCurrentPlaying({id: song.id, name: song.name, artists: song.artists[0].name, image: song.album.images[1].url, status: playingStatus[status]})
    } else { 
      const status = data.playing_status
      setCurrentPlaying({id: "", name: "", artists: "", image: "", status: playingStatus[status]})
    }
}

export function NowPlayingProvider({children}: {children: any}) {
    const [currentPlaying, setCurrentPlaying] = useState({id: "", name: "", artists: "", image: "", status: playingStatus.NOT_PLAYING});

    useEffect(() => {
        const fetchNowPlaying = () => {
          fetch(API_BASE + '/current_playing')
          .then(res => res.json())
          .then(data => {
              setSong(data, setCurrentPlaying);
          });
        }

        fetchNowPlaying();

        const playingInterval = setInterval(fetchNowPlaying, 5000);
      
        const notPlayingInterval = setInterval(fetchNowPlaying, 10000);
      
        return () => {currentPlaying.status === playingStatus.NOT_PLAYING ? clearInterval(notPlayingInterval) : clearInterval(playingInterval)};
      }, []);

      return (
        <NowPlayingContext.Provider value={currentPlaying}>
            {children}
        </NowPlayingContext.Provider>
      )
}

export function getNowPlaying() {
    return useContext(NowPlayingContext);
  }