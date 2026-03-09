import {ref} from "vue";

export function useDashboardSocket(url: string) {
    const isConnected = ref(false);
    const message = ref<unknown>(null);
    const reconnectError = ref(false);
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;
    let shouldReconnect = true;

    const maxReconnectAttempts = 10000;
    const reconnectDelayMs = 1000;

    const connect = () => {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        shouldReconnect = true;

        socket = new WebSocket(url);

        socket.onopen = () => {
            isConnected.value = true;
            reconnectError.value = false;
            reconnectAttempts = 0;
        };

        socket.onclose = () => {
            isConnected.value = false;
            if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts += 1;
                reconnectTimer = setTimeout(() => {
                    connect();
                }, reconnectDelayMs);
                return;
            }

            if (shouldReconnect) {
                reconnectError.value = true;
            }
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
        shouldReconnect = false;
        reconnectAttempts = 0;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        socket?.close();
        socket = null;
    };

    return {isConnected, message, reconnectError, connect, disconnect};
}
