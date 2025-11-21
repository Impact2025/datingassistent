import { NextApiRequest, NextApiResponse } from 'next';
import { liveChatSocketServer } from '@/lib/live-chat/socket-server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is just to initialize Socket.IO
  // The actual Socket.IO server is initialized in the liveChatSocketServer
  res.status(200).json({ status: 'Socket.IO endpoint ready' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};