const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const SkippedCard = ({ id, song, current }: { id: string, song: { name: string, artist: string, uri: string, strikes: number, image: string }, current: boolean }) => {
  return (
    <div className={`flex gap-4 md:gap-8 ${current ? 'bg-orange-200' : 'bg-green-200'} px-4 md:px-8 py-4 rounded-lg w-full md:w-128 items-center cursor-pointer`} onClick={async () => {
      await fetch(API_BASE + '/subtract_strike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id
        }),
      })
    }}>
        <img src={song.image} alt="Album Art" className="w-20 md:w-24 h-20 md:h-24 rounded-sm md:rounded-lg"/>
        <div className="flex flex-col justify-center w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{song.name}</h1>
          <h2 className="text-sm md:text-lg">By:{" "}<span className="font-semibold">{song.artist}</span></h2>
          <h2 className="text-sm md:text-lg">Strikes: {song.strikes}</h2>
        </div>
    </div>
  )
}

export default SkippedCard;