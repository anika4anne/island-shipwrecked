import Link from "next/link";

export default function CreateRoom() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-900 to-orange-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1
            className="animate-slide-in-from-left mb-6 text-6xl font-bold tracking-tight text-amber-50 drop-shadow-2xl md:text-7xl"
            style={{ fontFamily: "Canterbury, serif" }}
          >
            🗺️ Survivor's Camp 🗺️
          </h1>
          <p className="animate-slide-in-from-right mx-auto mb-8 max-w-3xl text-xl text-amber-50 drop-shadow-lg md:text-2xl">
            After the storm, you found yourself on this mysterious island. The
            map you discovered shows an X marking treasure - but you'll need
            help to find it.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 text-center">
              <div className="mb-4 text-6xl">🏝️</div>
              <h2 className="mb-4 text-3xl font-bold text-amber-900">
                Form Your Search Party
              </h2>
              <p className="text-amber-700">
                Three survivors, one map, one treasure. Work together to
                navigate the island and find what the X marks.
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label
                  htmlFor="roomName"
                  className="mb-2 block text-lg font-semibold text-amber-800"
                >
                  🏕️ Camp Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  placeholder="Name your survivor camp..."
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100/50 px-4 py-3 text-amber-900 placeholder-amber-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="maxPlayers"
                  className="mb-2 block text-lg font-semibold text-amber-800"
                >
                  👥 Survivor Count
                </label>
                <select
                  id="maxPlayers"
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100/50 px-4 py-3 text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="3">3 Survivors</option>
                  <option value="4">4 Survivors</option>
                  <option value="5">5 Survivors</option>
                  <option value="6">6 Survivors</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="group w-full transform rounded-full bg-gradient-to-r from-amber-700 to-orange-700 px-8 py-4 text-xl font-bold text-amber-50 shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-800 hover:to-orange-800 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    🚢 Begin the Search
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="mb-4 text-sm text-amber-600">
                Already have a camp code?
              </p>
              <Link
                href="/join-room"
                className="inline-flex items-center gap-2 text-amber-700 transition-colors duration-200 hover:text-amber-900"
              >
                🔑 Join Existing Camp
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-50 drop-shadow-lg transition-colors duration-200 hover:text-amber-100"
          >
            ← Back to Island
          </Link>
        </div>
      </div>
    </main>
  );
}
