"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { api } from "~/trpc/react";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  x: number;
  y: number;
  coins: number;
  direction: "left" | "right";
  isMoving: boolean;
  isJumping: boolean;
  character: string;
}

interface Coin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GameState {
  players: Player[];
  coins: Coin[];
  platforms: Platform[];
  treasureChest: { x: number; y: number };
  gameStarted: boolean;
  timeLeft: number;
  gameWon: boolean;
  gameLost: boolean;
}

function GameCharacter({
  player,
  isCurrentPlayer,
}: {
  player: Player;
  isCurrentPlayer: boolean;
}) {
  return (
    <div
      className={`absolute transition-all duration-100 ${
        isCurrentPlayer ? "ring-opacity-80 ring-4 ring-yellow-400" : ""
      }`}
      style={{
        left: player.x - 25,
        top: player.y - 40,
        transform: `scaleX(${player.direction === "left" ? -1 : 1})`,
      }}
    >
      <div className="relative">
        <img
          src={`/characters/${player.character}.svg`}
          alt={player.character}
          className="h-20 w-20 drop-shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = document.createElement("div");
            fallback.className =
              "h-20 w-20 text-6xl flex items-center justify-center";
            fallback.textContent = player.isHost ? "👑" : "🐹";
            target.parentNode?.appendChild(fallback);
          }}
        />

        {player.isJumping && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform rounded bg-black/50 px-1 py-0.5 text-xs text-white">
            ↑
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <div className="rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
          {player.name}
        </div>
        <div className="mt-1 rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
          {player.coins} 🪙
        </div>
      </div>
    </div>
  );
}

function GameContent() {
  const searchParamsObj = useSearchParams();
  const roomId = searchParamsObj.get("roomId");
  const roomName = searchParamsObj.get("roomName");
  const playerId = searchParamsObj.get("playerId");

  const { data: room } = api.room.getRoom.useQuery(
    { roomId: roomId! },
    {
      enabled: !!roomId,
      refetchInterval: 1000,
    },
  );

  const [gameState, setGameState] = useState<GameState>({
    players: [],
    coins: [],
    platforms: [],
    treasureChest: { x: 400, y: 300 },
    gameStarted: false,
    timeLeft: 120,
    gameWon: false,
    gameLost: false,
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (room?.players && !gameState.gameStarted) {
      const initialPlayers: Player[] = room.players.map((player, index) => ({
        ...player,
        x: 150 + index * 120,
        y: window.innerHeight - 150,
        coins: 0,
        direction: "right" as const,
        isMoving: false,
        isJumping: false,
        character: player.character || "mickey",
      }));

      const platforms: Platform[] = [
        {
          id: "ground",
          x: 0,
          y: window.innerHeight - 100,
          width: window.innerWidth,
          height: 100,
        },

        {
          id: "platform1",
          x: 100,
          y: window.innerHeight - 200,
          width: 150,
          height: 25,
        },
        {
          id: "platform2",
          x: 50,
          y: window.innerHeight - 300,
          width: 150,
          height: 25,
        },
        {
          id: "platform3",
          x: 150,
          y: window.innerHeight - 400,
          width: 150,
          height: 25,
        },

        {
          id: "platform4",
          x: window.innerWidth - 250,
          y: window.innerHeight - 200,
          width: 150,
          height: 25,
        },
        {
          id: "platform5",
          x: window.innerWidth - 200,
          y: window.innerHeight - 300,
          width: 150,
          height: 25,
        },
        {
          id: "platform6",
          x: window.innerWidth - 150,
          y: window.innerHeight - 400,
          width: 150,
          height: 25,
        },

        {
          id: "platform7",
          x: window.innerWidth / 2 - 75,
          y: window.innerHeight - 250,
          width: 150,
          height: 25,
        },
        {
          id: "platform8",
          x: window.innerWidth / 2 - 75,
          y: window.innerHeight - 350,
          width: 150,
          height: 25,
        },
      ];

      const coins: Coin[] = [
        { id: "coin-1", x: 175, y: window.innerHeight - 225, collected: false },
        { id: "coin-2", x: 125, y: window.innerHeight - 325, collected: false },
        { id: "coin-3", x: 225, y: window.innerHeight - 425, collected: false },
        {
          id: "coin-4",
          x: window.innerWidth - 175,
          y: window.innerHeight - 225,
          collected: false,
        },
        {
          id: "coin-5",
          x: window.innerWidth - 125,
          y: window.innerHeight - 325,
          collected: false,
        },
        {
          id: "coin-6",
          x: window.innerWidth - 75,
          y: window.innerHeight - 425,
          collected: false,
        },
        {
          id: "coin-7",
          x: window.innerWidth / 2,
          y: window.innerHeight - 275,
          collected: false,
        },
        {
          id: "coin-8",
          x: window.innerWidth / 2,
          y: window.innerHeight - 375,
          collected: false,
        },
        { id: "coin-9", x: 200, y: window.innerHeight - 150, collected: false },
        {
          id: "coin-10",
          x: window.innerWidth - 200,
          y: window.innerHeight - 150,
          collected: false,
        },
      ];

      const treasureChest = {
        x: window.innerWidth / 2,
        y: window.innerHeight - 450,
      };

      setGameState((prev) => ({
        ...prev,
        players: initialPlayers,
        coins,
        platforms,
        treasureChest,
        gameStarted: true,
      }));

      const player = initialPlayers.find((p) => p.id === playerId);
      if (player) {
        setCurrentPlayer(player);
      }
    }
  }, [room?.players, gameState.gameStarted, playerId]);

  useEffect(() => {
    if (
      gameState.gameStarted &&
      gameState.timeLeft > 0 &&
      !gameState.gameWon &&
      !gameState.gameLost
    ) {
      const timer = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, gameLost: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    gameState.gameStarted,
    gameState.timeLeft,
    gameState.gameWon,
    gameState.gameLost,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!currentPlayer || gameState.gameWon || gameState.gameLost) return;

      const key = event.key.toLowerCase();
      const moveDistance = 20;
      const jumpForce = 30;

      setGameState((prev) => {
        const newPlayers = prev.players.map((player) => {
          if (player.id === currentPlayer.id) {
            let newX = player.x;
            let newY = player.y;
            let newDirection = player.direction;
            let isMoving = false;
            let isJumping = false;

            if (key === "w" || key === "arrowup" || key === " ") {
              newY = Math.max(0, player.y - jumpForce);
              isJumping = true;
            } else if (key === "s" || key === "arrowdown") {
              newY = Math.min(
                window.innerHeight - 100,
                player.y + moveDistance,
              );
              isMoving = true;
            } else if (key === "a" || key === "arrowleft") {
              newX = Math.max(0, player.x - moveDistance);
              newDirection = "left";
              isMoving = true;
            } else if (key === "d" || key === "arrowright") {
              newX = Math.min(window.innerWidth - 50, player.x + moveDistance);
              newDirection = "right";
              isMoving = true;
            }

            const newCoins = prev.coins.map((coin) => {
              if (
                !coin.collected &&
                Math.abs(newX - coin.x) < 30 &&
                Math.abs(newY - coin.y) < 30
              ) {
                return { ...coin, collected: true };
              }
              return coin;
            });

            let gameWon = prev.gameWon;
            if (
              Math.abs(newX - prev.treasureChest.x) < 30 &&
              Math.abs(newY - prev.treasureChest.y) < 30
            ) {
              gameWon = true;
            }

            const updatedPlayer = {
              ...player,
              x: newX,
              y: newY,
              direction: newDirection,
              isMoving,
              isJumping,
            };

            const newlyCollectedCoins = prev.coins.filter(
              (c) =>
                !c.collected &&
                Math.abs(newX - c.x) < 30 &&
                Math.abs(newY - c.y) < 30,
            ).length;

            updatedPlayer.coins += newlyCollectedCoins;

            return updatedPlayer;
          }
          return player;
        });

        return {
          ...prev,
          players: newPlayers,
          coins: prev.coins.map((coin) => {
            if (
              !coin.collected &&
              Math.abs(
                newPlayers.find((p) => p.id === currentPlayer.id)?.x ||
                  0 - coin.x,
              ) < 30 &&
              Math.abs(
                newPlayers.find((p) => p.id === currentPlayer.id)?.y ||
                  0 - coin.y,
              ) < 30
            ) {
              return { ...coin, collected: true };
            }
            return coin;
          }),
          gameWon: gameWon || prev.gameWon,
        };
      });
    },
    [currentPlayer, gameState.gameWon, gameState.gameLost],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameState.gameWon) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
        <div className="text-center text-white">
          <h1 className="mb-8 text-6xl font-bold">🎉 VICTORY! 🎉</h1>
          <p className="mb-4 text-2xl">You found the treasure!</p>
          <p className="mb-8 text-xl">
            Time remaining: {formatTime(gameState.timeLeft)}
          </p>
          <p className="mb-8 text-xl">
            Coins collected: {currentPlayer?.coins || 0}
          </p>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg bg-yellow-600 px-6 py-3 text-xl font-bold text-white hover:bg-yellow-700"
          >
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  if (gameState.gameLost) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800">
        <div className="text-center text-white">
          <h1 className="mb-8 text-6xl font-bold">💀 GAME OVER 💀</h1>
          <p className="mb-4 text-2xl">
            Time's up! You didn't reach the treasure in time.
          </p>
          <p className="mb-8 text-xl">
            Coins collected: {currentPlayer?.coins || 0}
          </p>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg bg-gray-600 px-6 py-3 text-xl font-bold text-white hover:bg-gray-700"
          >
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500"></div>

      <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-slate-600 to-transparent"></div>

      <div className="absolute top-20 left-20 text-4xl text-white/30">☁️</div>
      <div className="absolute top-40 right-32 text-3xl text-white/20">☁️</div>
      <div className="absolute top-16 right-64 text-2xl text-white/25">☁️</div>

      <div className="absolute top-4 left-4 z-10 rounded-xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2 text-lg font-bold">
          ⏰ Time: {formatTime(gameState.timeLeft)}
        </div>
        <div className="mb-1 flex items-center gap-2 text-sm">
          🪙 Coins: {currentPlayer?.coins || 0}
        </div>
        <div className="flex items-center gap-2 text-sm">
          👥 Players: {gameState.players.length}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 max-w-xs rounded-xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
        <div className="mb-2 text-lg font-bold">🎮 Controls:</div>
        <div className="text-sm">WASD or Arrow Keys to move</div>
        <div className="text-sm">Space or W to jump</div>
        <div className="text-sm">Collect coins and reach the treasure!</div>
        <div className="text-sm font-bold text-yellow-300">⏱️ 2 minutes!</div>
      </div>

      <div className="relative h-full w-full">
        {gameState.platforms.map((platform) => (
          <div
            key={platform.id}
            className="absolute border-2 border-amber-900 bg-gradient-to-b from-amber-700 to-amber-800 shadow-lg"
            style={{
              left: platform.x,
              top: platform.y,
              width: platform.width,
              height: platform.height,
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 opacity-80"></div>
          </div>
        ))}

        <div
          className="absolute animate-pulse cursor-pointer text-6xl drop-shadow-lg"
          style={{
            left: gameState.treasureChest.x - 30,
            top: gameState.treasureChest.y - 30,
          }}
          title="Treasure Chest - Reach this to win!"
        >
          🎁
        </div>

        {gameState.coins.map(
          (coin) =>
            !coin.collected && (
              <div
                key={coin.id}
                className="absolute animate-bounce cursor-pointer text-4xl brightness-110 drop-shadow-lg filter"
                style={{
                  left: coin.x - 20,
                  top: coin.y - 20,
                }}
                title="Collect me for points!"
              >
                🪙
              </div>
            ),
        )}

        {gameState.players.map((player) => (
          <GameCharacter
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayer?.id}
          />
        ))}

        <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
          <div className="text-sm font-bold">
            Players in Game: {gameState.players.length}
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
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-400 to-sky-600">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">Loading Game...</h1>
          </div>
        </main>
      }
    >
      <GameContent />
    </Suspense>
  );
}
