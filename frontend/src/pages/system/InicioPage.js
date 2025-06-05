import React, { useState, Suspense } from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import CopyRight from "../../components/CopyRight.js";
import { CiSettings } from "react-icons/ci";
import "./css/InicioPage.css";
import SettingsPage from "./SettingsPage.js";
import LearningPage from "./LearningPage.js";
//import HomePage from "./HomePage.js";
import CreateAlgorithmPage from "./CreateAlgorithmPage.js";
import TestAlgorithmPage from "./TestAlgorithmPage.js";
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../web/AuthContext.js'

const InicioPage = () => {
  const [selectedSection, setSelectedSection] = useState("Inicio");
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const HomePage = React.lazy(() => import('./HomePage.js'));

  useEffect(() => {
    // Verificação de inatividade (10 minutos)
    const inactivityTimer = setTimeout(() => {
      if (window.confirm('Você está inativo. Deseja continuar?')) {
        resetTimer()
      } else {
        logout()
      }
    }, 600000)

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
    }

    const events = ['mousedown', 'keypress', 'scroll']
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [logout])

  if (!user) {
    navigate('/login')
    return null
  }

  const LoadingSpinner = () => {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  };

  const handleSectionChange = (section) => {
    if (section === "Inicio") {
      setIsLoading(true);
      setSelectedSection(section);
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setSelectedSection(section);
    }
  };


  const renderContent = () => {
    if (selectedSection === "Inicio" && isLoading) {
      return <LoadingSpinner />;
    }

    switch (selectedSection) {
      case "Inicio":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        );
      case "Aprendizagem":
        return <LearningPage />;
      case "Criar Algoritmo":
        return <CreateAlgorithmPage />;
      case "Testar Algoritmo":
        return <TestAlgorithmPage />;
      case "Configuracoes":
        return <SettingsPage />;
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        );
    }
  };

  return (
    <div >
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="bg-light sidebar">
          <Nav className="flex-column column-settings" style={{ height: "100%" }}>
            <Nav.Link 
              className={selectedSection === "Inicio" ? 'active-button' : ''} 
              onClick={() => handleSectionChange("Inicio")}>Início</Nav.Link>
            <Nav.Link 
              className={selectedSection === "Aprendizagem" ? 'active-button' : ''} 
              onClick={() => setSelectedSection("Aprendizagem")}>Aprendizagem</Nav.Link>
            <Nav.Link 
              className={selectedSection === "Criar Algoritmo" ? 'active-button' : ''}
              onClick={() => setSelectedSection("Criar Algoritmo")}>Criar Algoritmo</Nav.Link>
            <Nav.Link 
              className={selectedSection === "Testar Algoritmo" ? 'active-button' : ''}
              onClick={() => setSelectedSection("Testar Algoritmo")}>Testar Algoritmo</Nav.Link>
            <div className="flex-grow-1"></div>
            <Nav.Link 
              className={'ps-0 mt-auto' + (selectedSection === "Configuracoes" ? 'active-button' : '')}
              onClick={() => setSelectedSection("Configuracoes")}><CiSettings size={35}/></Nav.Link>
          </Nav>
        </Col>
        <Col xs={9} md={10}>
          <div className="p-1">
            {renderContent()}
          </div>
        </Col>
      </Row>
    </Container>

    <CopyRight />
    </div>
  );
};

export default InicioPage;
