export default function QueueCard({
  name,
  artist,
  image,
}: {
  name: string;
  artist: string;
  image: string;
}) {
  return (
    <div className="flex w-full items-center bg-green-400/50 p-2 gap-1 rounded-sm cursor-pointer">
      <img src={image} alt={name} className="size-10" />
      <div className="flex flex-col">
        <h3 className="text-lg line-clamp-1 font-semibold">{name}</h3>
        <p className="text-sm">{artist}</p>
      </div>
    </div>
  );
}
