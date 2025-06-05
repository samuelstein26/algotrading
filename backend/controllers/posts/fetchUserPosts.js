import getConnection from "../../models/db.js";

const fetchUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório' });
        }

        const conn = await getConnection();

        const posts = await conn.query(
            'SELECT * FROM posts WHERE user_id = ?',
            [userId]
        );

        conn.release();

        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'Nenhum post encontrado' });
        }

        res.json(posts);
    } catch (err) {
        console.error('Erro ao buscar posts:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export default fetchUserPosts;