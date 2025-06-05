import getConnection from "../../models/db.js";
import { deleteImagePost } from "../images/deleteImagePost.js"

const deletePost = async (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ message: 'ID do post não fornecido' });
    }
    
    try {
        deleteImagePost(id, false, true);  

        const conn = await getConnection();

        await conn.query('DELETE FROM posts WHERE id = ?', [id]);

        conn.release();
        res.json({ message: 'Post e arquivos associados excluídos com sucesso' });
    } catch (err) {
        console.error('Erro ao excluir post:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export default deletePost;