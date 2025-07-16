const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
    return (
      <main className="flex flex-col items-center justify-center h-screen">
      <a href={API_BASE + '/login'}>
        <div className="bg-green-400 p-4 rounded-md">
          <h1 className="text-2xl font-bold py-2 text-center">Login with Spotify</h1>
        </div>
      </a>
    </main>
    );
  }
