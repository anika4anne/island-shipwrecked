import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  character: string;
  x?: number;
  y?: number;
  coins?: number;
  direction?: "left" | "right";
  isMoving?: boolean;
  isJumping?: boolean;
}

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  players: Player[];
  gameStarted: boolean;
  hostId: string;
  gameState?: {
    players: Player[];
    coins: Array<{ id: string; x: number; y: number; collected: boolean }>;
    platforms: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
    treasureChest: { x: number; y: number };
    timeLeft: number;
    gameWon: boolean;
    gameLost: boolean;
  };
}

class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(
    roomId: string,
    roomName: string,
    maxPlayers: number,
    hostId: string,
    hostName: string,
    hostCharacter: string,
  ): Room {
    const room: Room = {
      id: roomId,
      name: roomName,
      maxPlayers,
      players: [
        {
          id: hostId,
          name: hostName,
          isHost: true,
          character: hostCharacter,
        },
      ],
      gameStarted: false,
      hostId,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers || room.gameStarted) {
      return false;
    }
    room.players.push(player);
    return true;
  }

  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return false;

    room.players.splice(playerIndex, 1);

    if (playerId === room.hostId) {
      if (room.players.length > 0) {
        const newHost = room.players[0];
        if (newHost) {
          room.hostId = newHost.id;
          newHost.isHost = true;
        }
      } else {
        this.rooms.delete(roomId);
      }
    }
    return true;
  }

  startGame(roomId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.gameStarted) {
      return false;
    }
    room.gameStarted = true;

    const initialPlayers = room.players.map((player, index) => ({
      ...player,
      x: 150 + index * 120,
      y: 100, // Position players near the bottom
      coins: 0,
      direction: "right" as const,
      isMoving: false,
      isJumping: false,
    }));

    const platforms = [
      { id: "ground", x: 0, y: 900, width: 1200, height: 100 },
      { id: "platform1", x: 100, y: 400, width: 150, height: 25 }, // Move platforms down
      { id: "platform2", x: 300, y: 300, width: 150, height: 25 },
      { id: "platform3", x: 500, y: 200, width: 150, height: 25 },
      { id: "platform4", x: 950, y: 400, width: 150, height: 25 },
      { id: "platform5", x: 950, y: 300, width: 150, height: 25 },
      { id: "platform6", x: 950, y: 200, width: 150, height: 25 },
      { id: "platform7", x: 525, y: 750, width: 150, height: 25 },
      { id: "platform8", x: 525, y: 650, width: 150, height: 25 },
    ];

    const coins = [
      { id: "coin1", x: 150, y: 350, collected: false }, // Move coins down
      { id: "coin2", x: 300, y: 350, collected: false },
      { id: "coin3", x: 1000, y: 350, collected: false },
      { id: "coin4", x: 1000, y: 250, collected: false },
      { id: "coin5", x: 1000, y: 150, collected: false },
      { id: "coin-7", x: 600, y: 725, collected: false },
      { id: "coin-8", x: 600, y: 625, collected: false },
      { id: "coin-9", x: 200, y: 850, collected: false },
      { id: "coin-10", x: 1000, y: 850, collected: false },
    ];

    room.gameState = {
      players: initialPlayers,
      coins: [
        { id: "coin1", x: 150, y: 50, collected: false }, // Position coins above platforms
        { id: "coin2", x: 300, y: 50, collected: false },
        { id: "coin3", x: 1000, y: 50, collected: false },
        { id: "coin4", x: 1000, y: 150, collected: false },
        { id: "coin5", x: 1000, y: 250, collected: false },
      ],
      platforms: [
        { id: "platform1", x: 100, y: 0, width: 150, height: 25 }, // Position platforms at bottom
        { id: "platform2", x: 300, y: 0, width: 150, height: 25 },
        { id: "platform3", x: 500, y: 0, width: 150, height: 25 },
        { id: "platform4", x: 950, y: 0, width: 150, height: 25 },
        { id: "platform5", x: 950, y: 100, width: 150, height: 25 },
        { id: "platform6", x: 950, y: 200, width: 150, height: 25 },
      ],
      treasureChest: { x: 600, y: 50 }, // Position treasure chest above platforms
      timeLeft: 120,
      gameWon: false,
      gameLost: false,
    };

    return true;
  }

  updatePlayerPosition(
    roomId: string,
    playerId: string,
    x: number,
    y: number,
    direction: "left" | "right",
    isMoving: boolean,
    isJumping: boolean,
  ): boolean {
    const room = this.rooms.get(roomId);
    if (!room?.gameState) return false;

    const player = room.gameState.players.find((p) => p.id === playerId);
    if (!player) return false;

    console.log(
      `Server: Updating player ${playerId} position from (${player.x}, ${player.y}) to (${x}, ${y})`,
    );

    player.x = x;
    player.y = y;
    player.direction = direction;
    player.isMoving = isMoving;
    player.isJumping = isJumping;

    console.log(
      `Server: Player ${playerId} new position: (${player.x}, ${player.y})`,
    );

    return true;
  }

  collectCoin(roomId: string, coinId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room?.gameState) return false;

    const coin = room.gameState.coins.find((c) => c.id === coinId);
    if (!coin || coin.collected) return false;

    coin.collected = true;

    const player = room.gameState.players.find((p) => p.id === playerId);
    if (player) {
      player.coins = (player.coins ?? 0) + 1;
    }

    return true;
  }

  checkTreasureWin(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room?.gameState) return false;

    const player = room.gameState.players.find((p) => p.id === playerId);
    if (!player) return false;

    const treasure = room.gameState.treasureChest;
    const distance = Math.sqrt(
      Math.pow((player.x ?? 0) - treasure.x, 2) +
        Math.pow((player.y ?? 0) - treasure.y, 2),
    );

    if (distance < 50) {
      room.gameState.gameWon = true;
      return true;
    }

    return false;
  }

  updateGameTime(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room?.gameState) return false;

    if (room.gameState.timeLeft > 0) {
      room.gameState.timeLeft -= 1;
      if (room.gameState.timeLeft <= 0) {
        room.gameState.gameLost = true;
      }
    }

    return true;
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  getDebugInfo(): string {
    return `Total rooms: ${this.rooms.size}`;
  }
}

declare global {
  var roomManager: RoomManager | undefined;
}

const roomManager: RoomManager = (() => {
  if (typeof global.roomManager === "undefined") {
    global.roomManager = new RoomManager();
  }
  return global.roomManager;
})();

export const roomRouter = createTRPCRouter({
  createRoom: publicProcedure
    .input(
      z.object({
        roomName: z.string().min(1),
        maxPlayers: z.number().min(2).max(6),
        hostName: z.string().min(1),
        hostCharacter: z.string(), // Add character parameter
      }),
    )
    .mutation(async ({ input }) => {
      console.log("createRoom called with input:", input);

      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const hostId = Math.random().toString(36).substring(2, 15);

      console.log("Generated roomId:", roomId, "hostId:", hostId);

      const room = roomManager.createRoom(
        roomId,
        input.roomName,
        input.maxPlayers,
        hostId,
        input.hostName,
        input.hostCharacter,
      );

      console.log("Created room:", room);
      console.log("All rooms in manager:", roomManager.getDebugInfo());

      return {
        roomId,
        roomName: input.roomName,
        maxPlayers: input.maxPlayers,
        hostName: input.hostName,
        hostId,
        hostCharacter: input.hostCharacter,
      };
    }),

  getRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      console.log("getRoom called with roomId:", input.roomId);
      console.log("RoomManager instance:", roomManager);
      console.log("Total rooms in manager:", roomManager.getDebugInfo());
      const room = roomManager.getRoom(input.roomId);
      console.log("Room found:", room);
      return room ?? null;
    }),

  joinRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        playerName: z.string().min(1),
        playerCharacter: z.string(), // Add character parameter
      }),
    )
    .mutation(async ({ input }) => {
      console.log("joinRoom called with input:", input);

      const room = roomManager.getRoom(input.roomId);
      if (!room) {
        console.log("Room not found for roomId:", input.roomId);
        throw new Error("Room not found");
      }

      if (room.gameStarted) {
        throw new Error("Game already started");
      }

      if (room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
      }

      const playerId = Math.random().toString(36).substring(2, 15);
      const player: Player = {
        id: playerId,
        name: input.playerName,
        isHost: false,
        character: input.playerCharacter, // Use provided character
      };

      if (roomManager.addPlayerToRoom(input.roomId, player)) {
        return {
          room: roomManager.getRoom(input.roomId),
          playerId,
          canJoin: true,
        };
      } else {
        throw new Error("Failed to join room");
      }
    }),

  startGame: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        hostId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("startGame called with:", input);
      const room = roomManager.getRoom(input.roomId);
      console.log("Room before startGame:", room);

      if (roomManager.startGame(input.roomId, input.hostId)) {
        const updatedRoom = roomManager.getRoom(input.roomId);
        console.log("Room after startGame:", updatedRoom);
        return {
          success: true,
          room: updatedRoom,
        };
      } else {
        throw new Error("Only host can start the game");
      }
    }),

  leaveRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      roomManager.removePlayerFromRoom(input.roomId, input.playerId);
      return { success: true };
    }),

  updatePlayerCharacter: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        playerId: z.string(),
        character: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const room = roomManager.getRoom(input.roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const player = room.players.find((p) => p.id === input.playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      player.character = input.character;
      return { success: true };
    }),

  updatePlayerPosition: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        playerId: z.string(),
        x: z.number(),
        y: z.number(),
        direction: z.enum(["left", "right"]),
        isMoving: z.boolean(),
        isJumping: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const success = roomManager.updatePlayerPosition(
        input.roomId,
        input.playerId,
        input.x,
        input.y,
        input.direction,
        input.isMoving,
        input.isJumping,
      );
      return { success };
    }),

  collectCoin: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        coinId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const success = roomManager.collectCoin(
        input.roomId,
        input.coinId,
        input.playerId,
      );
      return { success };
    }),

  checkTreasureWin: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const success = roomManager.checkTreasureWin(
        input.roomId,
        input.playerId,
      );
      return { success };
    }),

  updateGameTime: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const success = roomManager.updateGameTime(input.roomId);
      return { success };
    }),
});

export type RoomRouter = typeof roomRouter;
