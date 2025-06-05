import getConnection from "../../models/db.js";

const getCodeGenerated = async (req, res) => {
    
    const { id } = req.params;

    let conn;
    try {
        conn = await getConnection();

        const results = await conn.query('SELECT code FROM mql5_strategies WHERE id_prompt = ?', [id]);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar codigo' });
    } finally {
        if (conn) conn.release();
    }
}

export default getCodeGenerated;