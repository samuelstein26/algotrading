import getConnection from '../models/db.js';

const usernameCheck = async (req, res) => {
    const username = req.query.username || req.body.username;
    console.log(req.body);

    if (!username || username.trim() === '') {
        return res.status(400).json({
            error: 'Username é obrigatório'
        });
    }

    try {
        const conn = await getConnection();
        const [user] = await conn.query('SELECT * FROM conta_usuario WHERE username = ?', [username]);
        conn.release();

        console.log(user);

        res.json({
            isAvailable: !user,
            message: user ? 'Username em uso' : 'Username disponível'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export default usernameCheck 