import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

type UseSignalROptions = {
  url: string;
  onConnected?: (connection: signalR.HubConnection) => void;
  onDisconnected?: () => void;
};

export function useSignalR({ url, onConnected, onDisconnected }: UseSignalROptions) {
  const [connected, setConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect() // ✅ sin parámetro, usa la política por defecto
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ Conectado a SignalR:", url);
        setConnected(true);
        onConnected?.(connection);
      } catch (err) {
        console.error("❌ Error al conectar con SignalR:", err);
      }
    };

    startConnection();

    connection.onclose(() => {
      console.warn("🔌 Desconectado de SignalR");
      setConnected(false);
      onDisconnected?.();
    });

    return () => {
      connection.stop().catch((err) => console.error("Error al detener conexión:", err));
    };
 }, [url, onConnected, onDisconnected]);

  const send = async (method: string, ...args: any[]) => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.invoke(method, ...args);
      } catch (err) {
        console.error(`Error al invocar ${method}:`, err);
      }
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    connectionRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
  if (!connectionRef.current) return;
  if (callback) {
    connectionRef.current.off(event, callback);
  } else {
    connectionRef.current.off(event);
  }
};

  return { connected, connection: connectionRef.current, send, on, off };
}
