import { PluggyClient } from 'pluggy-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clientId = process.env.VITE_PLUGGY_CLIENT_ID || process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.VITE_PLUGGY_CLIENT_SECRET || process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing Pluggy credentials' });
    }

    const client = new PluggyClient({
      clientId,
      clientSecret,
    });

    const connectToken = await client.createConnectToken();
    return res.status(200).json({ accessToken: connectToken.accessToken });
  } catch (error) {
    console.error('Error generating Pluggy connect token:', error);
    return res.status(500).json({ error: 'Failed to generate connect token' });
  }
}
