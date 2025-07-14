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
SONGS_TO_ADD = {}
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

def add_song(id, name, artists, uri):
    global SONGS_TO_ADD, CURRENT_SONG

    print("Song not in playlist")
    CURRENT_SONG = id

    SONGS_TO_ADD[id] = {
        'name': name,
        'artist': artists,
        'uri': uri,
        'strikes': 0
    }

def add_strike(song, tunes, id):
    global CURRENT_SONG
    song['strikes'] += 1
    CURRENT_SONG = id
    write_to_tunes(tunes)

def remove_strike(song, tunes):
    song['strikes'] -= 1
    write_to_tunes(tunes)

def update_strikes(id, song, tunes, progress, skipped):
    global CURRENT_SONG
    if id != CURRENT_SONG:
        add_strike(song, tunes, id)
        return True

    if progress > 20 and skipped:
        remove_strike(song, tunes)
        return False

    return skipped

def poll_current_playing(sp, tunes, display=False):
    global CURRENT_SONG

    skipped = True
    while True:
        is_playing, id, name, artists, uri, progress, _ = get_current_playing(sp, display)
        song_status = 'NOT_PLAYING'

        if is_playing == 0x00:
            song_status = 'NOT_PLAYING'
            time.sleep(10)
            continue
        elif is_playing == 0x10 or is_playing == 0x11:
            song_status = 'PLAYING' if is_playing == 0x11 else 'PAUSED'
            song = tunes.get(id, None)
            if song:
                skipped = update_strikes(id, song, tunes, progress, skipped)
            else:
                add_song(id, name, artists, uri)
        
        print(f"Song Status: {song_status}")
        print()

        time.sleep(5)

def parse_playing(playback):

    if not playback:
         return 0x00, None, None, None, None, None, None

    track = playback['item']
    name = track['name']
    id = track['id']
    progress = playback['progress_ms'] // 1000 if playback['progress_ms'] else 0
    duration = track['duration_ms'] // 1000 if track['duration_ms'] else 0
    uri = track['uri']
    artists = ', '.join([artist['name'] for artist in track['artists']])
    is_playing = 0x11 if playback['is_playing'] else 0x10

    return is_playing, id, name, artists, uri, progress, duration

def handle_verbose(playback):
    if not playback:
        return None
    
    return playback

def print_song(id, name, artists, uri, progress, duration):
    print(f"Currently Playing: {name} - {artists}")
    print(f"ID: {id} ")
    print(f"Progress: {progress} / {duration} ")
    print(f"URI: {uri}")

def get_current_playing(sp, display=False, verbose=False):
    # 0x00: NOT_PLAYING
    # 0x10: PAUSED
    # 0x11: PLAYING

    playback = sp.current_playback()

    if verbose:
        playback_verbose = handle_verbose(playback)
        return playback_verbose

    if playback and playback['item']:
        is_playing, id, name, artists, uri, progress, duration = parse_playing(playback)

        if display:
            print_song(id, name, artists, uri, progress, duration)
    else:
        print("No track is currently playing.\n")

        return 0x00, None, None, None, None, None, None

    return is_playing, id, name, artists, uri, progress, duration

def main():
    parser = argparse.ArgumentParser(description='Spotify Playlist Cleaner')
    parser.add_argument('--get', action='store_true', help='Fetch songs from playlist')
    parser.add_argument('--print', action='store_true', help='Print current playing')
    args = parser.parse_args()

    scope = "user-top-read user-read-playback-state playlist-read-private playlist-read-collaborative"

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope))

    user = sp.current_user()
    print(f"Logged in as: {user['display_name']}")
    print("-" * 50)

    tunes = load_tunes()
    if args.get:
        get_songs_from_tunes(sp, tunes)

    poll_current_playing(sp, tunes, args.print)

if __name__ == "__main__":
    main()
