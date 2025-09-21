import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { WorkOrder, ManufacturingOrder } from '../types';

interface RealtimeUpdate {
  id: string;
  type: 'work_order' | 'manufacturing_order' | 'timer' | 'status_change';
  data: any;
  timestamp: number;
}

interface UseRealtimeUpdatesOptions {
  onWorkOrderUpdate?: (workOrder: WorkOrder) => void;
  onManufacturingOrderUpdate?: (manufacturingOrder: ManufacturingOrder) => void;
  onTimerUpdate?: (workOrderId: string, elapsedTime: number) => void;
  onStatusChange?: (id: string, type: 'work_order' | 'manufacturing_order', status: string) => void;
}

export const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}) => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((message: any) => {
    const update: RealtimeUpdate = {
      id: message.id || Date.now().toString(),
      type: message.type,
      data: message.data,
      timestamp: message.timestamp || Date.now()
    };

    setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates

    // Handle specific update types
    switch (message.type) {
      case 'work_order_update':
        options.onWorkOrderUpdate?.(message.data);
        break;
      case 'manufacturing_order_update':
        options.onManufacturingOrderUpdate?.(message.data);
        break;
      case 'timer_update':
        options.onTimerUpdate?.(message.data.workOrderId, message.data.elapsedTime);
        break;
      case 'status_change':
        options.onStatusChange?.(message.data.id, message.data.type, message.data.status);
        break;
    }
  }, [options]);

  const { isConnected: wsConnected, sendMessage } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
    onMessage: handleMessage,
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
    onError: () => setIsConnected(false)
  });

  // Subscribe to specific channels
  const subscribeToWorkOrder = useCallback((workOrderId: string) => {
    sendMessage({
      type: 'subscribe',
      channel: 'work_order',
      id: workOrderId
    });
  }, [sendMessage]);

  const subscribeToManufacturingOrder = useCallback((manufacturingOrderId: string) => {
    sendMessage({
      type: 'subscribe',
      channel: 'manufacturing_order',
      id: manufacturingOrderId
    });
  }, [sendMessage]);

  const subscribeToAllWorkOrders = useCallback(() => {
    sendMessage({
      type: 'subscribe',
      channel: 'work_orders'
    });
  }, [sendMessage]);

  const subscribeToAllManufacturingOrders = useCallback(() => {
    sendMessage({
      type: 'subscribe',
      channel: 'manufacturing_orders'
    });
  }, [sendMessage]);

  // Unsubscribe from channels
  const unsubscribeFromWorkOrder = useCallback((workOrderId: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel: 'work_order',
      id: workOrderId
    });
  }, [sendMessage]);

  const unsubscribeFromManufacturingOrder = useCallback((manufacturingOrderId: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel: 'manufacturing_order',
      id: manufacturingOrderId
    });
  }, [sendMessage]);

  // Send status updates
  const updateWorkOrderStatus = useCallback((workOrderId: string, status: string) => {
    sendMessage({
      type: 'work_order_status_update',
      workOrderId,
      status,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  const updateManufacturingOrderStatus = useCallback((manufacturingOrderId: string, status: string) => {
    sendMessage({
      type: 'manufacturing_order_status_update',
      manufacturingOrderId,
      status,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  // Timer controls
  const startTimer = useCallback((workOrderId: string) => {
    sendMessage({
      type: 'start_timer',
      workOrderId,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  const pauseTimer = useCallback((workOrderId: string) => {
    sendMessage({
      type: 'pause_timer',
      workOrderId,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  const stopTimer = useCallback((workOrderId: string) => {
    sendMessage({
      type: 'stop_timer',
      workOrderId,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  return {
    isConnected: wsConnected && isConnected,
    updates,
    subscribeToWorkOrder,
    subscribeToManufacturingOrder,
    subscribeToAllWorkOrders,
    subscribeToAllManufacturingOrders,
    unsubscribeFromWorkOrder,
    unsubscribeFromManufacturingOrder,
    updateWorkOrderStatus,
    updateManufacturingOrderStatus,
    startTimer,
    pauseTimer,
    stopTimer
  };
};
