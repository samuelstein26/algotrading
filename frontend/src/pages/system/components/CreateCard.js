import React, { useState, useRef } from 'react';
import { Card, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import './css/CreateCard.css';
import PostCardEditor from './PostCardEditor.js';
import { RiSaveLine } from "react-icons/ri";

const CreateCard = ({ onSave }) => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const editRef = useRef();

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        setImage(null);
        setTitle(''); 
        editRef.current?.clear();
    };
    const handleShow = () => setShow(true);


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {

        try {
            if (!editRef.current) {
                console.error('Editor reference not available');
                return;
            }
    
            const delta = editRef.current.getDelta();
            
            if (!delta) {
                console.error('No delta content available');
                return;
            }
    
            const success = onSave(title, image, delta);
    
            if (success) {
                handleShow();
            }
    
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    return (
        <Card className='create-card'>
            <Card.Body className='card-body'>
                <Row>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            {image ? (
                                <div className="image-preview-container">
                                    <img
                                        src={image}
                                        alt="Preview"
                                        className="image-preview"
                                    />
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => setImage(null)}
                                        className="w-100 mt-2"
                                    >
                                        Remover
                                    </Button>
                                </div>
                            ) : (
                                <div className="image-upload-placeholder">
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="d-none"
                                        id="fileUpload"
                                    />
                                    <Form.Label htmlFor="fileUpload" className="upload-label">
                                        <div className="upload-icon">
                                            <i className="bi bi-camera"></i>
                                        </div>
                                        <span>Clique para adicionar uma imagem</span>
                                    </Form.Label>
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    <Col md={9} className="height-max">
                        <Row className="mb-3 align-items-center">
                            <Col md={8}>
                                <Form.Control type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Col>
                            <Col md={4} className="text-end">
                                <Button variant="outline-primary" onClick={handleSave} className="px-4">
                                    <RiSaveLine /> Salvar
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <PostCardEditor ref={editRef} />
                        </Row>
                    </Col>
                </Row>
            </Card.Body>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Sucesso!</Modal.Title>
                </Modal.Header>
                <Modal.Body>Seu post foi salvo com exito.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card >
    );
}

export default CreateCard;