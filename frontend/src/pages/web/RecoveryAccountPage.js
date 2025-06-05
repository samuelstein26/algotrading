import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CopyRight from '../../components/CopyRight.js';
import api from '../../hooks/api.js';

const RecoveryAccountPage = () => {
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isAccountFound, setIsAccountFound] = useState("");

  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert('E-mail inválido');
      return;
    }

    try {
      const response = await api.post('/recuperacaoconta', {
        email
      });

      if (!response.data.isFound) {
        setIsAccountFound(
          <Alert variant="danger" className="mb-3">
            {response.data.message}
          </Alert>
        )
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      alert('Erro ao processar a requisição');
    }
  };

  const validateEmail = (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    setIsEmailValid(validateEmail(newEmail) || newEmail === '');
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ width: '510px', height: 'auto' }}>
              <Card.Body>
                <h3 className="text-center mb-3">Recuperação de conta</h3>
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>E-mail:</Form.Label>
                    <Form.Control
                      type="text"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      isInvalid={!isEmailValid && email !== ''}
                    />
                  </Form.Group>

                  {isAccountFound}

                  <h5 className="text-center mb-3">Caso possua uma conta, enviaremos um e-mail com uma senha temporária para o login</h5>

                  <Button variant="primary" type="submit" className="w-100">
                    Enviar
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

export default RecoveryAccountPage;
