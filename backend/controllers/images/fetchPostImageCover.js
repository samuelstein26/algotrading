import getConnection from "../../models/db.js";

const fetchPostImageCover = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: 'ID do post é obrigatório' });
        }

        const conn = await getConnection();
        
        const [image] = await conn.query(
            'SELECT storage_path FROM post_image_cover WHERE post_id = ?', 
            [id]
        );
        
        conn.release();
        
        if (!image || image.length === 0) {
            return res.status(404).json({ message: 'Nenhuma imagem encontrada' });
        }

        res.json(image);
    }
    catch (err) {
        console.error('Erro ao buscar imagem:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export default fetchPostImageCover;