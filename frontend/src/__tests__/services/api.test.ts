import { apiService } from '../../services/api';
import type { User, WorkOrder, ManufacturingOrder } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'Operator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.token).toBe('mock-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
    });

    it('should handle login failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(
        apiService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should logout successfully', async () => {
      localStorage.setItem('auth_token', 'mock-token');

      const result = await apiService.logout();

      expect(result.success).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Work Orders', () => {
    it('should fetch work orders', async () => {
      const mockWorkOrders = [
        {
          id: '1',
          workOrderNumber: 'WO-001',
          status: 'Ready',
          plannedDuration: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockWorkOrders, total: 1 }),
      });

      const result = await apiService.getWorkOrders(1, 10);

      expect(result.data).toEqual(mockWorkOrders);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should create work order', async () => {
      const workOrderData = {
        manufacturingOrderId: 'mo-1',
        bomOperationId: 'op-1',
        plannedDuration: 60,
        comments: 'Test work order',
      };

      const mockCreatedWorkOrder = {
        id: '1',
        ...workOrderData,
        workOrderNumber: 'WO-001',
        status: 'Ready',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedWorkOrder,
      });

      const result = await apiService.createWorkOrder(workOrderData);

      expect(result.success).toBe(true);
      expect(result.data.workOrderNumber).toBe('WO-001');
    });

    it('should update work order', async () => {
      const updateData = {
        status: 'Started',
        comments: 'Updated comments',
      };

      const mockUpdatedWorkOrder = {
        id: '1',
        workOrderNumber: 'WO-001',
        status: 'Started',
        comments: 'Updated comments',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedWorkOrder,
      });

      const result = await apiService.updateWorkOrder('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('Started');
    });
  });

  describe('Manufacturing Orders', () => {
    it('should fetch manufacturing orders', async () => {
      const mockManufacturingOrders = [
        {
          id: '1',
          orderNumber: 'MO-001',
          productId: 'prod-1',
          product: {
            id: 'prod-1',
            name: 'Test Product',
            sku: 'TEST-001',
            category: 'Test',
            unitOfMeasure: 'pcs',
            unitCost: 10,
            stockQuantity: 100,
            reorderLevel: 20,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          bomId: 'bom-1',
          bom: {} as any,
          quantity: 10,
          status: 'Planned',
          priority: 'Medium',
          plannedStartDate: new Date(),
          plannedEndDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockManufacturingOrders, total: 1 }),
      });

      const result = await apiService.getManufacturingOrders(1, 10);

      expect(result.data).toEqual(mockManufacturingOrders);
      expect(result.total).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getWorkOrders()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors with JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' }),
      });

      await expect(apiService.getWorkOrders()).rejects.toThrow('Bad request');
    });

    it('should handle HTTP errors without JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(apiService.getWorkOrders()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('Authentication Headers', () => {
    it('should include auth token in requests when available', async () => {
      localStorage.setItem('auth_token', 'mock-token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      });

      await apiService.getWorkOrders();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/work-orders'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('should not include auth token when not available', async () => {
      localStorage.removeItem('auth_token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      });

      await apiService.getWorkOrders();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/work-orders'),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });
});
