import getConnection from '../../models/db.js';

const getList = async (req, res) => {
    let conn;
    try {
        const { userId } = req.params;

        conn = await getConnection();

        const [votes] = await conn.query(
            'SELECT post_id, vote_type FROM post_votes WHERE user_id = ?',
            [userId]
        );

        res.json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar votos' });
    } finally {
        if (conn) conn.release();
    }
}

const createVote = async (req, res) => {
    let conn;
    try {
        const { userId, postId, vote_type } = req.body;

        // Validação básica
        if (!userId || !postId || !['like', 'dislike'].includes(vote_type)) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        conn = await getConnection();

        // Verifica se já existe um voto
        const [existing] = await conn.query(
            'SELECT vote_id, vote_type FROM post_votes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (existing && existing.vote_type === vote_type) {
            return res.status(400).json({ error: 'Usuário já votou neste post' });
        } else {
            // Cria novo voto
            await conn.query(
                'INSERT INTO post_votes (post_id, user_id, vote_type) VALUES (?, ?, ?)',
                [postId, userId, vote_type]
            );
        }

        res.status(201).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar voto' });
    } finally {
        if (conn) conn.release();
    }
}

const editVote = async (req, res) => {
    let conn;
    try {
        const { postId, userId, vote_type } = req.body;

        if (!['like', 'dislike'].includes(vote_type)) {
            return res.status(400).json({ error: 'Tipo de voto inválido' });
        }

        conn = await getConnection();

        // Verifica se o voto existe
        const [existing] = await conn.query(
            'SELECT vote_id FROM post_votes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Voto não encontrado' });
        }

        // Atualiza o voto
        await conn.query(
            'UPDATE post_votes SET vote_type = ? WHERE user_id = ? AND post_id = ?',
            [vote_type, userId, postId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar voto' });
    } finally {
        if (conn) conn.release();
    }
}

const deleteVote = async (req, res) => {
    let conn;
    try {
        const { postId, userId } = req.params;

        conn = await getConnection();

        // Verifica se o voto existe
        const [existing] = await conn.query(
            'SELECT vote_id FROM post_votes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Voto não encontrado' });
        }

        // Remove o voto
        await conn.query(
            'DELETE FROM post_votes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover voto' });
    } finally {
        if (conn) conn.release();
    }
}

const votes = {
    getList,
    createVote,
    editVote,
    deleteVote
}

export default votes;