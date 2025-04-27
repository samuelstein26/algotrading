import getConnection from '../models/db.js';

const getMe = async (req, res) => {
    try {
        const user = req.user;

        console.log(user);

        
        //const conn = await getConnection();
        //const [userDB] = await conn.query('SELECT * FROM usuario WHERE id = ?', [user.id]);
        //conn.release();

        res.status(200).json({
            user: {
                id: req.user.userId,
                email: req.user.email
            },
        });

    } catch (error) {
        console.error('Erro ao solicitar getMe:', error);
        res.status(500).json({ 
            
        });
    }
}

export default getMe;
