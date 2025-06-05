import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import CopyRight from "../../../components/CopyRight.js";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../../../hooks/api.js';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const checkHome = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();

    setMessage('');

    try {
      const response = await api.post('/newsletter', {
        email
      });

      if (response.data.sucess) {
        setMessage("Inscrição realizada com sucesso!");
      } else {
        setMessage("Erro ao inscrever-se na newsletter");
      }
    } catch (error) {
      console.error('Erro ao processar a requisição de newsletter:', error);
      setMessage('Erro ao conectar com o servidor');
    }

  };

  return (
    <footer className="bg-dark text-light py-2" style={{ position: 'relative', bottom: '0', width: '100%' }}>
      <Container className="mt-3">
        <Row>
          {/* Seção de Inscrição na Newsletter */}
          <Col md={4}>
            <h5>Inscreva-se na nossa Newsletter</h5>
            <Form>
              <Form.Group controlId="formNewsletter">
                <Form.Control type="email" placeholder="Digite seu email" className="mt-2" onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Button variant="outline-light" type="submit" className="mt-2" onClick={handleNewsletter}>Inscrever</Button>
              {message && <p className="mt-2">{message}</p>}
            </Form>
          </Col>

          {/* Links do Website */}
          <Col md={4}>
            <h5>Links do Site</h5>
            <ul className="list-unstyled">
              <li>
                <button
                  className="text-light"
                  onClick={() => checkHome()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  className="text-light"
                  onClick={() => navigate('/contato')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Contato
                </button>
              </li>
            </ul>
          </Col>

          {/* Links de Redes Sociais */}
          <Col md={4}>
            <h5>Redes Sociais</h5>
            <ul className="list-unstyled">
              <li><a href="https://facebook.com" target="_blank" className="text-light" rel="noopener noreferrer">
                <FaFacebook className="me-2" />Facebook</a>
              </li>
              <li><a href="https://twitter.com" target="_blank" className="text-light" rel="noopener noreferrer">
                <FaSquareXTwitter className="me-2" />X</a></li>
              <li><a href="https://instagram.com" target="_blank" className="text-light" rel="noopener noreferrer">
                <FaInstagram className="me-2" />Instagram</a></li>
              <li><a href="https://linkedin.com" target="_blank" className="text-light" rel="noopener noreferrer">
                <FaLinkedin className="me-2" />LinkedIn</a></li>
            </ul>
          </Col>
        </Row>

        {/* Copyright */}
        <CopyRight />
      </Container>
    </footer>
  );
}

export default Footer;