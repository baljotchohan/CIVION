import { renderHook } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';

// Mock WebSocket
class MockWebSocket {
    onopen: () => void = () => { };
    onmessage: (event: any) => void = () => { };
    onerror: (error: any) => void = () => { };
    onclose: () => void = () => { };
    readyState: number = 0;
    send = jest.fn();
    close = jest.fn();

    constructor(url: string) {
        setTimeout(() => this.onopen(), 0);
    }
}

(global as any).WebSocket = MockWebSocket;

describe('useWebSocket', () => {
    it('should initialize with disconnected state', () => {
        const { result } = renderHook(() => useWebSocket());

        expect(result.current.connected).toBe(false);
        expect(result.current.events).toEqual([]);
    });

    it('should update connected state when socket opens', async () => {
        const { result } = renderHook(() => useWebSocket());

        // Wait for the mock onopen to be called
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(result.current.connected).toBe(true);
    });
});
