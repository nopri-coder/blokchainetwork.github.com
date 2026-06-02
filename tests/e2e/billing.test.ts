import { describe, it, expect } from 'vitest';

describe('E2E: Billing API Flow', () => {
  const BASE_URL = process.env.API_URL || 'http://localhost:8080';
  const API_KEY = process.env.API_KEY || 'dev-key-12345';

  describe('Complete Billing Workflow', () => {
    it('should complete full billing flow', async () => {
      const customerId = '550e8400-e29b-41d4-a716-446655440000';
      const invoiceNumber = `INV-E2E-${Date.now()}`;

      // 1. Send invoice
      const sendResponse = await fetch(`${BASE_URL}/api/v1/kirim-tagihan-isp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          customerId,
          invoiceNumber,
          amount: 100000,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'E2E Test Invoice',
        }),
      });

      expect(sendResponse.status).toBe(200);
      const sendData = await sendResponse.json();
      expect(sendData.success).toBe(true);

      // 2. Retrieve invoice details
      const detailsResponse = await fetch(
        `${BASE_URL}/api/v1/tagihan/${invoiceNumber}`,
        {
          headers: { 'X-API-Key': API_KEY },
        }
      );

      expect(detailsResponse.status).toBe(200);
      const detailsData = await detailsResponse.json();
      expect(detailsData.data.invoiceNumber).toBe(invoiceNumber);

      // 3. Get billing history
      const historyResponse = await fetch(
        `${BASE_URL}/api/v1/pelanggan/${customerId}/riwayat?limit=10`,
        {
          headers: { 'X-API-Key': API_KEY },
        }
      );

      expect(historyResponse.status).toBe(200);
      const historyData = await historyResponse.json();
      expect(Array.isArray(historyData.data)).toBe(true);
    });

    it('should validate system endpoints', async () => {
      // Health check
      const healthResponse = await fetch(`${BASE_URL}/health`);
      expect(healthResponse.status).toBe(200);

      // Version check
      const versionResponse = await fetch(`${BASE_URL}/version`);
      expect(versionResponse.status).toBe(200);

      // Root endpoint
      const rootResponse = await fetch(`${BASE_URL}/`);
      expect(rootResponse.status).toBe(200);
    });
  });
});
