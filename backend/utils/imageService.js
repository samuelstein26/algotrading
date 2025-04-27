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
    console.log('I am here');
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
