import { PluggyClient } from 'pluggy-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing Pluggy credentials' });
    }

    const client = new PluggyClient({
      clientId,
      clientSecret,
    });

    const token = await client.createConnectToken();
    return res.status(200).json({ accessToken: token.accessToken });
  } catch (error) {
    console.error('Error generating Pluggy connect token:', error);
    return res.status(500).json({ error: 'Failed to generate connect token' });
  }
}
