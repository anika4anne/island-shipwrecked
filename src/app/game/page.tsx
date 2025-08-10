"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { api } from "~/trpc/react";

function GameContent() {
  const searchParamsObj = useSearchParams();
  const roomId = searchParamsObj.get("roomId");
  const roomName = searchParamsObj.get("roomName");

  const { data: room } = api.room.getRoom.useQuery(
    { roomId: roomId! },
    {
      enabled: !!roomId,
      refetchInterval: 1000,
    },
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-900 to-orange-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-800/50 px-4 py-2 text-lg text-amber-50 drop-shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-amber-800/70 hover:text-amber-100"
          >
            ← Back to Lobby
          </button>
        </div>

        <div className="mb-12 text-center">
          <h1 className="animate-fade-in mb-6 text-6xl font-bold text-amber-50 drop-shadow-2xl">
            🗺️ The Treasure Map 🗺️
          </h1>
          <p className="mx-auto max-w-4xl text-xl leading-relaxed text-amber-50 drop-shadow-lg">
            You and your fellow survivors must work together to find the
            treasure marked by the X on this mysterious island. The fate of your
            return home depends on your teamwork and courage!
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-amber-900">
                🏕️ Survivor Camp: {roomName}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-amber-100/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-800">
                    👥 Survivors
                  </h3>
                  <p className="text-xl font-bold text-amber-900">
                    {room?.players.length ?? 0} Survivors
                  </p>
                </div>
                <div className="rounded-lg bg-amber-100/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-800">
                    🎯 Mission
                  </h3>
                  <p className="font-semibold text-amber-900">
                    Find the treasure!
                  </p>
                </div>
                <div className="rounded-lg bg-amber-100/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-800">
                    ⚡ Status
                  </h3>
                  <p className="font-semibold text-amber-900">
                    Ready to explore!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="mb-6 text-3xl font-bold text-amber-900">
                🚢 Your Survivor Crew
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {room?.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="animate-fade-in-up flex items-center gap-4 rounded-lg bg-amber-200/50 p-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-4xl">👤</div>
                    <div className="flex-1 text-left">
                      <p className="text-lg font-semibold text-amber-900">
                        {player.name}
                      </p>
                      <p className="text-sm text-amber-700">
                        {player.isHost ? "Camp Leader" : "Survivor"}
                      </p>
                      <p className="text-xs text-amber-600">
                        Ready for adventure!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="animate-float inline-block rounded-2xl border-4 border-amber-300 bg-gradient-to-br from-amber-100/80 to-orange-100/80 p-8 shadow-2xl">
              <h3 className="mb-6 text-3xl font-bold text-amber-900">
                🎮 Adventure Awaits!
              </h3>
              <p className="mb-6 text-lg text-amber-800">
                The adventure mechanics are being developed. Soon you'll be able
                to:
              </p>
              <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <ul className="space-y-2 text-amber-700">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">🏃‍♂️</span>
                    Explore different areas of the island
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">🧩</span>
                    Solve puzzles together
                  </li>
                </ul>
                <ul className="space-y-2 text-amber-700">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">🔍</span>
                    Find clues leading to the treasure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">🤝</span>
                    Work as a team to survive
                  </li>
                </ul>
              </div>
              <div className="mt-6 rounded-lg bg-amber-200/50 p-4">
                <p className="font-semibold text-amber-800">
                  🚨 Remember: Stay together, stay safe, and may the treasure
                  guide you home!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Game() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-900 to-orange-950">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-amber-50">Loading...</h1>
            </div>
          </div>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  );
}
