import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from '@supabase/supabase-js';
import WebSocket from 'ws';

type RealtimeTransport = NonNullable<
  NonNullable<SupabaseClientOptions<'public'>['realtime']>['transport']
>;

// `ws` implements the browser WebSocket contract at runtime. Its event types are
// nominally narrower than realtime-js' DOM event types, so keep the compatibility
// assertion isolated at this vendor boundary and exercise it in Node 20 tests.
const nodeWebSocketTransport = WebSocket as unknown as RealtimeTransport;

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or Key not provided. Storage features may not work.');
    }

    this.supabase = createClient(supabaseUrl || '', supabaseKey || '', {
      realtime: { transport: nodeWebSocketTransport },
    });
  }

  get client() {
    return this.supabase;
  }

  async uploadFile(bucket: string, path: string, fileBuffer: Buffer, mimetype: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to upload file to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }
}
