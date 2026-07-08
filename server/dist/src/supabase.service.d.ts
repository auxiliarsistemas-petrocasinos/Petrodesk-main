import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private supabase;
    constructor();
    get client(): SupabaseClient<any, "public", "public", any, any>;
    uploadFile(bucket: string, path: string, fileBuffer: Buffer, mimetype: string): Promise<string>;
}
