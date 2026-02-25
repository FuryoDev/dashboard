import { ref } from "vue";

export function useDashboardSocket(url: string) {
  const isConnected = ref(false);
  const message = ref<unknown>(null);
  const reconnectError = ref(false);
  let socket: WebSocket | null = null;

  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      isConnected.value = true;
      reconnectError.value = false;
    };

    socket.onclose = () => {
      isConnected.value = false;
    };

    socket.onerror = () => {
      reconnectError.value = true;
    };

    socket.onmessage = (event) => {
      try {
        message.value = JSON.parse(event.data);
      } catch {
        message.value = event.data;
      }
    };
  };

  const disconnect = () => {
    socket?.close();
    socket = null;
  };

  return { isConnected, message, reconnectError, connect, disconnect };
}
