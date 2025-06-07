import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Footer from './components/Footer.js';
import api from '../../hooks/api.js';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.assunto.trim()) newErrors.assunto = 'Assunto é obrigatório';
    if (!formData.mensagem.trim()) newErrors.mensagem = 'Mensagem é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {

      try {
        const response = await api.post('/contato', formData);

        if (response.status === 200) {
          setSubmitted(true);
          setFormData({
            nome: '',
            email: '',
            assunto: '',
            mensagem: ''
          });
          navigate('/');
        }

      } catch (error) {
        console.error('Erro ao enviar o formulário:', error);
      }
      
      // Resetar o status de submissão após 5 segundos
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Card className="p-4 shadow-sm" style={{ width: '100%', maxWidth: '510px', margin: '20px auto' }}>
          <h1 className="text-center mb-4">Contate-nos</h1>

          {submitted && (
            <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
              Obrigado por entrar em contato! Retornaremos em breve.
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={handleChange}
                    isInvalid={!!errors.nome}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nome}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Seu email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formSubject" className="mb-3">
              <Form.Label>Assunto</Form.Label>
              <Form.Control
                type="text"
                name="assunto"
                placeholder="Assunto da mensagem"
                value={formData.assunto}
                onChange={handleChange}
                isInvalid={!!errors.assunto}
              />
              <Form.Control.Feedback type="invalid">
                {errors.assunto}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formMessage" className="mb-3">
              <Form.Label>Mensagem</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="mensagem"
                placeholder="Escreva sua mensagem"
                value={formData.mensagem}
                onChange={handleChange}
                isInvalid={!!errors.mensagem}
              />
              <Form.Control.Feedback type="invalid">
                {errors.mensagem}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" className="mt-3">
                Enviar
              </Button>
            </div>
          </Form>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;