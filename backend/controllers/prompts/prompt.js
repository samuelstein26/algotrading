import getConnection from '../../models/db.js';

const getListPrompt = async (req, res) => {
    let conn;
    try {
        const { userId, type } = req.params;

        conn = await getConnection();

        const results = await conn.query(
            'SELECT * FROM prompt WHERE user_id = ? and tipo = ?',
            [userId, type]
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar prompt' });
    } finally {
        if (conn) conn.release();
    }
}

const createPrompt = async (req, res) => {
    let conn;
    try {
        const { userId, title, content, type, code } = req.body;

        if (!userId || !content || !title || !['algo', 'modelo'].includes(type)) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        conn = await getConnection();

        const result = await conn.query(
            'INSERT INTO prompt (user_id, titulo, conteudo, tipo) VALUES (?, ?, ?, ?)',
            [userId, title, content, type]
        );
        
        if (type === 'algo') {
            const newId = (result.insertId);
            await conn.query(
                'INSERT INTO mql5_strategies (id_prompt, code) VALUES (?, ?)',
                [newId, code]
            )
        }

        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar/atualizar prompt' });
    } finally {
        if (conn) conn.release();
    }
}

const getPrompt = async (req, res) => {
    let conn;
    try {
        const { prompId } = req.params;

        conn = await getConnection();

        const [result] = await conn.query(
            'select * FROM prompt WHERE id = ?',
            [prompId]
        );

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar prompt' });
    } finally {
        if (conn) conn.release();
    }
}

const deletePrompt = async (req, res) => {
    let conn;
    try {
        const { promptId, userId } = req.params;

        conn = await getConnection();

        // Verifica se o prompt existe
        const [existing] = await conn.query(
            'SELECT id FROM prompt WHERE id = ?',
            [promptId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Prompt não encontrado' });
        }

        // Remove o prompt
        await conn.query(
            'DELETE FROM prompt WHERE id = ? AND user_id = ?',
            [promptId, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover prompt' });
    } finally {
        if (conn) conn.release();
    }
}

const updatePrompt = async (req, res) => {
    let conn;
    try {
        const { promptId, title, content, code } = req.body;

        // Acessando os dados corretamente do objeto aninhado
        if (!promptId || !title || !content || !code) {
            return res.status(400).json({ error: 'Dados do prompt incompletos' });
        }

        conn = await getConnection();

        // Verificando se o prompt existe antes de atualizar
        const [existing] = await conn.query(
            'SELECT id FROM prompt WHERE id = ?',
            [promptId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Prompt não encontrado' });
        }

        await conn.query(
            'UPDATE prompt SET titulo = ?, conteudo = ? WHERE id = ?',
            [title, content, promptId]
        );

        await conn.query(
            'UPDATE mql5_strategies SET code = ? WHERE id_prompt = ?',
            [code, promptId]
        );

        console.log('Atualizando algoritmo');
        console.log('code:', code);
        console.log('promptId:', promptId);



        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar prompt' });
    } finally {
        if (conn) conn.release();
    }
}

const prompts = {
    getListPrompt,
    createPrompt,
    getPrompt,
    deletePrompt,
    updatePrompt
}

export default prompts;