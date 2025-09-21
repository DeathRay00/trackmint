import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import type { WorkOrder } from '../types';

interface RealtimeTimerProps {
  workOrder: WorkOrder;
  onStatusChange?: (status: string) => void;
  onTimeUpdate?: (elapsedTime: number) => void;
}

export const RealtimeTimer = ({ 
  workOrder, 
  onStatusChange, 
  onTimeUpdate 
}: RealtimeTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(workOrder.status === 'Started');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const {
    isConnected,
    subscribeToWorkOrder,
    unsubscribeFromWorkOrder,
    updateWorkOrderStatus,
    startTimer,
    pauseTimer,
    stopTimer
  } = useRealtimeUpdates({
    onWorkOrderUpdate: (updatedWorkOrder) => {
      if (updatedWorkOrder.id === workOrder.id) {
        onStatusChange?.(updatedWorkOrder.status);
        setLastUpdate(new Date());
      }
    },
    onTimerUpdate: (workOrderId, time) => {
      if (workOrderId === workOrder.id) {
        setElapsedTime(time);
        onTimeUpdate?.(time);
      }
    }
  });

  useEffect(() => {
    // Subscribe to this work order's updates
    subscribeToWorkOrder(workOrder.id);

    return () => {
      unsubscribeFromWorkOrder(workOrder.id);
    };
  }, [workOrder.id, subscribeToWorkOrder, unsubscribeFromWorkOrder]);

  useEffect(() => {
    setIsRunning(workOrder.status === 'Started');
  }, [workOrder.status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    startTimer(workOrder.id);
    updateWorkOrderStatus(workOrder.id, 'Started');
    setIsRunning(true);
  }, [workOrder.id, startTimer, updateWorkOrderStatus]);

  const handlePause = useCallback(() => {
    pauseTimer(workOrder.id);
    updateWorkOrderStatus(workOrder.id, 'Paused');
    setIsRunning(false);
  }, [workOrder.id, pauseTimer, updateWorkOrderStatus]);

  const handleStop = useCallback(() => {
    stopTimer(workOrder.id);
    updateWorkOrderStatus(workOrder.id, 'Completed');
    setIsRunning(false);
  }, [workOrder.id, stopTimer, updateWorkOrderStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" />Ready</Badge>;
      case 'Started':
        return <Badge className="bg-green-100 text-green-800"><Play className="mr-1 h-3 w-3" />Started</Badge>;
      case 'Paused':
        return <Badge className="bg-yellow-100 text-yellow-800"><Pause className="mr-1 h-3 w-3" />Paused</Badge>;
      case 'Completed':
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workOrder.workOrderNumber}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(workOrder.status)}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {workOrder.bomOperation.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer Display */}
        {workOrder.status === 'Started' && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-mono font-bold">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-muted-foreground">Active Time</div>
            {lastUpdate && (
              <div className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Status Controls */}
        <div className="flex gap-2">
          {workOrder.status === 'Ready' && (
            <Button 
              size="sm" 
              onClick={handleStart}
              disabled={!isConnected}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          
          {workOrder.status === 'Started' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handlePause}
                disabled={!isConnected}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button 
                size="sm" 
                onClick={handleStop}
                disabled={!isConnected}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}
          
          {workOrder.status === 'Paused' && (
            <>
              <Button 
                size="sm" 
                onClick={handleStart}
                disabled={!isConnected}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleStop}
                disabled={!isConnected}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}
          
          {workOrder.status === 'Completed' && (
            <Button size="sm" variant="outline" disabled className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </Button>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
            <WifiOff className="inline h-4 w-4 mr-1" />
            Disconnected from real-time updates
          </div>
        )}
      </CardContent>
    </Card>
  );
};
