import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = '/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { 
        fileSize: 30 * 1024 * 1024,
        fieldSize: 30 * 1024 * 1024
     } 
});

export default upload;