import { io, Socket } from "socket.io-client";
import type { RawPricesResponse } from "./finansveriApi";

const SOCKET_URL = "https://api.finansveri.com";
const API_KEY = process.env.EXPO_PUBLIC_FINANSVERI_API_KEY ?? "";

export type PricesPayload = RawPricesResponse | RawPricesResponse["fiyatlar"];

export interface FinansveriSocketCallbacks {
  onPrices: (payload: RawPricesResponse) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (err: Error) => void;
}

function normalize(payload: PricesPayload): RawPricesResponse {
  if (payload && typeof payload === "object" && "fiyatlar" in payload) {
    return payload as RawPricesResponse;
  }
  return {
    fiyatlar: payload as RawPricesResponse["fiyatlar"],
    guncellendi: Date.now(),
  };
}

export function connectFinansveriSocket(cb: FinansveriSocketCallbacks): Socket {
  const socket = io(SOCKET_URL, {
    auth: { apiKey: API_KEY },
    transports: ["websocket"],
    upgrade: false,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => cb.onConnect?.());
  socket.on("disconnect", (reason) => cb.onDisconnect?.(reason));
  socket.on("connect_error", (err: Error) => cb.onError?.(err));

  socket.on("prices", (payload: PricesPayload) => {
    try {
      cb.onPrices(normalize(payload));
    } catch (e) {
      cb.onError?.(e as Error);
    }
  });

  return socket;
}
