from flask import Flask, request, jsonify
from main import get_current_playing
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)

scope = "user-top-read user-read-playback-state playlist-read-private playlist-read-collaborative"

@app.route('/')
def index():
    return jsonify({'message': 'Spotify Cleaner'})

@app.route('/current_playing')
def current_playing():
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope))
    user = sp.current_user()

    playback = get_current_playing(sp, verbose=True)
    return jsonify({
        'user': user,
        'message': playback['item'] if playback else None
        })

if __name__ == '__main__':
    app.run(debug=True)