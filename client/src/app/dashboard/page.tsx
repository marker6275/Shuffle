"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getNowPlaying } from "../context/Polling";
import CurrentlyPlaying from "../components/CurrentlyPlaying";
import Queue from "../components/Queue";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(searchParams.get("user"));

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user");

    if (storedUser === null || (user !== storedUser && user !== null)) {
      localStorage.setItem("user", user ?? "");
    }

    setUser(storedUser);
  }, []);

  const currentPlaying = getNowPlaying();

  return (
    <main className="w-full flex items-center justify-center py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20 h-120 md:h-132">
        <CurrentlyPlaying user={user} currentPlaying={currentPlaying} />

        <Queue queueData={currentPlaying.queue} />

        <div className="flex flex-col items-center bg-blue-200 rounded-lg p-6 w-84 md:w-96">
          Recommended
        </div>
      </div>
    </main>
  );
}
