import getConnection from "../../models/db.js";

const fetchUserName = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório' });
        }

        const conn = await getConnection();

        const usuario = await conn.query(
            'SELECT nome, sobrenome FROM usuario WHERE id = ?',
            [userId]
        );

        conn.release();

        if (!usuario || usuario.length === 0) {
            return res.status(404).json({ message: 'Nenhum usuario encontrado' });
        }

        res.json(usuario[0]);
    } catch (err) {
        console.error('Erro ao buscar o usuario:', err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export default fetchUserName;