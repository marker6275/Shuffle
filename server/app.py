from flask import Flask, redirect, jsonify, request, session
from flask_cors import CORS
from main import get_current_playing, get_skipped_songs, refresh_skipped_songs, remove_strike_by_id, clear_skipped
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os

load_dotenv()

REDIRECT_URL = os.getenv('REDIRECT_URI')

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://192.168.1.152:3000', 'http://127.0.0.1:3000'], allow_headers=['Content-Type'])

scope = "user-top-read user-read-playback-state playlist-read-private playlist-read-collaborative"

auth_manager = SpotifyOAuth(scope=scope, redirect_uri=REDIRECT_URL)
sp = spotipy.Spotify(auth_manager=auth_manager)

@app.route('/')
def index():
    return jsonify({'message': 'Spotify Cleaner'})

@app.route('/current_playing')
def current_playing():
    playback, song_status = get_current_playing(sp, verbose=True)
    return jsonify({
        'message': playback['item'] if playback else None,
        'playing_status': song_status
        })

@app.route('/skipped_songs')
def skipped_songs():
    skipped_songs = get_skipped_songs()

    return jsonify({'message': skipped_songs})

@app.route('/clear_skipped_songs')
def clear_skipped_songs():
    result = clear_skipped()
    return jsonify({'message': result})

@app.route('/subtract_strike', methods=['POST'])
def subtract_strike():
    data = request.get_json()
    print(data)
    id = data['id']
    remove_strike_by_id(id)
    return jsonify({'message': 'Strike subtracted'})

@app.route('/refresh_skipped')
def refresh_skipped():
    result = refresh_skipped_songs()
    return jsonify({'message': result})

@app.route('/login')
def login():
    auth_url = auth_manager.get_authorize_url()

    return redirect(auth_url)

app.secret_key = 'secret_key'

@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = auth_manager.get_access_token(code)
    access_token = token_info['access_token']
    session['access_token'] = access_token

    user = sp.current_user()

    return redirect(f"http://192.168.1.152:3000/dashboard?user={user['display_name']}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)