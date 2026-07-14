import { SupabaseService } from '../../src/supabase.service';
import WebSocket from 'ws';

describe('SupabaseService runtime compatibility', () => {
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseKey = process.env.SUPABASE_KEY;

  afterAll(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = originalSupabaseUrl;
    }

    if (originalSupabaseKey === undefined) {
      delete process.env.SUPABASE_KEY;
    } else {
      process.env.SUPABASE_KEY = originalSupabaseKey;
    }
  });

  it('constructs on the supported Node 20 runtime without opening a remote connection', () => {
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.SUPABASE_KEY = 'local-test-key';
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    try {
      const service = new SupabaseService();

      expect(service.client.realtime.transport).toBe(WebSocket);
      expect(service.client.storage).toBeDefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
