import getConnection from "../../models/db.js";

const createContato = async (req, res) => {
    
    const { nome, email, assunto, mensagem } = req.body;

    try {
        const conn = await getConnection();

        const results = await conn.query('INSERT INTO contato (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)',
            [nome, email, assunto, mensagem]);

        conn.release();
        res.status(200).json({ message: 'Contato registrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar contato' });
    }
}

export default createContato;