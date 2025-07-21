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
SKIPPED_SONGS = {}
SONGS_TO_ADD = {}
CURRENT_SONG = None
SKIPPED = True
SONG_STATUS = 'NOT_PLAYING'

REDIRECT_URL = os.getenv('REDIRECT_URI')

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
                'strikes': 0,
                'image': track['track']['album']['images'][1]['url']
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
    song['strikes'] = max(0, song['strikes'] - 1)
    write_to_tunes(tunes)

def validate_skipped_songs(skipped_songs):
    tunes = load_tunes()

    for song in list(skipped_songs.keys()):
        if song not in tunes or tunes[song]['strikes'] <= 0:
            del skipped_songs[song]
        
    return skipped_songs

def get_skipped_songs():
    global SKIPPED_SONGS
    
    songs = validate_skipped_songs(SKIPPED_SONGS)
    return songs

def update_strikes(id, song, tunes, progress, skipped, image):
    global CURRENT_SONG, SKIPPED_SONGS

    if id != CURRENT_SONG and progress < 20:
        add_strike(song, tunes, id)
        if id not in SKIPPED_SONGS and progress < 20:
            SKIPPED_SONGS[id] = {
                'name': song['name'],
                'artist': song['artist'],
                'uri': song['uri'],
                'strikes': song['strikes'],
                'image': image
            }
        return True

    if progress >= 20 and skipped:
        remove_strike(song, tunes)
        if id in SKIPPED_SONGS:
            del SKIPPED_SONGS[id]
        return False

    return skipped

def poll_current_playing(sp, tunes, display=False):
    global CURRENT_SONG

    skipped = True
    while True:
        is_playing, id, name, artists, uri, progress, _, image = get_current_playing(sp, display)
        song_status = 'NOT_PLAYING'

        if is_playing == 0x00:
            song_status = 'NOT_PLAYING'
            time.sleep(10)
            continue
        elif is_playing == 0x10 or is_playing == 0x11:
            song_status = 'PLAYING' if is_playing == 0x11 else 'PAUSED'
            song = tunes.get(id, None)
            if song:
                skipped = update_strikes(id, song, tunes, progress, skipped, image)
            else:
                add_song(id, name, artists, uri)
        
        print(f"Song Status: {song_status}")
        print()

        time.sleep(5)

def update_current_playing(playback):
    global SKIPPED, CURRENT_SONG

    tunes = load_tunes()
    is_playing, id, name, artists, uri, progress, _, image = parse_playing(playback)
    song_status = 'NOT_PLAYING'

    if is_playing == 0x00:
        return 'NOT_PLAYING'
    elif is_playing == 0x10 or is_playing == 0x11:
        song_status = 'PLAYING' if is_playing == 0x11 else 'PAUSED'
        song = tunes.get(id, None)
        if song:
            SKIPPED = update_strikes(id, song, tunes, progress, SKIPPED, image)
        else:
            add_song(id, name, artists, uri)

    return song_status

def get_current_playing(sp, display=False, verbose=False):
    # 0x00: NOT_PLAYING
    # 0x10: PAUSED
    # 0x11: PLAYING

    playback = sp.current_playback()

    if verbose:
        playback_verbose = handle_verbose(playback)
        
        song_status = update_current_playing(playback_verbose)
        return playback_verbose, song_status

    if playback and playback['item']:
        is_playing, id, name, artists, uri, progress, duration, image = parse_playing(playback)

        if display:
            print_song(id, name, artists, uri, progress, duration)
    else:
        print("No track is currently playing.\n")

        return 0x00, None, None, None, None, None, None, None

    return is_playing, id, name, artists, uri, progress, duration, image

def parse_playing(playback):

    if not playback:
         return 0x00, None, None, None, None, None, None, None

    track = playback['item']

    name = track['name']
    id = track['id']
    progress = playback['progress_ms'] // 1000 if playback['progress_ms'] else 0
    duration = track['duration_ms'] // 1000 if track['duration_ms'] else 0
    uri = track['uri']
    artists = ', '.join([artist['name'] for artist in track['artists']])
    is_playing = 0x11 if playback['is_playing'] else 0x10
    image = track['album']['images'][1]['url']

    return is_playing, id, name, artists, uri, progress, duration, image

def handle_verbose(playback):
    if not playback:
        return None
    
    return playback

def print_song(id, name, artists, uri, progress, duration):
    print(f"Currently Playing: {name} - {artists}")
    print(f"ID: {id} ")
    print(f"Progress: {progress} / {duration} ")
    print(f"URI: {uri}")

def main():
    parser = argparse.ArgumentParser(description='Spotify Playlist Cleaner')
    parser.add_argument('--get', action='store_true', help='Fetch songs from playlist')
    parser.add_argument('--print', action='store_true', help='Print current playing')
    args = parser.parse_args()

    scope = "user-top-read user-read-playback-state playlist-read-private playlist-read-collaborative"

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope, redirect_uri=REDIRECT_URL))

    user = sp.current_user()
    print(f"Logged in as: {user['display_name']}")
    print("-" * 50)

    tunes = load_tunes()
    if args.get:
        get_songs_from_tunes(sp)

    poll_current_playing(sp, tunes, args.print)

if __name__ == "__main__":
    main()
