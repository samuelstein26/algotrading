import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Configuração do diretório de uploads
const uploadDir = '/uploads';

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

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

const deleteFiles = async (files) => {
    if (!files) {
        console.error('Nenhum arquivo fornecido para deletar');
        return;
    }

    try {
        if (Array.isArray(files)) {
            for (const file of files) {
                await deleteSingleFile(file.storage_path);
            }
        } else if (typeof files === 'object') {
            await deleteSingleFile(files.storage_path);
        }
    } catch (err) {
        console.error('Erro ao deletar arquivos:', err);
        throw err;
    }
};

const deleteSingleFile = async (filePath) => {
    if (!filePath) return;

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        } else {
            console.warn(`Arquivo não encontrado: ${filePath}`);
            return false;
        }
    } catch (err) {
        console.error(`Erro ao deletar arquivo ${filePath}:`, err);
        throw err;
    }
};

export { upload, deleteFiles };