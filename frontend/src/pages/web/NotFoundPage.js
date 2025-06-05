import React, { useRef, useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CopyRight from '../../components/CopyRight.js';
import Header from '../../components/Header.js';
import './css/NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const footerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('100vh');

  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = footerRef.current.offsetHeight;
      setContainerHeight(`calc(100vh - ${footerHeight}px)`);
    }
  }, []);

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <Header />
      <Container className="main-content" style={{ height: containerHeight }}>
        <Row>
          <Col className="text-center">
            <h1 className="display-1">404</h1>
            <p className="lead">Oops! The page you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={goHome}>Go to Home</Button>
          </Col>
        </Row>
      </Container>
      <div ref={footerRef}>
        <CopyRight />
      </div>
    </div>
  );
};

export default NotFoundPage;