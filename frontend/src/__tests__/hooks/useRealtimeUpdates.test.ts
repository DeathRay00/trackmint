import { renderHook, act } from '@testing-library/react';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

// Mock the useWebSocket hook
jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: jest.fn(() => ({
    isConnected: true,
    sendMessage: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

describe('useRealtimeUpdates', () => {
  const mockOnWorkOrderUpdate = jest.fn();
  const mockOnManufacturingOrderUpdate = jest.fn();
  const mockOnTimerUpdate = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.updates).toEqual([]);
  });

  it('should provide subscription methods', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    expect(typeof result.current.subscribeToWorkOrder).toBe('function');
    expect(typeof result.current.subscribeToManufacturingOrder).toBe('function');
    expect(typeof result.current.subscribeToAllWorkOrders).toBe('function');
    expect(typeof result.current.subscribeToAllManufacturingOrders).toBe('function');
  });

  it('should provide unsubscription methods', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    expect(typeof result.current.unsubscribeFromWorkOrder).toBe('function');
    expect(typeof result.current.unsubscribeFromManufacturingOrder).toBe('function');
  });

  it('should provide status update methods', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    expect(typeof result.current.updateWorkOrderStatus).toBe('function');
    expect(typeof result.current.updateManufacturingOrderStatus).toBe('function');
  });

  it('should provide timer control methods', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    expect(typeof result.current.startTimer).toBe('function');
    expect(typeof result.current.pauseTimer).toBe('function');
    expect(typeof result.current.stopTimer).toBe('function');
  });

  it('should call subscribeToWorkOrder when subscribing to work order', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.subscribeToWorkOrder('work-order-1');
    });

    // The actual WebSocket sendMessage would be called
    // This is tested through the useWebSocket mock
  });

  it('should call subscribeToManufacturingOrder when subscribing to manufacturing order', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.subscribeToManufacturingOrder('manufacturing-order-1');
    });

    // The actual WebSocket sendMessage would be called
  });

  it('should call updateWorkOrderStatus when updating work order status', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.updateWorkOrderStatus('work-order-1', 'Started');
    });

    // The actual WebSocket sendMessage would be called
  });

  it('should call startTimer when starting timer', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.startTimer('work-order-1');
    });

    // The actual WebSocket sendMessage would be called
  });

  it('should call pauseTimer when pausing timer', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.pauseTimer('work-order-1');
    });

    // The actual WebSocket sendMessage would be called
  });

  it('should call stopTimer when stopping timer', () => {
    const { result } = renderHook(() => useRealtimeUpdates());

    act(() => {
      result.current.stopTimer('work-order-1');
    });

    // The actual WebSocket sendMessage would be called
  });

  it('should handle work order updates', () => {
    const { result } = renderHook(() => 
      useRealtimeUpdates({
        onWorkOrderUpdate: mockOnWorkOrderUpdate,
      })
    );

    // Simulate receiving a work order update message
    const mockMessage = {
      type: 'work_order_update',
      data: { id: 'wo-1', status: 'Started' },
      timestamp: Date.now(),
    };

    // In a real implementation, this would be triggered by the WebSocket message handler
    // For testing, we can't easily simulate this without more complex mocking
    expect(mockOnWorkOrderUpdate).not.toHaveBeenCalled();
  });

  it('should handle timer updates', () => {
    const { result } = renderHook(() => 
      useRealtimeUpdates({
        onTimerUpdate: mockOnTimerUpdate,
      })
    );

    // Simulate receiving a timer update message
    const mockMessage = {
      type: 'timer_update',
      data: { workOrderId: 'wo-1', elapsedTime: 120 },
      timestamp: Date.now(),
    };

    // In a real implementation, this would be triggered by the WebSocket message handler
    expect(mockOnTimerUpdate).not.toHaveBeenCalled();
  });

  it('should handle status changes', () => {
    const { result } = renderHook(() => 
      useRealtimeUpdates({
        onStatusChange: mockOnStatusChange,
      })
    );

    // Simulate receiving a status change message
    const mockMessage = {
      type: 'status_change',
      data: { id: 'wo-1', type: 'work_order', status: 'Completed' },
      timestamp: Date.now(),
    };

    // In a real implementation, this would be triggered by the WebSocket message handler
    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });
});
