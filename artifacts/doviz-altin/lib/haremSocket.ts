import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import type { RawHaremPrice, RawHaremResponse } from "./haremApi";

const SOCKET_URL = "https://haremapi.tr";
const API_KEY = process.env.EXPO_PUBLIC_HAREMAPI_KEY ?? "";

export interface HaremSocketHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (err: Error) => void;
  onPrices: (data: RawHaremResponse, mode: "snapshot" | "update") => void;
  onStale?: () => void;
  onLive?: () => void;
}

export function connectHaremSocket(handlers: HaremSocketHandlers): Socket | null {
  if (Platform.OS === "web") {
    handlers.onError?.(new Error("websocket disabled on web (CORS); using polling fallback"));
    return null;
  }
  const socket = io(SOCKET_URL, {
    auth: { api_key: API_KEY },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  });

  socket.on("connect", () => handlers.onConnect?.());
  socket.on("disconnect", (reason: string) => handlers.onDisconnect?.(reason));
  socket.on("connect_error", (err: Error) => handlers.onError?.(err));
  socket.on("data:stale", () => handlers.onStale?.());
  socket.on("data:live", () => handlers.onLive?.());

  const dispatch = (mode: "snapshot" | "update") => (payload: RawHaremPrice[] | RawHaremResponse) => {
    if (Array.isArray(payload)) {
      handlers.onPrices({ data: payload }, mode);
    } else if (payload?.data) {
      handlers.onPrices(payload, mode);
    }
  };

  socket.on("prices:snapshot", dispatch("snapshot"));
  socket.on("prices:update", dispatch("update"));

  return socket;
}
