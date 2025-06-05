import getConnection from "../../models/db.js";

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

const newsletterInsert = async (req, res) => {
    try {
        const email = req.user;

        if (!email || !email.includes('@')) {
            return res.status(200).json({ success: false, message: 'Por favor, forneça um e-mail válido' });
        }

        if (!validateEmail(email)) {
            return res.status(200).json({ 
                success: false,
                message: 'Email inválido'
            });
        }
        
        const conn = await getConnection();
        const [existing] = await conn.query('SELECT * FROM newsletter WHERE email = ?', [user.id]);

        if (existing) {
            return res.status(200).json({ 
                success: false,
                message: 'Usuário ja cadastrado'
            });
        }

        await conn.query('INSERT INTO newsletter (email) VALUES (?)', [email]);

        conn.release();

        res.status(200).json({
            success: true,
            message: 'Usuário cadastrado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao solicitar getMe:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar informações do usuário'
        });
    }
}

export default newsletterInsert;