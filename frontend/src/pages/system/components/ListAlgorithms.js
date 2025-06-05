import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Collapse, CloseButton } from 'react-bootstrap';
import ReusedModal from '../../../components/Modal.js';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../../hooks/api.js';

const ListAlgorithms = ({ onGenerateCode, onEditPrompt }) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchModels, setFetchModels] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [openCollapse, setOpenCollapse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);

      try {
        const type = 'algo';
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

  const handleExcluir = async (id) => {
    try {
      await api.delete(`/delete-prompt/${id}/${userId}`);
      setFetchModels(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await onGenerateCode(prompt);
    setGeneratedCode(result);
    setIsLoading(false);
  };

  const handleEditTemplate = async (type, code) => {
    if (onEditPrompt) {
      try {
        setIsLoading(true);
        await onEditPrompt(currentItem.id, title, prompt, type, generatedCode);
      } catch (error) {
        console.error('Error saving template:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_algorithm.mql`;
    a.click();
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

  const ItemCard = ({ titulo, onEditar, onExcluir }) => {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8} xs={12}>
              <h5 className="mb-0">{titulo}</h5>
            </Col>
            <Col md={4} xs={12} className="text-end">
              <Button
                variant="outline-primary"
                onClick={onEditar}
                className="me-2"
              >
                <FaEdit /> Editar
              </Button>
              <Button
                variant="outline-danger"
                onClick={onExcluir}
              >
                <FaTrash /> Excluir
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const handleEditar = async (item) => {
    setCurrentItem(item);
    setTitle(item.titulo);
    setPrompt(item.conteudo || '');
    setIsEditing(true);
    
    try {
      const response = await api.get(`/code/${item.id}`);
      if (response && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].code) {
          setGeneratedCode(response.data[0].code);
        } else {
          setGeneratedCode('');
        }
      }
    } catch (error) {
      console.error('Falha ao obter o código:', error);
      setGeneratedCode('');
      setModalContent({
        title: 'Erro',
        message: 'Falha ao carregar o código. Tente novamente.'
      });
      setShowModal(true);
    }
  };

  const renderCardEdit = (item) => {
    return (
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
          <CloseButton onClick={() => setIsEditing(false)} />
        </Card.Header>
  
        <Card.Body>
          <Form onSubmit={handleGenerateCode}>
            <Form.Group className="mb-3">
              <Form.Label>Digite sua estrategia abaixo:</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="Ex: 'Gere um algoritmo em JavaScript para ordenação rápida'"
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
            >
              {isLoading ? 'Gerando...' : 'Gerar Código'}
            </Button>
          </Form>
  
          <div className="mt-4">
            <h6>Código Gerado:</h6>
  
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
                  onClick={() => handleEditTemplate('algo', generatedCode)}
                  className='ms-2'
                >
                  Salvar Algoritmo
                </Button>
              </Col>
            </Row>
          </div>
        </Card.Body>
        <ReusedModal
          show={showModal}
          onHide={() => setShowModal(false)}
          title={modalContent.title}
          message={modalContent.message}
        />
      </Card>
    );
  };

  return (
    <div>
      {isEditing ? (
        renderCardEdit(currentItem)
      ) : (
        <>
          {models.length === 0 && (
            <div className="text-muted text-center py-4">
              Nenhum algoritmo cadastrado no momento.
            </div>
          )}
          {models.map((item) => (
            <ItemCard
              key={item.id}
              titulo={item.titulo}
              onEditar={() => handleEditar(item)}
              onExcluir={() => handleExcluir(item.id)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ListAlgorithms;