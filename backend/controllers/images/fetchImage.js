import { getBase64Image } from "../../utils/imageService.js";
import path from 'path';
import fs from 'fs';

const fetchImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(process.cwd(), 'uploads', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Imagem não encontrada' });
        }

        const { image } = await getBase64Image(filePath, filename);
        res.json( {image} );
    } catch (err) {
        console.error('Erro ao buscar imagem:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export default fetchImage;