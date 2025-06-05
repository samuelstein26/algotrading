import React, { useState, useRef } from 'react';
import { Card, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import './css/EditPostCard.css';
import PostCardEditor from './PostCardEditor.js';
import api from '../../../hooks/api.js';
import { ImCancelCircle } from "react-icons/im";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineDelete } from "react-icons/ai";
import { RiSaveLine } from "react-icons/ri";

const EditPostCard = ({ onEdit, onDelete, userPosts }) => {
    // Estados do gerenciador de posts
    const [image, setImage] = useState(null);
    const [show, setShow] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading] = useState(false);
    const [error] = useState(null);

    const [editorContent, setEditorContent] = useState({ ops: [] });

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Estados do card individual
    const [title, setTitle] = useState('');
    const editRef = useRef();
    const [editingPostId, setEditingPostId] = useState(null);
    const [originalImagePath, setOriginalImagePath] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Função para processar o conteúdo do post
    const processPostContent = async (contentDelta) => {
        try {
            if (!contentDelta) return { ops: [] };
            
            const processed = await processImagesInDelta(contentDelta);
            return typeof processed === 'object' ? processed : JSON.parse(processed);
        } catch (error) {
            console.error('Error parsing post content:', error);
            return { ops: [] };
        }
    };

    const handleDeletePost = async (id, e) => {
        e?.stopPropagation();
        try {
            const success = await onDelete(id);

            if (success) {
                setModalMessage('Post deletado com sucesso!');
                handleShow();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = async (postId) => {
        setIsProcessing(true);
        try {
            const postToEdit = userPosts.find(post => post.id === postId);
            if (postToEdit) {
                setTitle(postToEdit.title);
                setOriginalImagePath(postToEdit.imageCoverPath || null);
                
                // Processa o conteúdo e armazena no estado
                const processedContent = await processPostContent(postToEdit.content_delta);
                setEditorContent(processedContent);
            }
    
            setEditingPostId(postId);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setEditingPostId(null);
        setTitle('');
        if (editRef.current) editRef.current.clear();
    };

    const handleSave = async (postId, e) => {
        e?.stopPropagation();
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

            const imageToSave = image || originalImagePath;

            const success = await onEdit(postId, title, imageToSave, delta);

            if (success) {
                setModalMessage('Seu post foi salvo com exito.');
                handleShow();
                handleCancel();
            }

        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

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

    const renderButtons = (post) => {
        const isEditing = editingPostId === post.id;
        const isProcessingThisPost = isProcessing && editingPostId === post.id;

        return (
            <>
                {isEditing ? (
                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            variant="outline-primary"
                            onClick={handleCancel}
                            className="px-4"
                            disabled={isProcessingThisPost}
                        >
                            <ImCancelCircle /> Cancelar
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => handleSave(post.id)}
                            className="px-4"
                            disabled={isProcessingThisPost}
                        >
                            <RiSaveLine /> {isProcessingThisPost ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            variant="outline-primary"
                            onClick={() => handleEdit(post.id)}
                            className="px-4"
                            disabled={isProcessing}
                        >
                            <FaEdit /> {isProcessingThisPost ? 'Processando...' : 'Editar'}
                        </Button>
                        <Button
                            variant="outline-danger"
                            onClick={() => handleDeletePost(post.id)}
                            className="px-4"
                            disabled={isProcessing}
                        >
                            <FaTrash /> Excluir
                        </Button>
                    </div>
                )}
            </>
        );
    };

    const renderImagePreview = (path, id, isEditing) => {
        let cleanPath = "";

        if (!path) {
            cleanPath = "uploads/no-image.png";
        } else {
            cleanPath = path.replace(/^\//, '');
        }

        const imageUrl = `http://localhost:3310/${cleanPath}`;

        return (
            <img
                src={imageUrl}
                alt={`Preview-Image-${id}`}
                className={`image-preview${isEditing ? '' : 'image-preview.editing-mode'}`}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ''; // Clear broken image
                    console.error('Erro ao carregar imagem:', imageUrl);
                }}
            />
        );
    };

    const renderPostCard = (post) => {
        if (!post?.id) {
            return (
                <div className="post-card-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                    </div>
                </div>
            );
        }

        const isEditing = editingPostId === post.id;

        return (
            <Card className={`edit-card ${isEditing ? 'editing' : ''}`} key={post.id} style={{ display: isEditing ? 'block' : editingPostId ? 'none' : 'block' }}>
                <Card.Body className='card-body'>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                {post.imageCoverPath ? (
                                    <div className="image-preview-container">
                                        {renderImagePreview(post.imageCoverPath, post.id, isEditing)}
                                        {isEditing && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    setImage("");
                                                    post.imageCoverPath = "";
                                                }}
                                                className="w-100 mt-2"
                                            >
                                                <AiOutlineDelete /> Remover Logo
                                            </Button>
                                        )}
                                    </div>
                                ) : isEditing ? (
                                    <Form.Group className="mb-3">
                                        {!image ? (
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
                                        ) : ""}
                                    </Form.Group>
                                ) : (
                                    <div className="image-preview-container">
                                        {renderImagePreview(null, post.id, false)}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={9} className="height-max">
                            <Row className="mb-3 align-items-center">
                                <Col md={8}>
                                    {isEditing ? (
                                        <Form.Control
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Título do post"
                                        />
                                    ) : (
                                        <h5>{post.title}</h5>
                                    )}
                                </Col>
                                <Col md={4} className="text-end">
                                    {renderButtons(post)}
                                </Col>
                            </Row>
                            <Row>
                                {isEditing ? (
                                    <PostCardEditor
                                        ref={editRef}
                                        initialContent={editorContent}
                                        key={`editor-${post.id}`}
                                    />
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                )}
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    };

    const processImagesInDelta = async (deltaObj) => {
        if (!deltaObj) {
            return { ops: [] };
        }

        // Parseia o Delta se for string
        const delta = typeof deltaObj === 'string' ? JSON.parse(deltaObj) : deltaObj;

        // Cria um novo Delta para o resultado
        const newDelta = { ops: [] };

        for (const op of delta.ops) {
            if (op.insert && typeof op.insert === 'string') {
                // Verifica se há URLs de imagem no texto
                const parts = op.insert.split(/(uploads\/[a-f0-9-]+\.[a-z]{3,4})/i);

                for (let i = 0; i < parts.length; i++) {
                    if (i % 2 === 1) {
                        // É um caminho de imagem (parte ímpar do array split)
                        const imagePath = parts[i];
                        try {
                            const filename = imagePath.split('/').pop();

                            if (!filename) {
                                throw new Error('Filename inválido');
                            }

                            const response = await api.get(`/image/${filename}`);

                            if (!response || !response.data) {
                                throw new Error('Resposta da API inválida');
                            }

                            // Cria o objeto de imagem corretamente
                            const imageInsert = {
                                insert: {
                                    image: typeof response.data === 'string'
                                        ? response.data
                                        : response.data.image || ''
                                }
                            };

                            // Remove atributos vazios para evitar problemas
                            if (op.attributes) {
                                imageInsert.attributes = op.attributes;
                            }

                            newDelta.ops.push(imageInsert);

                        } catch (error) {
                            console.error('Erro ao converter imagem:', error);
                            // Mantém como texto se falhar
                            newDelta.ops.push({ insert: imagePath });
                        }
                    } else if (parts[i]) {
                        // É texto normal (parte par do array split)
                        // Só adiciona se não for string vazia
                        if (parts[i].trim().length > 0) {
                            newDelta.ops.push({
                                insert: parts[i],
                                ...(op.attributes ? { attributes: op.attributes } : {})
                            });
                        }
                    }
                }
            } else if (op.insert && typeof op.insert === 'object' && op.insert.image) {
                // Se já for uma imagem, copia diretamente
                newDelta.ops.push(op);
            } else {
                // Copia outras operações sem modificação
                newDelta.ops.push(op);
            }
        }

        return newDelta;
    };

    return (
        <div>
            {isLoading ? (
                <div className="text-center my-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : userPosts.length > 0 ? (
                <>
                    {userPosts.map(renderPostCard)}
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Sucesso!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{modalMessage}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Fechar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : (
                <p className="text-muted text-center my-4">Nenhum post encontrado.</p>
            )}
        </div>
    );
};

export default EditPostCard;