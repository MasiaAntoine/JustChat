import { useEffect, useRef } from "react";
import { setEmitEvent, setSocket } from "../redux/reducers/socketReducer";
import { useDispatch, useSelector } from "react-redux";
import { IAppDispatch, IRootState } from "../redux/store";
import { ISocketEvent } from "../apis/ISocketEvent";

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

const useWebSocket = (url: string) => {
  const user = useSelector((s: IRootState) => s.user);
  const dispatch = useDispatch<IAppDispatch>();
  const socketRef = useRef<WebSocket | null>(null);
  const userRef = useRef(user);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  userRef.current = user;

  const emitEvent = (type: ISocketEvent, evt: unknown) => {
    try {
      const socket = socketRef.current;
      if (!socket) throw new Error("Socket is not initialized");
      if (socket.readyState !== WebSocket.OPEN) throw new Error("Socket is closed");
      socket.send(JSON.stringify({ type, evt }));
    } catch (error) {
      console.error("[WebSocket] emit error:", error);
    }
  };

  useEffect(() => {
    let closed = false;
    let currentWs: WebSocket | null = null;

    const connect = (): (() => void) => {
      const ws = new WebSocket(url);
      currentWs = ws;
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        dispatch(setSocket(ws));
        dispatch(setEmitEvent(emitEvent));
        const currentUser = userRef.current;
        if (currentUser._id) {
          ws.send(JSON.stringify({ type: ISocketEvent.USER_IS_CONNECTED, evt: currentUser }));
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        dispatch(setSocket(undefined));
        if (closed) return;
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            cleanupRef.current?.();
            cleanupRef.current = connect();
          }, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      return () => {
        closed = true;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (currentWs) {
          currentWs.close();
          currentWs = null;
        }
      };
    };

    cleanupRef.current = connect();
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [url, dispatch]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleBeforeUnload = () => {
    const currentUser = userRef.current;
    if (socketRef.current?.readyState === WebSocket.OPEN && currentUser._id) {
      socketRef.current.send(
        JSON.stringify({ type: ISocketEvent.USER_IS_DISCONNECTED, evt: currentUser })
      );
    }
  };
};

export default useWebSocket;
