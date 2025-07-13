import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
import time
import json
import argparse

load_dotenv()

PLAYLIST_ID = os.getenv('PLAYLIST_ID')
SONGS = {}
SONGS_TO_ADD = []
CURRENT_SONG = None

def load_tunes():
    with open('tunes.json', 'r') as f:
        return json.load(f)

def write_to_tunes(tunes):
    with open('tunes.json', 'w') as f:
        json.dump(tunes, f, indent=2)

def get_songs_from_tunes(sp):
    global SONGS
    offset = 0
    limit = 100  # max 100 per request

    print(f"Getting songs...")
    
    while True:
        tracks_response = sp.playlist_tracks(PLAYLIST_ID, offset=offset, limit=limit)['items']
        
        tracks = {
            track['track']['id']: {
                'name': track['track']['name'], 
                'artist': track['track']['artists'][0]['name'], 
                'uri': track['track']['uri'], 
                'strikes': 0
                }
            for track in tracks_response
            if track['track'] is not None
            }
        
        SONGS = SONGS | tracks
        
        if not tracks:
            break
            
        offset += limit

    print(f"Length of SONGS: {len(SONGS)}")
    
    with open('tunes.json', 'w') as f:
        json.dump(SONGS, f, indent=2)
    
    print("Saved songs to tunes.json")

def poll_current_playing(sp, tunes):
    global CURRENT_SONG

    skipped = False
    while True:
        is_playing, id, name, artists, uri, progress_ms, duration_ms = print_current_playing(sp)
        song_status = 'NOT_PLAYING'

        if is_playing == 0x00:
            song_status = 'NOT_PLAYING'
            time.sleep(10)
            continue
        elif is_playing == 0x10:
            song_status = 'PAUSED'
        elif is_playing == 0x11:
            song_status = 'PLAYING'

        if song_status in ('PLAYING', 'PAUSED'):
            song = tunes.get(id, None)
            if song:
                if id != CURRENT_SONG:
                    print("NEW SONG!")
                    song['strikes'] += 1
                    skipped = False
                    CURRENT_SONG = id
                    write_to_tunes(tunes)

                if progress_ms >= 20 and not skipped:
                    song['strikes'] -= 1
                    skipped = True
                    write_to_tunes(tunes)
            else:
                print(f"❌ '{name}' by {artists} is NOT in your TUNES playlist")
            
        print(f"Song Status: {song_status}")
        print()

        time.sleep(5)

def print_current_playing(sp):
    # 0x00: NOT_PLAYING
    # 0x10: PAUSED
    # 0x11: PLAYING

    playback = sp.current_playback()

    if playback and playback['item']:
        track = playback['item']
        name = track['name']
        id = track['id']
        progress_ms = playback['progress_ms'] // 1000 if playback['progress_ms'] else 0
        duration_ms = track['duration_ms'] // 1000 if track['duration_ms'] else 0
        uri = track['uri']
        artists = ', '.join([artist['name'] for artist in track['artists']])
        is_playing = 0x11 if playback['is_playing'] else 0x10

        print(f"Currently Playing: {name} - {artists}") 
        print(f"ID: {id} ")
        print(f"Progress: {progress_ms}")
        print(f"Duration: {duration_ms}")
        print(f"URI: {uri}")
    else:
        print("No track is currently playing.\n")

        return 0x00, None, None, None, None, None, None

    return is_playing, id, name, artists, uri, progress_ms, duration_ms

def main():
    parser = argparse.ArgumentParser(description='Spotify Playlist Cleaner')
    parser.add_argument('--get', action='store_true', help='Fetch songs from playlist')
    args = parser.parse_args()

    scope = "user-top-read user-read-playback-state playlist-read-private playlist-read-collaborative"

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope))

    user = sp.current_user()
    print(f"Logged in as: {user['display_name']}")
    print("-" * 50)

    tunes = load_tunes()
    if args.get:
        get_songs_from_tunes(sp, tunes)

    poll_current_playing(sp, tunes)

if __name__ == "__main__":
    main()
