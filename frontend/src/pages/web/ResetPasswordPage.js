import React, { useState } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../hooks/api.js';

const ResetPasswordPage = ({ shouldNavigate=true }) => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = localStorage.getItem('userID');

  const handleLogin = (e) => {
    e.preventDefault();

    if (!oldPassword || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas devem ser iguais');
      return;
    }

    api.post('/resetpassword', {
      userId,
      currentPassword: oldPassword,
      newPassword: password,
      repeatPassword: confirmPassword
    }).then(() => {
      alert('Senha alterada com sucesso!');
    }).catch((error) => {
      console.error('Erro ao processar a requisição:', error);
      alert('Erro ao processar a requisição');
    });

    if (shouldNavigate) {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ width: '400px' }}>
              <Card.Body>
                <h3 className="text-center mb-3">Reset de Senha</h3>
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formOldPassword">
                    <Form.Label>Senha Antiga \ Senha temporária:</Form.Label>
                    <Form.Control
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />

                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Nova Senha:</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>Confirmar Nova Senha:</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100">
                    Salvar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ResetPasswordPage;
