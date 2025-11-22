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

const onConnectedRef = useRef<UseSignalROptions["onConnected"]>(onConnected);
const onDisconnectedRef = useRef<UseSignalROptions["onDisconnected"]>(onDisconnected);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  useEffect(() => {
    onDisconnectedRef.current = onDisconnected;
  }, [onDisconnected]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ Conectado a SignalR:", url);
        setConnected(true);
        onConnectedRef.current?.(connection);
      } catch (err) {
        console.error("❌ Error al conectar con SignalR:", err);
      }
    };

    startConnection();

    connection.onclose(() => {
      console.warn("🔌 Desconectado de SignalR");
      setConnected(false);
      onDisconnectedRef.current?.();
    });

    return () => {
      connection
        .stop()
        .catch((err) => console.error("Error al detener conexión:", err));
    };
  }, [url]);

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