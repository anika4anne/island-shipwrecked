"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { api } from "~/trpc/react";

interface GamePlayer {
  id: string;
  name: string;
  isHost: boolean;
  character: string;
  x: number;
  y: number;
  coins: number;
  direction: "left" | "right";
  isMoving: boolean;
  isJumping: boolean;
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

function GameCharacter({
  player,
  isCurrentPlayer,
}: {
  player: GamePlayer;
  isCurrentPlayer: boolean;
}) {
  return (
    <div
      className={`absolute transition-all duration-200 ${
        isCurrentPlayer ? "ring-opacity-80 ring-4 ring-yellow-400" : ""
      } ${player.isMoving ? "scale-110 animate-pulse" : ""}`}
      style={{
        left: player.x - 25,
        top: 700 - player.y,
        transform: `scaleX(${player.direction === "left" ? -1 : 1})`,
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-2xl shadow-lg">
        {player.character === "mickey" && "🐭"}
        {player.character === "minnie" && "🐭"}
        {player.character === "garfield" && "🐱"}
        {player.character === "phineas" && "🧑‍🦰"}
        {player.character === "tall" && "🧍"}
        {player.character === "jerry" && "🐭"}
        {player.character === "dog" && "🐕"}
      </div>

      {/* Player name and status */}
      <div className="mt-2 text-center">
        <div className="rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
          {player.name}
        </div>
        <div className="mt-1 rounded-lg border border-white/20 bg-black/50 px-3 py-1 text-center text-xs text-white backdrop-blur-sm">
          {player.coins} 🪙
        </div>
      </div>
    </div>
  );
}

function GameContent() {
  const searchParamsObj = useSearchParams();
  const roomId = searchParamsObj.get("roomId");
  const playerId = searchParamsObj.get("playerId");

  const { data: room } = api.room.getRoom.useQuery(
    { roomId: roomId! },
    {
      enabled: !!roomId,
      refetchInterval: 100,
    },
  );

  const updatePlayerPosition = api.room.updatePlayerPosition.useMutation({
    onSuccess: (data) => {
      console.log("Position update successful:", data);
    },
    onError: (error) => {
      console.error("Position update failed:", error);
    },
  });
  const collectCoin = api.room.collectCoin.useMutation();
  const checkTreasureWin = api.room.checkTreasureWin.useMutation();
  const updateGameTime = api.room.updateGameTime.useMutation();

  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);

  const gameState = room?.gameState;

  useEffect(() => {
    if (gameState?.players) {
      console.log(
        "Server updated game state:",
        gameState.players.map((p) => ({
          id: p.id,
          character: p.character,
          x: p.x,
          y: p.y,
          direction: p.direction,
        })),
      );
    }
  }, [gameState?.players]);

  useEffect(() => {
    if (room?.gameState?.players && playerId) {
      const player = room.gameState.players.find((p) => p.id === playerId);
      if (
        player?.x !== undefined &&
        player.y !== undefined &&
        player.coins !== undefined &&
        player.direction !== undefined &&
        player.isMoving !== undefined &&
        player.isJumping !== undefined
      ) {
        console.log("Updating current player:", {
          id: player.id,
          character: player.character,
          x: player.x,
          y: player.y,
          direction: player.direction,
        });
        setCurrentPlayer(player as GamePlayer);
      }
    }
  }, [room?.gameState?.players, playerId]);

  useEffect(() => {
    if (
      room?.gameStarted &&
      gameState?.timeLeft &&
      gameState.timeLeft > 0 &&
      !gameState.gameWon &&
      !gameState.gameLost
    ) {
      const timer = setInterval(() => {
        updateGameTime.mutate({ roomId: roomId! });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    room?.gameStarted,
    gameState?.timeLeft,
    gameState?.gameWon,
    gameState?.gameLost,
    roomId,
    updateGameTime,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        !currentPlayer ||
        !gameState ||
        gameState.gameWon ||
        gameState.gameLost
      )
        return;

      const key = event.key.toLowerCase();
      console.log("Key pressed:", key, "for player:", currentPlayer.character); // Debug log

      const moveDistance = 50;
      const jumpForce = 50;

      let newX = currentPlayer.x;
      let newY = currentPlayer.y;
      let newDirection = currentPlayer.direction;
      let isMoving = false;
      let isJumping = false;

      if (key === "w" || key === "arrowup" || key === " ") {
        newY = Math.max(0, currentPlayer.y - jumpForce);
        isJumping = true;
        console.log("Jumping! New Y:", newY);
        g;
      } else if (key === "s" || key === "arrowdown") {
        newY = Math.min(800, currentPlayer.y + moveDistance);
        isMoving = true;
        console.log("Moving down! New Y:", newY);
      } else if (key === "a" || key === "arrowleft") {
        newX = Math.max(0, currentPlayer.x - moveDistance);
        newDirection = "left";
        isMoving = true;
        console.log("Moving left! New X:", newX); // Debug log
      } else if (key === "d" || key === "arrowright") {
        newX = Math.min(1200, currentPlayer.x + moveDistance);
        newDirection = "right";
        isMoving = true;
        console.log("Moving right! New X:", newX); // Debug log
      }

      console.log(
        `Moving ${currentPlayer.character} from (${currentPlayer.x}, ${currentPlayer.y}) to (${newX}, ${newY})`,
      );

      updatePlayerPosition.mutate({
        roomId: roomId!,
        playerId: currentPlayer.id,
        x: newX,
        y: newY,
        direction: newDirection,
        isMoving,
        isJumping,
      });

      gameState.coins.forEach((coin) => {
        if (
          !coin.collected &&
          Math.abs(newX - coin.x) < 30 &&
          Math.abs(newY - coin.y) < 30
        ) {
          collectCoin.mutate({
            roomId: roomId!,
            coinId: coin.id,
            playerId: currentPlayer.id,
          });
        }
      });

      const treasure = gameState.treasureChest;
      if (
        Math.abs(newX - treasure.x) < 30 &&
        Math.abs(newY - treasure.y) < 30
      ) {
        checkTreasureWin.mutate({
          roomId: roomId!,
          playerId: currentPlayer.id,
        });
      }
    },
    [
      currentPlayer,
      gameState,
      roomId,
      updatePlayerPosition,
      collectCoin,
      checkTreasureWin,
    ],
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

  if (!gameState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-400 to-sky-600">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Loading Game...</h1>
        </div>
      </main>
    );
  }

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
            Coins collected: {currentPlayer?.coins ?? 0}
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
            Time&apos;s up! You didn&apos;t reach the treasure in time.
          </p>
          <p className="mb-8 text-xl">
            Coins collected: {currentPlayer?.coins ?? 0}
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
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500"></div>

      <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-slate-600 to-transparent"></div>

      <div className="absolute top-20 left-20 text-4xl text-white/30">☁️</div>
      <div className="absolute top-40 right-32 text-3xl text-white/20">☁️</div>
      <div className="absolute top-16 right-64 text-2xl text-white/25">☁️</div>

      <div className="absolute top-4 left-4 z-10 rounded-xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-center gap-2 text-lg font-bold">
          ⏰ Time: {formatTime(gameState.timeLeft)}
        </div>
        <div className="mb-1 flex items-center justify-center gap-2 text-sm">
          🪙 Coins: {currentPlayer?.coins ?? 0}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          👥 Players: {gameState.players.length}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 max-w-xs rounded-xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
        <div className="mb-2 text-lg font-bold">🎮 Controls:</div>
        <div className="text-sm">WASD or Arrow Keys to move</div>
        <div className="text-sm">Space or W to jump</div>
        <div className="text-sm">Collect coins and reach the treasure!</div>
        <div className="text-sm font-bold text-yellow-300">⏱️ 2 minutes!</div>

        {/* Debug button for testing movement */}
        {currentPlayer && (
          <button
            onClick={() => {
              console.log("Debug: Moving character manually");
              updatePlayerPosition.mutate({
                roomId: roomId!,
                playerId: currentPlayer.id,
                x: currentPlayer.x + 100,
                y: currentPlayer.y,
                direction: "right",
                isMoving: true,
                isJumping: false,
              });
            }}
            className="mt-2 w-full rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
          >
            🧪 Test Move Right (Debug)
          </button>
        )}
      </div>

      {/* Game canvas with proper dimensions */}
      <div
        className="relative h-full w-full"
        style={{ minHeight: "800px", minWidth: "1200px" }}
      >
        {gameState.platforms.map((platform) => (
          <div
            key={platform.id}
            className="absolute border-2 border-amber-900 bg-gradient-to-b from-amber-700 to-amber-800 shadow-lg"
            style={{
              left: platform.x,
              top: 700 - platform.y, // Y=0 becomes top: 700 (bottom), Y=100 becomes top: 600
              width: platform.width,
              height: platform.height,
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-xs text-amber-100">Platform</div>
            </div>
          </div>
        ))}

        <div
          className="absolute animate-pulse cursor-pointer text-6xl drop-shadow-lg"
          style={{
            left: gameState.treasureChest.x - 30,
            top: 700 - gameState.treasureChest.y, // Y=50 becomes top: 650
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
                  top: 700 - coin.y,
                }}
                title="Collect me for points!"
              >
                🪙
              </div>
            ),
        )}

        {gameState.players
          .filter(
            (player): player is GamePlayer =>
              player.x !== undefined &&
              player.y !== undefined &&
              player.coins !== undefined &&
              player.direction !== undefined &&
              player.isMoving !== undefined &&
              player.isJumping !== undefined,
          )
          .map((player) => (
            <GameCharacter
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayer?.id}
            />
          ))}
      </div>

      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
        <div className="text-sm font-bold">
          Players in Game: {gameState.players.length}
        </div>
        {/* Debug info */}
        {currentPlayer && (
          <div className="mt-2 text-xs text-yellow-300">
            <div>
              Your Pos: ({currentPlayer.x}, {currentPlayer.y})
            </div>
            <div>Direction: {currentPlayer.direction}</div>
            <div>Moving: {currentPlayer.isMoving ? "Yes" : "No"}</div>
          </div>
        )}

        {/* Debug movement test button */}
        <button
          onClick={() => {
            if (currentPlayer && roomId) {
              console.log("Testing movement for:", currentPlayer.character);
              updatePlayerPosition.mutate({
                roomId,
                playerId: currentPlayer.id,
                x: currentPlayer.x + 50,
                y: currentPlayer.y,
                direction: "right",
                isMoving: true,
                isJumping: false,
              });
            }
          }}
          className="mt-2 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
        >
          Test Move Right (Debug)
        </button>
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
