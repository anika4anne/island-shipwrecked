"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { api } from "~/trpc/react";

function CharacterSelector({
  currentCharacter,
  onCharacterChange,
  playerId,
  roomId,
  isCurrentPlayer,
}: {
  currentCharacter: string;
  onCharacterChange: (character: string) => void;
  playerId: string;
  roomId: string;
  isCurrentPlayer: boolean;
}) {
  const [selectedCharacter, setSelectedCharacter] = useState(currentCharacter);
  const [isSaving, setIsSaving] = useState(false);

  const updateCharacterMutation = api.room.updatePlayerCharacter.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      onCharacterChange(selectedCharacter);
    },
    onError: (error) => {
      alert(`Failed to update character: ${error.message}`);
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    if (selectedCharacter !== currentCharacter) {
      setIsSaving(true);
      updateCharacterMutation.mutate({
        roomId,
        playerId,
        character: selectedCharacter,
      });
    }
  };

  const characters = [
    { id: "mickey", name: "Mickey", icon: "🐭" },
    { id: "minnie", name: "Minnie", icon: "🐭" },
    { id: "garfield", name: "Garfield", icon: "🐱" },
    { id: "phineas", name: "Phineas", icon: "🧑‍🦰" },
    { id: "tall", name: "Tall", icon: "🧍" },
    { id: "jerry", name: "Jerry", icon: "🐭" },
    { id: "dog", name: "Dog", icon: "🐕" },
  ];

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedCharacter}
        onChange={(e) => setSelectedCharacter(e.target.value)}
        disabled={!isCurrentPlayer || isSaving}
        className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 disabled:opacity-50"
      >
        {characters.map((char) => (
          <option key={char.id} value={char.id}>
            {char.icon} {char.name}
          </option>
        ))}
      </select>

      {isCurrentPlayer && selectedCharacter !== currentCharacter && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );
}

function LobbyContent() {
  const [copied, setCopied] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showVideo, setShowVideo] = useState(false);

  const searchParamsObj = useSearchParams();
  const roomId = searchParamsObj.get("roomId");
  const roomName = searchParamsObj.get("roomName");
  const maxPlayers = parseInt(searchParamsObj.get("maxPlayers") ?? "3");
  const playerId = searchParamsObj.get("playerId");
  const isHost = searchParamsObj.get("isHost") === "true";

  const { data: room, refetch: refetchRoom } = api.room.getRoom.useQuery(
    { roomId: roomId! },
    {
      enabled: !!roomId,
      refetchInterval: 1000,
    },
  );

  const startGameMutation = api.room.startGame.useMutation({
    onSuccess: async () => {
      await refetchRoom();
    },
    onError: (error) => {
      alert(`Failed to start game: ${error.message}`);
    },
  });

  const leaveRoomMutation = api.room.leaveRoom.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error) => {
      alert(`Failed to leave room: ${error.message}`);
    },
  });

  const currentIsHost = room?.hostId === playerId || isHost;
  const playerCount = room?.players.length ?? 0;

  const handleCharacterUpdate = (_playerId: string, _newCharacter: string) => {
    console.log("Character update requested:", {
      playerId: _playerId,
      character: _newCharacter,
    });
  };

  useEffect(() => {
    if (room?.gameStarted) {
      setShowCountdown(true);

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            console.log("Game starting!");
            setShowVideo(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [room?.gameStarted]);

  const handleCopyCode = async () => {
    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleStartGame = () => {
    if (
      playerCount >= Math.min(3, maxPlayers) &&
      currentIsHost &&
      roomId &&
      playerId
    ) {
      startGameMutation.mutate({
        roomId,
        hostId: playerId,
      });
    }
  };

  const handleLeaveRoom = () => {
    if (roomId && playerId) {
      leaveRoomMutation.mutate({
        roomId,
        playerId,
      });
    } else {
      window.location.href = "/";
    }
  };

  const canStartGame =
    playerCount >= Math.min(3, maxPlayers) &&
    currentIsHost &&
    !room?.gameStarted;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-900 to-orange-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link
            href="/create-room"
            className="inline-flex items-center gap-2 text-lg text-amber-50 drop-shadow-lg transition-colors duration-200 hover:text-amber-100"
          >
            ← Back to Create Room
          </Link>
        </div>

        {showCountdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h1 className="mb-8 text-8xl font-bold text-amber-50 drop-shadow-2xl">
                {countdown > 0 ? countdown : "GO!"}
              </h1>
              <p className="text-2xl text-amber-100">
                {countdown > 0
                  ? "Game starting in..."
                  : "Let the adventure begin!"}
              </p>
            </div>
          </div>
        )}

        {showVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <video
              autoPlay
              className="h-full w-full object-cover"
              onEnded={() => {}}
            >
              <source src="/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
              <button
                onClick={() => {
                  setShowVideo(false);

                  if (roomId && roomName) {
                    window.location.href = `/game?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}`;
                  }
                }}
                className="rounded-lg border-2 border-amber-400 bg-amber-600/80 px-8 py-4 text-xl font-bold text-amber-50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-amber-600 hover:shadow-xl"
              >
                ▶️ Continue to Game
              </button>
            </div>
          </div>
        )}

        <div className="mb-16 text-center">
          <h1
            className="animate-slide-in-from-left mb-6 text-6xl font-bold tracking-tight text-amber-50 drop-shadow-2xl md:text-7xl"
            style={{ fontFamily: "Canterbury, serif" }}
          >
            🏕️ Survivor Camp Lobby 🏕️
          </h1>
          <p className="animate-slide-in-from-right mx-auto mb-8 max-w-3xl text-xl text-amber-50 drop-shadow-lg md:text-2xl">
            Waiting for your fellow survivors to join the search party...
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-amber-900">
                Camp Details
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-amber-100/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-800">
                    🏕️ Camp Name
                  </h3>
                  <p className="text-amber-900">{roomName ?? "Loading..."}</p>
                </div>
                <div className="rounded-lg bg-amber-100/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-800">
                    👥 Current Survivors
                  </h3>
                  <p className="text-amber-900">
                    {playerCount}/{maxPlayers} Survivors
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="mb-6 text-3xl font-bold text-amber-900">
                Current Survivors
              </h2>

              {room?.players.find((p) => p.isHost) && (
                <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-amber-200/50 p-4">
                  <div className="text-2xl">👑</div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-amber-900">
                      {room.players.find((p) => p.isHost)?.name} (Camp Leader)
                    </p>
                    <p className="text-sm text-amber-700">
                      {room?.gameStarted
                        ? "Game started!"
                        : "Ready to begin the search"}
                    </p>
                  </div>
                  <CharacterSelector
                    currentCharacter={
                      room.players.find((p) => p.isHost)?.character ?? "mickey"
                    }
                    onCharacterChange={(character) =>
                      handleCharacterUpdate(
                        room.players.find((p) => p.isHost)?.id ?? "",
                        character,
                      )
                    }
                    playerId={room.players.find((p) => p.isHost)?.id ?? ""}
                    roomId={roomId ?? ""}
                    isCurrentPlayer={
                      room.players.find((p) => p.isHost)?.id === playerId
                    }
                  />
                </div>
              )}

              {room?.players
                .filter((p) => !p.isHost)
                .map((player, _index) => (
                  <div
                    key={player.id}
                    className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-amber-200/50 p-4"
                  >
                    <div className="text-2xl">👤</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-amber-900">
                        {player.name}
                      </p>
                      <p className="text-sm text-amber-700">
                        {room?.gameStarted
                          ? "Game started!"
                          : "Ready to begin the search"}
                      </p>
                    </div>
                    <CharacterSelector
                      currentCharacter={player.character ?? "mickey"}
                      onCharacterChange={(character) =>
                        handleCharacterUpdate(player.id, character)
                      }
                      playerId={player.id}
                      roomId={roomId ?? ""}
                      isCurrentPlayer={player.id === playerId}
                    />
                  </div>
                ))}

              {playerCount < maxPlayers && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Array.from(
                    { length: maxPlayers - playerCount },
                    (_, _index) => (
                      <div
                        key={`empty-${_index}`}
                        className="flex items-center gap-3 rounded-lg border-2 border-dashed border-amber-300 bg-amber-100/30 p-4"
                      >
                        <div className="text-2xl">👤</div>
                        <div>
                          <p className="font-medium text-amber-700">
                            Waiting for survivor...
                          </p>
                          <p className="text-sm text-amber-600">
                            Slot {playerCount + _index + 1}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 rounded-2xl border-4 border-amber-800 bg-amber-50/90 p-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-amber-900">
                🔐 Camp Code
              </h2>
              <p className="mb-4 text-amber-700">
                Share this code with your fellow survivors:
              </p>
              <div className="mx-auto max-w-xs">
                <div className="rounded-lg border-2 border-amber-400 bg-amber-200 p-4">
                  <p className="font-mono text-3xl font-bold tracking-widest text-amber-900">
                    {roomId ?? "Loading..."}
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleCopyCode}
                    className={`group transform rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition-all duration-300 ${
                      copied
                        ? "bg-green-600 text-green-50"
                        : "bg-amber-600 text-amber-50 hover:scale-105 hover:bg-amber-700"
                    }`}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            {canStartGame ? (
              <button
                onClick={handleStartGame}
                disabled={startGameMutation.isPending}
                className="group mx-2 mb-4 inline-flex transform items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 px-8 py-4 text-xl font-bold text-green-50 shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-green-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {startGameMutation.isPending
                    ? "Starting..."
                    : "🚀 Start the Adventure!"}
                </span>
              </button>
            ) : room?.gameStarted ? (
              <button
                disabled
                className="group mx-2 mb-4 inline-flex transform cursor-not-allowed items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-green-50 shadow-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  🎮 Game Started!
                </span>
              </button>
            ) : (
              <button
                disabled
                className="group mx-2 mb-4 inline-flex transform cursor-not-allowed items-center gap-2 rounded-full bg-gray-400 px-8 py-4 text-lg font-bold text-gray-200 shadow-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  ⏳ Waiting for Players... ({playerCount}/{maxPlayers})
                </span>
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              disabled={leaveRoomMutation.isPending}
              className="group mx-2 mb-4 inline-flex transform items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-lg font-bold text-red-50 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {leaveRoomMutation.isPending ? "Leaving..." : "🚪 Leave Camp"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Lobby() {
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
      <LobbyContent />
    </Suspense>
  );
}
