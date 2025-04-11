import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { RoomServiceClient } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

export default async function handleToken(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 验证 Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if(token !== apiSecret){
        return res.status(401).json({ error: 'Unauthorized' }); 
    }

    if (!apiKey || !apiSecret || !wsUrl) {
        return res.status(500).json({ error: "Server misconfigured" });
      }

    try {
        const livekitHost = wsUrl?.replace("wss://", "https://");
        const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        let clearedRooms = [];
        
        // 读取uploads下的所有子文件夹
        const roomDirs = fs.readdirSync(uploadDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const roomName of roomDirs) {
            console.log(`Checking room: ${roomName}`);
            try {
                const participants = await roomService.listParticipants(roomName);
                console.log(`Number of participants: ${participants.length}`);
                if (participants.length === 0) {
                    const roomUploadDir = path.join(uploadDir, roomName);
                    fs.rmSync(roomUploadDir, { recursive: true, force: true });
                    clearedRooms.push(roomName);
                }
            } catch (error) {
                console.error(`Error checking room: ${roomName}`, error);
                // 如果房间不存在，也删除对应的上传文件夹
                if (error instanceof Error && (error as any).status === 404) {
                    const roomUploadDir = path.join(uploadDir, roomName);
                    fs.rmSync(roomUploadDir, { recursive: true, force: true });
                    clearedRooms.push(roomName);
                }
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: `Cleared uploads for ${clearedRooms.length} empty or non-existent rooms`,
            clearedRooms
        });
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Error deleting room files' });
    }
}
