import axios from 'axios';
import getConnection from '../../models/db.js';

const verify = async (req, res) => {
    try {
        const userId = req.user;

        const conn = await getConnection();
        const [user] = await conn.query('SELECT * FROM conta_usuario WHERE id = ?', [userId]);
        conn.release();

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

const getMe = async (req, res) => {
    let conn;
    try {
        const { userId } = req.params;

        conn = await getConnection();
        const [user] = await conn.query('SELECT * FROM usuario WHERE id = ?', [userId]);
        const [conta] = await conn.query('SELECT * FROM conta_usuario WHERE id = ?', [userId]);

        const { data: estado } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${user.idEstado}`);
        const { data: cidades } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${user.idEstado}/municipios`);
        
        const cidadeEncontrada = cidades.find(cidade => cidade.id === user.idCidade);

        res.status(200).json({
            user: {
                nome: user.nome,
                sobrenome: user.sobrenome,
                email: conta.email,
                username: conta.username,
                telefone: user.telefone,
                idCidade: user.idCidade,
                nomeCidade: cidadeEncontrada.nome,
                idEstado: estado.id,
                nomeEstado: estado.nome
            },
        });

    } catch (error) {
        console.error('Erro ao solicitar getMe:', error);
        res.status(500).json({
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

const userController = {
    verify,
    getMe
}

export default userController;
