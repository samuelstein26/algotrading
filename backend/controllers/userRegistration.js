import getConnection from '../models/db.js';
import pw from '../utils/passwordUtils.js'

const userRegistration = async (req, res) => {
    const { nome, sobrenome, email, telefone, estadoID, cidadeID, cidadeNome, username, password } = req.body;
    console.log(req.body);
  
    // Validation
    if (!nome || !sobrenome || !email || !telefone || !estadoID || !cidadeID || !cidadeNome || !username || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }
  
    let conn;
    try {
      // Get database connection
      conn = await getConnection();
      
      // Start transaction
      await conn.query('START TRANSACTION');

      // Check if user already exists
      const [userEmail] = await conn.query('SELECT * FROM conta_usuario WHERE email = ?', [email]);
      if (userEmail) {
        await conn.query('ROLLBACK');
        conn.release();
        return res.status(400).json({ message: 'Usuário já cadastrado.' });
      }

      // Hash password
    
      const hashedPassword = await pw.hashPassword(password);

      // Insert into conta_usuario
      const contaUsuarioResult = await conn.query(
        'INSERT INTO conta_usuario (email, username, senha) VALUES (?, ?, ?)',
        [email, username, hashedPassword]
      );

      // Get the inserted account ID
      const [idConta] = await conn.query(
        'SELECT id FROM conta_usuario WHERE email = ?', 
        [email]
      );
      
      if (!idConta) {
        throw new Error('Failed to retrieve created account ID');
      }

      const id = idConta.id;

      // Check if city exists
      const [cidadecheck] = await conn.query(
        'SELECT id FROM cidade WHERE id = ?',
        [cidadeID]
      );

      if (!cidadecheck) {
        await conn.query(
          'INSERT INTO cidade (id, nome) VALUES (?, ?)',
          [cidadeID, cidadeNome]
        );
      }

      // Insert into usuario
      const usuarioResult = await conn.query(
        'INSERT INTO usuario (idContaUsuario, nome, sobrenome, telefone, idEstado, idCidade) VALUES (?, ?, ?, ?, ?, ?)',
        [id, nome, sobrenome, telefone, estadoID, cidadeID]
      );

      // Commit transaction
      await conn.query('COMMIT');
      conn.release();

      res.status(201).json({ 
        message: 'Usuário cadastrado com sucesso!',
        userId: id
      });

    } catch (err) {
      // Rollback transaction if error occurs
      if (conn) {
        await conn.query('ROLLBACK');
        conn.release();
      }
      console.error('Registration error:', err);
      res.status(500).json({ 
        message: 'Erro durante o cadastro.',
        error: err.message 
      });
    }
};

export default userRegistration;