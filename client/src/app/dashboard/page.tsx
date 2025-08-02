"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchNowPlaying, fetchQueue } from "../context/Polling";
import CurrentlyPlaying from "../components/CurrentlyPlaying";
import Queue from "../components/Queue";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(searchParams.get("user"));
  const [currentPlaying, setCurrentPlaying] = useState({
    id: "",
    name: "",
    artists: "",
    image: "",
    status: "NOT PLAYING",
  });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingPlaying, setRefreshingPlaying] = useState(false);
  const [refreshingQueue, setRefreshingQueue] = useState(false);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user");

    if (storedUser === null || (user !== storedUser && user !== null)) {
      localStorage.setItem("user", user ?? "");
    }

    setUser(storedUser);
  }, [user]);

  // Fetch data once on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [playingData, queueData] = await Promise.all([
          fetchNowPlaying(),
          fetchQueue(),
        ]);

        if (playingData.message) {
          const song = playingData.message;
          setCurrentPlaying({
            id: song.id,
            name: song.name,
            artists: song.artists[0].name,
            image: song.album.images[1].url,
            status: playingData.playing_status || "NOT PLAYING",
          });
        } else {
          setCurrentPlaying((prev) => ({
            ...prev,
            status: playingData.playing_status || "NOT PLAYING",
          }));
        }

        // Process queue data
        setQueue(Array.isArray(queueData.message) ? queueData.message : []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manual refresh handlers
  const onSongRefresh = async () => {
    setRefreshingPlaying(true);
    try {
      const playingData = await fetchNowPlaying();

      if (playingData.message) {
        const song = playingData.message;
        setCurrentPlaying({
          id: song.id,
          name: song.name,
          artists: song.artists[0].name,
          image: song.album.images[1].url,
          status: playingData.playing_status || "NOT PLAYING",
        });
      } else {
        setCurrentPlaying((prev) => ({
          ...prev,
          status: playingData.playing_status || "NOT PLAYING",
        }));
      }
    } catch (error) {
      console.error("Failed to refresh current playing:", error);
    } finally {
      setRefreshingPlaying(false);
    }
  };

  const onQueueRefresh = async () => {
    setRefreshingQueue(true);
    try {
      const queueData = await fetchQueue();
      setQueue(Array.isArray(queueData.message) ? queueData.message : []);
    } catch (error) {
      console.error("Failed to refresh queue:", error);
    } finally {
      setRefreshingQueue(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full flex items-center justify-center py-12">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="w-full flex items-center justify-center py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20 h-120 md:h-132">
        <CurrentlyPlaying
          user={user}
          currentPlaying={currentPlaying}
          onRefresh={onSongRefresh}
          isRefreshing={refreshingPlaying}
        />

        <Queue
          queue={queue}
          onRefresh={onQueueRefresh}
          isRefreshing={refreshingQueue}
        />

        <div className="flex flex-col items-center bg-blue-200 rounded-lg p-6 w-84 md:w-96">
          Recommended
        </div>
      </div>
    </main>
  );
}
