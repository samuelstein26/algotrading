import getConnection from '../models/db.js';
import tk from '../utils/jwtUtils.js';
import sendTempPasswordEmail from '../utils/emailService.js';
import pw from '../utils/passwordUtils.js';

const resetPassword = async (req, res) => {
    const { userId, currentPassword, newPassword, repeatPassword } = req.body;

    if (!currentPassword || !newPassword || !repeatPassword) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    if (newPassword !== repeatPassword) {
        return res.status(400).json({ message: 'As senhas devem ser iguais.' });
    }

    try {
        const conn = await getConnection();

        const [user] = await conn.query('SELECT * FROM conta_usuario WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ message: 'Usuário nao encontrado.' });
        }

        const isMatch = pw.comparePassword(currentPassword, user.senha);

        if (!isMatch) {
            return res.status(400).json({ message: 'Senha atual incorreta.' });
        }

        const password = await pw.hashPassword(newPassword);

        await conn.query('UPDATE conta_usuario SET senha = ?, data_senha_expiracao = ?, temp_senha = ? WHERE id = ?',
            [password, null, null, userId]
        );

        conn.release();
        res.json({ message: 'Senha alterada com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const login = async (req, res) => {
    console.log(req.body);
    const { emailUsername, password } = req.body;

    if (!emailUsername || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email ou username com senha.' });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUsername);
    let user = [];

    try {
        const conn = await getConnection();
        if (isEmail) {
            [user] = await conn.query('SELECT * FROM conta_usuario WHERE email = ?', [emailUsername]);
        } else {
            [user] = await conn.query('SELECT * FROM conta_usuario WHERE username = ?', [emailUsername]);
        }
        conn.release();

        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Verificar se a senha temporaria
        const dateNow = new Date(Date.now());
        let isMatch = false;

        if (user.temp_senha !== null && user.data_senha_expiracao < dateNow) {
            return res.status(400).json({ message: 'Senha temporária expirada' });
        }

        if (user.data_senha_expiracao !== null && dateNow < user.data_senha_expiracao) {
            isMatch = await pw.comparePassword(password, user.temp_senha);
            if (!isMatch) {
                return res.status(400).json({ message: 'Credenciais inválidas' });
            }
            req.body.userId = user.id;
            resetPassword(req);
        }

        isMatch = await pw.comparePassword(password, user.senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = tk.generateToken(user.id);

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find user
        const conn = await getConnection();
        const [user] = await conn.query('SELECT * FROM conta_usuario WHERE email = ?', [email]);

        console.log(user);

        if (!user) {
            return res.json({
                isFound: false,
                message: 'Conta de usuário não encontrada'
            });
        }

        // 2. Generate temp password
        const tempPassword = pw.generateTempPassword();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // 3. Update user
        user.temp_senha = await pw.hashPassword(tempPassword);
        user.data_senha_expiracao = expiresAt;

        await conn.query('UPDATE conta_usuario SET data_senha_expiracao = ?, temp_senha = ? WHERE id = ?',
            [user.data_senha_expiracao, user.temp_senha, user.id]
        );

        conn.release();

        // 4. Send email
        await sendTempPasswordEmail(email, tempPassword);

        res.json({
            isFound: true,
            message: 'Senha temporária enviada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao processar a requisição de esqueci minha senha', error);
        res.status(500).json({ message: 'Erro ao processar a requisição' });
    }
};

const user = {
    login,
    forgotPassword,
    resetPassword
}

export default user;