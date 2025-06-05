import React, { useState, useContext, useEffect } from 'react';
import { NavLink, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext.js';
import CopyRight from '../../components/CopyRight.js';

const LoginPage = () => {
  const [emailUsername, setEmailUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const success = await login(emailUsername, password);

    if (success) {
      navigate('/inicio');
    } else {
      setError ('Credenciais inválidas.');
    }
  }

useEffect(() => {
  if (user) {
    navigate('/inicio');
  }
}, [user, navigate]);

  const goToForgotPassword = () => {
    navigate('/recuperacaoconta');
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ width: '400px', height: 'auto' }}>
              <Card.Body>
                <h3 className="text-center mb-3">Entrar</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Username / E-mail:</Form.Label>
                    <Form.Control
                      type="text"
                      value={emailUsername}
                      onChange={(e) => setEmailUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Senha:</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <NavLink onClick={goToForgotPassword} className="text-decoration-none text-center d-block mb-3">
                    Clique AQUI se você esqueceu sua senha.
                  </NavLink>

                  <Button variant="primary" type="submit" className="w-100">
                    Entrar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <CopyRight />
    </>
  );
};

export default LoginPage;
