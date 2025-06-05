import getConnection from "../../models/db.js";

const createFavoriteSymbol = async (req, res) => {
    try {
        const conn = await getConnection();

        const { userId, symbol, exchange, name, category } = req.body;

        await conn.query(
            'INSERT INTO symbols (user_id, symbol, exchange, name, category) VALUES (?, ?, ?, ?, ?)',
            [userId, symbol, exchange, name, category]
        ); 

        conn.release();
        res.status(201).json({ message: 'Símbolo salco em favoritos com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao salvar o símbolo' });
    }
}

const deleteFavoriteSymbol = async (req, res) => {
    try {
        const conn = await getConnection();

        const { userId, symbol } = req.body;

        await conn.query(
            'DELETE FROM symbols WHERE user_id = ? AND symbol = ?',
            [userId, symbol]
        );

        conn.release();
        res.status(200).json({ message: 'Símbolo removido dos favoritos com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao remover o símbolo dos favoritos' });
    }
}

const getFavoriteSymbols = async (req, res) => {
    try {
        const conn = await getConnection();

        const { userId } = req.params;

        const rows = await conn.query(
            'SELECT * FROM symbols WHERE user_id = ?',
            [userId]
        );

        conn.release();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar os símbolos favoritos' });
    }
}

const favorites = {
    createFavoriteSymbol,
    deleteFavoriteSymbol,
    getFavoriteSymbols
}

export default favorites;