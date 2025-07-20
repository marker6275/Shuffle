const SkippedCard = ({ song }: { song: { name: string, artist: string, uri: string, strikes: number, image: string } }) => {
  return (
    <div className="flex gap-8 bg-blue-300 px-8 py-4 rounded-lg w-128 items-center">
        <img src={song.image} alt="Album Art" className="w-24 h-24 rounded-lg"/>
        <div className="flex flex-col justify-center gap-1 w-full">
          <h1 className="text-3xl font-bold">{song.name}</h1>
          <hr/>
          <h2 className="text-lg">By:{" "}<span className="font-semibold">{song.artist}</span></h2>
          <h2 className="text-lg">Strikes: {song.strikes}</h2>
        </div>
    </div>
  )
}

export default SkippedCard;