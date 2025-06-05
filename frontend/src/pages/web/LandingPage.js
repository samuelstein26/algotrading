import React from 'react';
import './css/LandingPage.css';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import TestimonialCards from './components/TestimonialCard.js';
import ilustrationImage from '../../img/ilustrationChart.jpg';
import testimonialRafael from '../../img/rafael.jpg';
import testimonialJoaquin from '../../img/joaquin.jpg';
import testimonialMateus from '../../img/mateus.jpg';
import testimonialLucas from '../../img/lucas.jpg';
import managementImage from '../../img/management.jpg';
import realTimeImage from '../../img/realTime.jpg';
import customStrategyImage from '../../img/customStrategy.jpg';
import Footer from './components/Footer.js';


// Dummy data for the chart
const chartData = [
  { mes: 'Janeiro', conta: 900 },
  { mes: 'Fevereiro', conta: 1500 },
  { mes: 'Março', conta: 1300 },
  { mes: 'Abril', conta: 1600 },
  { mes: 'Maio', conta: 2000 },
];

const testimonials = [
  {
    key: 1,
    nome: 'Joaquin Santos',
    message: 'AlgoTrading Sistema melhorou minha maneira que eu opero! Minha banca aumentou 30% esse ano.',
    picture: testimonialJoaquin,
  },
  {
    key: 2,
    nome: 'Rafael Schoner',
    message:'Estou amando esse sistema!',
    picture: testimonialRafael,
  },
  {
    key: 3,
    nome: 'Mateus Oliveira',
    message: 'Prático e eficiente, o sistema automatizado fez toda a diferença nos meus investimentos.',
    picture: testimonialMateus,
  },
  {
    key: 4,
    nome: 'Lucas Almeida',
    message:'Excelente para quem busca ganhos consistentes sem complicação. Recomendo!',
    picture: testimonialLucas,
  }
];

const LandingPage = () => {

  const navigate = useNavigate();
  const gotoRegisterPage = () => {
    navigate('/novousuario');
  }

  return (
    <>
      {/* Introduction Section */}
      <Container fluid className="hero bg-light text-center py-5">
        <div className='container-lg'>
        <Row className="align-items-center">
          <Col md={6}>
            <h1 className="display-4">Automatize sua Estratégica de Trading</h1>
            <p className="lead">Descubra algoritmos avançados para maximizar seu desempenho de negociação</p>
            <Button variant="outline-dark" className="me-2" onClick={gotoRegisterPage}>Comece Agora</Button>
          </Col>
          <Col md={6}>
            <Image src={ilustrationImage} alt="Trading Charts" fluid rounded className='chart-card'/>
          </Col>
        </Row>
        </div>
      </Container>

      {/* Features Section */}
      <Container controlId="features" className="py-5">
        <h2 className="text-center mb-4 mt-3">Porque escolher o AlgoTrading Sistema</h2>
        <Row>
          <Col md={4} className="text-center">
            <Image src={realTimeImage} alt="Real-Time Data" width={60} className="mb-3 choose-card rounded" />
            <h3>Dados em tempo real</h3>
            <p>Obtenha fluxos de dados atualizados para tomar decisões de negociação mais informadas.</p>
          </Col>
          <Col md={4} className="text-center">
            <Image src={customStrategyImage} alt="Custom Strategies" width={60} className="mb-3 choose-card rounded" />
            <h3>Estratégias personalizadas</h3>
            <p>Crie estratégias personalizadas para atingir seus objetivos de negociação</p>
          </Col>
          <Col md={4} className="text-center">
            <Image src={managementImage} alt="AI Insights" width={60} className="mb-3 choose-card rounded" />
            <h3>Gestão de risco aprimorada</h3>
            <p>Administre e controle os risco, como limites de perda (stop loss) e proteção de capital.</p>
          </Col>
        </Row>
      </Container>

      {/* Charts Section */}
      <Container controlId="charts" className="py-5 bg-light">
        <h2 className="text-center mb-4">Acompanhe seu crescimento</h2>
        <p className="text-center">Veja o desempenho de suas estratégias ao longo do tempo com gráficos ao vivo e testes retrospectivos.</p>
        <div className="d-flex justify-content-center">
          <LineChart width={500} height={300} data={chartData}>
            <XAxis dataKey="mes" />
            <YAxis />
            <CartesianGrid stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="conta" stroke="#8884d8" />
          </LineChart>
        </div>
      </Container>

      {/* Testimonials Section */}
      <Container controlId="testimonials" className="py-5">
        <h2 className="text-center mb-5 mt-3">O que nossos usuários dizem</h2>
        <Row>
            {testimonials.map((test, index) => (
              <Col md={3}>
              <TestimonialCards
                key={index.key}
                image={test.picture}
                name={test.nome}
                message={test.message}
                className='testimonial-card card'
              />
              </Col>
            ))}
        </Row>
      </Container>

      {/* Footer Section */}
      <Footer />
    </>
  );
};

export default LandingPage;
