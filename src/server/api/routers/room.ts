import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  players: Player[];
  gameStarted: boolean;
  hostId: string;
}

class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(
    roomId: string,
    roomName: string,
    maxPlayers: number,
    hostId: string,
    hostName: string,
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

let roomManager: RoomManager;

if (typeof global.roomManager === "undefined") {
  global.roomManager = new RoomManager();
}
roomManager = global.roomManager;

export const roomRouter = createTRPCRouter({
  createRoom: publicProcedure
    .input(
      z.object({
        roomName: z.string().min(1),
        maxPlayers: z.number().min(2).max(6),
        hostName: z.string().min(1),
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
      );

      console.log("Created room:", room);
      console.log("All rooms in manager:", roomManager.getDebugInfo());

      return {
        roomId,
        roomName: input.roomName,
        maxPlayers: input.maxPlayers,
        hostName: input.hostName,
        hostId,
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
});

export type RoomRouter = typeof roomRouter;
