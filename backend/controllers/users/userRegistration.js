import getConnection from '../../models/db.js';
import pw from '../../utils/passwordUtils.js'

const createUser = async (req, res) => {
  const { nome, sobrenome, email, telefone, estadoID, cidadeID, cidadeNome, username, password } = req.body;

  if (!nome || !sobrenome || !email || !telefone || !estadoID || !cidadeID || !cidadeNome || !username || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.query('START TRANSACTION');

    const [userEmail] = await conn.query('SELECT * FROM conta_usuario WHERE email = ?', [email]);
    if (userEmail) {
      await conn.query('ROLLBACK');
      conn.release();
      return res.status(400).json({ message: 'Usuário já cadastrado.' });
    }

    const hashedPassword = await pw.hashPassword(password);

    const contaUsuarioResult = await conn.query(
      'INSERT INTO conta_usuario (email, username, senha) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    const [idConta] = await conn.query(
      'SELECT id FROM conta_usuario WHERE email = ?',
      [email]
    );

    const id = idConta.id;

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

    const usuarioResult = await conn.query(
      'INSERT INTO usuario (idContaUsuario, nome, sobrenome, idCidade, idEstado, telefone) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nome, sobrenome, cidadeID, estadoID, telefone]
    );

    await conn.query('COMMIT');
    conn.release();

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      userId: id
    });

  } catch (err) {
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

const updateUser = async (req, res) => {
  const { userId, name, surname, email, phone, estateID, cityId, username } = req.body;

  if (!name || !surname || !email || !phone || !estateID || !cityId || !username) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.query('START TRANSACTION');

    const result = await conn.query(
      'UPDATE usuario SET nome = ?, sobrenome = ?, telefone = ?, idEstado = ?, idCidade = ? WHERE id = ?',
      [name, surname, phone, estateID, cityId, userId]
    );

    if (result) {
      await conn.query(
        'UPDATE conta_usuario SET email = ?, username = ? WHERE id = ?',
        [email, username, userId]
      );
    }

    await conn.query('COMMIT');
    conn.release();

    res.json({ message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    if (conn) {
      await conn.query('ROLLBACK');
      conn.release();
    }
    console.error('Update error:', err);
    res.status(500).json({
      message: 'Erro durante a atualização.',
      error: err.message
    });
  }
};

const updatePassword = async (req, res) => {
  const { userId, password, newPassword } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  const hashedCurrentPassword = await pw.hashPassword(password);
  const hashedNewPassword = await pw.hashPassword(newPassword);

  let conn;
  try {
    conn = await getConnection();
    await conn.query('START TRANSACTION');

    const [user] = await conn.query(
      'SELECT * FROM conta_usuario WHERE id = ? AND senha = ?',
      [userId, hashedCurrentPassword]
    );

    if (!user) {
      await conn.query('ROLLBACK');
      conn.release();
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    const result = await conn.query(
      'UPDATE conta_usuario WHERE id = ? SET senha = ?',
      [userId, hashedNewPassword]
    );

    res.json({ message: 'Senha atualizada com sucesso!' });
  } catch (err) {
    if (conn) {
      await conn.query('ROLLBACK');
      conn.release();
    }
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Erro durante o cadastro.',
      error: err.message
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const userRegistration = {
  createUser,
  updateUser,
  updatePassword
}

export default userRegistration;