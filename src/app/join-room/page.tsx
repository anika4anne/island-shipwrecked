"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function JoinRoom() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    roomCode: "",
    playerName: "",
    playerGender: "male" as "male" | "female",
    playerCharacter: "mickey" as string, // Add character selection
  });

  const joinRoomMutation = api.room.joinRoom.useMutation({
    onSuccess: (data) => {
      if (data.room) {
        router.push(
          `/lobby?roomId=${formData.roomCode}&roomName=${encodeURIComponent(data.room.name)}&maxPlayers=${data.room.maxPlayers}&hostName=${encodeURIComponent(data.room.players[0]?.name ?? "")}&playerId=${data.playerId}&isHost=false&playerCharacter=${formData.playerCharacter}`,
        );
      }
    },
    onError: (error) => {
      alert(`Failed to join room: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form with data:", formData);
    console.log("Calling joinRoomMutation.mutate with:", {
      roomId: formData.roomCode,
      playerName: formData.playerName,
      playerGender: formData.playerGender,
      playerCharacter: formData.playerCharacter, // Add character
    });

    joinRoomMutation.mutate({
      roomId: formData.roomCode,
      playerName: formData.playerName,
      playerGender: formData.playerGender,
      playerCharacter: formData.playerCharacter, // Add character
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-900 to-orange-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg text-amber-50 drop-shadow-lg transition-colors duration-200 hover:text-amber-100"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mx-auto max-w-md">
          <div className="mb-16 text-center">
            <h1
              className="animate-slide-in-from-left mb-6 text-6xl font-bold tracking-tight text-amber-50 drop-shadow-2xl md:text-7xl"
              style={{ fontFamily: "Canterbury, serif" }}
            >
              🚪 Join Camp
            </h1>
            <p className="animate-slide-in-from-right mx-auto mb-8 max-w-3xl text-xl text-amber-50 drop-shadow-lg md:text-2xl">
              Enter the camp code to join your fellow survivors
            </p>
          </div>

          <div className="rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-8 shadow-2xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="roomCode"
                  className="mb-2 block text-lg font-semibold text-amber-900"
                >
                  🏕️ Camp Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={formData.roomCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100 px-4 py-3 font-mono text-lg font-bold tracking-widest text-amber-900 placeholder-amber-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="playerName"
                  className="mb-2 block text-lg font-semibold text-amber-900"
                >
                  👤 Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={formData.playerName}
                  onChange={(e) =>
                    setFormData({ ...formData, playerName: e.target.value })
                  }
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100 px-4 py-3 text-lg font-semibold text-amber-900 placeholder-amber-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  placeholder="Enter your survivor name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="playerGender"
                  className="mb-2 block text-lg font-semibold text-amber-900"
                >
                  👤 Your Gender
                </label>
                <select
                  id="playerGender"
                  name="playerGender"
                  value={formData.playerGender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      playerGender: e.target.value as "male" | "female",
                    })
                  }
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100 px-4 py-3 text-lg font-semibold text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="playerCharacter"
                  className="mb-2 block text-lg font-semibold text-amber-900"
                >
                  🎭 Choose Your Character
                </label>
                <select
                  id="playerCharacter"
                  name="playerCharacter"
                  value={formData.playerCharacter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      playerCharacter: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border-2 border-amber-300 bg-amber-100 px-4 py-3 text-lg font-semibold text-amber-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="mickey">🐭 Mickey</option>
                  {/* Add more characters here as you create them */}
                </select>
              </div>

              <button
                type="submit"
                disabled={joinRoomMutation.isPending}
                className="group w-full transform rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 text-xl font-bold text-amber-50 shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-700 hover:to-amber-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joinRoomMutation.isPending ? "Joining..." : "🚪 Join Camp"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
