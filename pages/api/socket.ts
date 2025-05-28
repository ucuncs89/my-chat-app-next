import { NextApiRequest, NextApiResponse } from "next";
import { setupSocket } from "../../server/socket";

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: any) {
  const server = res.socket?.server as any;
  if (!server.io) {
    setupSocket(server, res);
    server.io = true;
  } else {
    res.end();
  }
}
