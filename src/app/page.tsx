import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/home.jpg)" }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1
            className="animate-slide-in-from-left mb-6 text-8xl font-bold tracking-tight text-amber-50 drop-shadow-2xl md:text-9xl lg:text-[10rem]"
            style={{ fontFamily: "Canterbury, serif" }}
          >
            Welcome to this Island
          </h1>
          <p
            className="animate-slide-in-from-right mx-auto mb-8 max-w-3xl text-xl text-amber-900 drop-shadow-lg md:text-2xl"
            style={{ fontFamily: "Canterbury, serif" }}
          >
            Stranded on a mysterious island, you must work together with other
            survivors to find the hidden treasure marked by X on your map
          </p>

          <div className="animate-bounce-in mb-12">
            <div className="mb-4 text-6xl drop-shadow-2xl">🏝️</div>
            <p
              className="text-lg font-medium text-amber-100 drop-shadow-lg"
              style={{ fontFamily: "Canterbury, serif" }}
            >
              The treasure awaits, but only together can you find it...
            </p>
          </div>

          <div className="animate-slide-up flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/create-room"
              className="group transform rounded-full bg-gradient-to-r from-amber-700 to-orange-700 px-8 py-4 text-lg font-bold text-amber-50 shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-800 hover:to-orange-800 hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                🏠 Create Private Room
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/join-room"
              className="group transform rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-4 text-lg font-bold text-amber-50 shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                🔑 Enter Code
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
