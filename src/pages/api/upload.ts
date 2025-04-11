import { NextApiRequest, NextApiResponse } from 'next';
import { TokenVerifier } from 'livekit-server-sdk';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证 Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // 验证 LiveKit token
    const tv = new TokenVerifier(apiKey || '', apiSecret || '');
    const claims = tv.verify(token);
    if (!claims) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 限制文件大小为 5MB
    });
    console.log('form', form);
    try {
      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      let file = undefined
      if(Array.isArray(files.file)){
        if(files.file.length === 0){
            return res.status(400).json({ error: 'Empty file' });
        }
        file = files.file[0] as formidable.File;
      }
      

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      console.log('file.mimetype', file.mimetype);
      if (!allowedTypes.includes(file.mimetype || '')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      // 处理文件保存逻辑
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(uploadDir, fileName);

      await fs.promises.copyFile(file.filepath, newPath);

      return res.status(200).json({
        url: `/uploads/${fileName}`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Error processing upload' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}