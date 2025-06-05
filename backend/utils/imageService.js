import { v4 as uuidv4 } from 'uuid';
import Delta from 'quill-delta';
import path from 'path';
import fs from 'fs';

export async function processDeltaImages(deltaOps) {

    const ops = typeof deltaOps === 'string'
        ? JSON.parse(deltaOps, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ).ops
        : deltaOps.ops;

    const newDelta = new Delta();
    const imagePaths = [];
    let x = 1;

    for (const op of ops) {
        if (op.insert && typeof op.insert === 'object' && op.insert.image) {
            const imageData = op.insert.image;

            try {
                // Substitui a imagem pelo caminho do arquivo salvo
                const { filePath, originalName } = await saveBase64Image(imageData);
                newDelta.insert(filePath);

                imagePaths.push({
                    storagePath: filePath,
                    originalName: originalName,
                    displayOrder: x
                });

                x++;
            } catch (error) {
                console.error('Erro ao salvar imagem:', error);
            }
        } else {
            // Mantém outras operações inalteradas
            newDelta.push(op);
        }
    }

    return { processedDelta: newDelta, imagePaths: imagePaths };
}

export async function saveBase64Image(base64Data) {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image data');
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const filename = `${uuidv4()}.${ext}`;
    const filePath = path.join('./uploads', filename);
    const buffer = Buffer.from(matches[2], 'base64');

    await fs.promises.writeFile(filePath, buffer);

    return {
        filePath: filePath,
        originalName: `image.${ext}`
    };
}

export async function getBase64Image(filePath, filename) {
    try {
        const fileData = fs.readFileSync(filePath);
        const base64Image = `data:image/${path.extname(filename).substring(1)};base64,${fileData.toString('base64')}`;
        
        return ({ image: base64Image });
    } catch (error) {
        console.error('Erro ao converter imagem:', error);
        res.status(500).json({ error: 'Erro ao processar imagem' });
    }
}

export async function isBase64Image(str) {
    if (typeof str !== 'string') return false;
    
    // Padrão para base64 de imagem: data:image/[extensão];base64,...
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    
    // Verifica se é um caminho de arquivo (contém extensão de imagem e não começa com data:)
    const isFilePath = /\.(png|jpeg|jpg|gif|webp)$/i.test(str) && !str.startsWith('data:');
    
    return base64Regex.test(str) || (str.length > 1000 && !isFilePath);
}