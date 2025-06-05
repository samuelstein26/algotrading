import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Card, ListGroup, Row, Col, Collapse } from 'react-bootstrap';
import './css/CreateAlgorithms.css';
import api from '../../../hooks/api.js';
import ReusedModal from '../../../components/Modal.js';

const AlgorithmCreator = ({ onGenerateCode, onSavePrompt }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [fetchModels, setFetchModels] = useState(1);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [pathName, setPathName] = useState('');

  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);

      try {
        const type = 'modelo';
        const response = await api.get(`/prompts-list/${userId}/${type}`);

        let modelsData = [];

        if (response && response.data) {
          modelsData = Array.isArray(response.data)
            ? response.data
            : [response.data].filter(Boolean);
        }

        setModels(modelsData);

      } catch (error) {
        console.error('Failed to load models:', error);
        setModels([]);

      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [userId, fetchModels]);

  const handleCodeGeration = async () => {
    setIsLoading(true);
    const code = await onGenerateCode(prompt);
    setGeneratedCode(code);
    generatedFileName();
    setIsLoading(false);
  }

  const applyTemplate = (title, content) => {
    setTitle(title);
    setPrompt(content);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pathName;
    a.click();
  };

  const handleSaveTemplate = async (type) => {
    if (!title || !prompt || !type) {
      setModalContent({
        title: 'Erro',
        message: 'Por favor, preencha todos os campos.'
      });
      setShowModal(true);
      return;
    }

    try {
      const response = await onSavePrompt(title, prompt, type, generatedCode);

      if (response === true) {
        setModalContent({
          title: 'Sucesso',
          message: 'Prompt salvo com sucesso.'
        });
        setShowModal(true);
        setFetchModels(fetchModels + 1);
      } else {
        setModalContent({
          title: 'Erro',
          message: 'Ocorreu um erro ao salvar o prompt.'
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao salvar o prompt:', error);
      setModalContent({
        title: 'Erro',
        message: 'Falha na conexão com o servidor'
      });
      setShowModal(true);
    }
  };

  const generatedFileName = () => {
    setPathName(`${title}_algorithm.mq5`);
  };

  const deleteModel = async (id) => {
    try {
      await api.delete(`/delete-prompt/${id}/${userId}`);
      setFetchModels(fetchModels + 1);
    } catch (error) {
      console.error('Erro ao excluir o prompt:', error);
    }
  };

  const handleResetFields = () => {
    setTitle('');
    setPrompt('');
    setGeneratedCode('');
  };

  const handleCopyToClipboard = async () => {
    try {
      if (!generatedCode) {
        setModalContent({
          title: 'Aviso',
          message: 'Nenhum código gerado para copiar'
        });
        setShowModal(true);
        return;
      }

      // Fallback para navegadores mais antigos
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea');
        textarea.value = generatedCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } else {
        await navigator.clipboard.writeText(generatedCode);
      }

      setModalContent({
        title: 'Sucesso',
        message: 'Código copiado para a área de transferência!'
      });
      setShowModal(true);

    } catch (err) {
      console.error("Falha ao copiar código:", err);
      setModalContent({
        title: 'Erro',
        message: 'Falha ao copiar o código. Tente novamente.'
      });
      setShowModal(true);
    }
  };

  const mouteListGroup = () => {
    if (models.length === 0) {
      return (
        <ListGroup.Item className="text-muted text-center py-4">
          Nenhum modelo disponível no momento.
        </ListGroup.Item>
      );
    }

    return (
      <ListGroup variant="flush" className="prompt-templates-list">
        {models.map((item) => (
          <ListGroup.Item
            key={item.id}
            className="prompt-template-item position-relative"
            action
          >
            <div
              className="template-content"
              onClick={() => applyTemplate(item.titulo, item.conteudo)}
              onKeyDown={(e) => e.key === 'Enter' && applyTemplate(item.conteudo)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <strong className="template-name">
                  {item.titulo}
                </strong>
              </div>
              <div className="template-preview text-muted">
                {item.conteudo?.split('\n')[0]?.substring(0, 60) || 'Sem conteúdo'}...
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteModel(item.id);
              }}
              className="btn btn-sm btn-close-template"
              aria-label={`Deletar modelo ${item.titulo}`}
              title={`Deletar ${item.titulo}`}
            >
              &times;
            </button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <Container fluid className="mt-4">
      <Row className='h-100'>
        {/* Sidebar de Modelos */}
        <Col md={3} className="mb-4 col-height h-100">
          <Card className="prompt-templates-card">
            <Card.Header className="prompt-models-header">
              Modelos de Prompt
            </Card.Header>
            {mouteListGroup()}
          </Card>
        </Col>

        {/* Área Principal */}
        <Col md={9} className='h-100'>
          <Card className="algorithm-card">
            <Card.Header className="d-flex justify-content-between align-items-center py-3 card-body-header h-100">
              <Form.Group className="d-flex align-items-center mb-0" style={{ flex: 1 }}>
                <Form.Label className="mb-0 me-2 fw-semibold">Título</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="me-3"
                  style={{ maxWidth: '50%' }}
                />
              </Form.Group>
              <div className="d-flex">
                <Button
                  variant="outline-primary"
                  onClick={() => handleResetFields()}
                  className="me-2"
                >
                  Resetar
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => handleSaveTemplate('modelo')}
                >
                  Salvar Prompt como Modelo
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              <Form onSubmit={(e) => {
                e.preventDefault();
                //handleCodeGeration();
              }}>
                <Form.Group className="mb-3">
                  <Form.Label>Digite sua estrategia abaixo:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button
                  variant="outline-primary"
                  type="submit"
                  disabled={isLoading}
                  className="mb-3"
                  onClick={() => handleCodeGeration()}
                >
                  {isLoading ? 'Gerando...' : 'Gerar Código'}
                </Button>
              </Form>

              {generatedCode && (
                <div className="mt-4">
                  <h6>Código Gerado: `{pathName}`</h6>

                  <Button
                    onClick={() => setOpenCollapse(!openCollapse)}
                    variant='outline-primary'
                    aria-controls="example-collapse-text"
                    aria-expanded={openCollapse}
                  >
                    Click aqui para {openCollapse ? 'fechar' : 'ver'} o código gerado
                  </Button>
                  <Collapse in={openCollapse}>
                    <pre className="bg-light p-3 rounded">
                      <code>{generatedCode}</code>
                    </pre>
                  </Collapse>
                  {generatedFileName && (
                    <Row className="mt-3">
                      <Col>
                        <Button
                          variant="outline-primary"
                          onClick={handleDownload}
                        >
                          <i className="bi bi-download me-2"></i>
                          Download do Código
                        </Button>
                        <Button
                          variant="outline-primary"
                          onClick={() => handleCopyToClipboard()}
                          className='ms-2'
                        >
                          <i className="ms-2"></i>
                          Copiar Código
                        </Button>

                        <Button
                          variant="outline-primary"
                          onClick={() => handleSaveTemplate('algo', generatedCode)}
                          className='ms-2'
                        >
                          Salvar Algoritmo
                        </Button>
                      </Col>
                    </Row>
                  )}

                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ReusedModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </Container>
  );
};

export default AlgorithmCreator;