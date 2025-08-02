import QueueCard from "./QueueCard";

export default function Queue({ queueData }: { queueData: any }) {
  const queue = queueData?.queue ?? [];

  console.log(queue);

  return (
    <div className="flex flex-col items-center bg-black/10 rounded-lg p-6 w-84 md:w-96 gap-5">
      <h1 className="text-2xl font-bold">Queue</h1>
      {queue &&
        queue
          .slice(0, 5)
          .map((song: any) => (
            <QueueCard
              key={song.id}
              name={song.name}
              artist={song.artists[0].name}
              image={song.album.images[1].url}
            />
          ))}
    </div>
  );
}
