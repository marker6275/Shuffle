"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const playingStatus: { [key: string]: string } = {
  NOT_PLAYING: "NOT PLAYING",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
};

export async function fetchNowPlaying() {
  try {
    const res = await fetch(API_BASE + "/current_playing");
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching current playing:", error);
    throw error;
  }
}

export async function fetchQueue() {
  try {
    const res = await fetch(API_BASE + "/queue");
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching queue:", error);
    throw error;
  }
}
