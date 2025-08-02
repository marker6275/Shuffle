export default function Queue({
  queue,
  onRefresh,
  isRefreshing,
}: {
  queue: any[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-col items-center bg-red-200 rounded-lg p-6 w-84 md:w-96">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-xl font-bold">
          Queue ({Array.isArray(queue) ? queue.length : 0})
        </h2>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-red-300 rounded transition-colors disabled:opacity-50"
        >
          <img
            src="assets/refresh.png"
            alt="Refresh"
            className={`size-8 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {!Array.isArray(queue) || queue.length === 0 ? (
        <p className="text-gray-600">No songs in queue</p>
      ) : (
        <div className="w-full space-y-2">
          {queue.slice(0, 5).map((song, index) => (
            <div key={song.id || index} className="bg-white/20 rounded p-2">
              <p className="font-semibold text-sm">{song.name}</p>
              <p className="text-xs text-gray-700">
                {song.artists?.[0]?.name || "Unknown Artist"}
              </p>
            </div>
          ))}
          {queue.length > 5 && (
            <p className="text-xs text-gray-600 text-center">
              +{queue.length - 5} more songs
            </p>
          )}
        </div>
      )}
    </div>
  );
}
