import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { FaArrowTurnUp, FaArrowTurnDown } from 'react-icons/fa6';
import './css/PostCard.css';

const formatContent = (deltaString, baseUrl = 'http://localhost:3310') => {
    try {
        const delta = JSON.parse(deltaString);
        let html = '';

        delta.ops.forEach(op => {
            if (typeof op.insert === 'string') {
                // Divide o conteúdo em partes (texto e imagens)
                const parts = op.insert.split(/(uploads\/[a-f0-9-]+\.(?:png|jpg|jpeg|gif))/i);

                parts.forEach(part => {
                    if (!part) return;

                    // Verifica se é uma imagem
                    if (part.match(/uploads\/[a-f0-9-]+\.(png|jpg|jpeg|gif)/i)) {
                        html += `<img src="${baseUrl}/${part}" class="img-fluid">`;
                    } else {
                        // Processa o texto com quebras de linha
                        const lines = part.split('\n');
                        lines.forEach((line, index) => {
                            if (line.trim() !== '') {
                                html += `<p>${line}</p>`;
                            } else if (index !== lines.length - 1) {
                                // Mantém parágrafos vazios entre linhas
                                html += '<p><br></p>';
                            }
                        });
                    }
                });
            }
        });
        return html;
    } catch (e) {
        console.error("Error formatting content:", e);
        return deltaString;
    }
};

const renderImagePreview = (path, id) => {
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
            className={`image-preview`}
            onError={(e) => {
                e.target.style.display = 'none';
            }}
        />
    );
};

const PostCard = ({ post, onClose, like, dislike, hasLike, hasDislike }) => {

    const [userVotes] = useState({});

    return (
        <Card className="post-card">
            <Card.Header className='post-card-header'>
                <Col md={2}>
                </Col>
                <Col md={8}>
                    <Card.Title>{post.title}</Card.Title>
                </Col>
                <Col md={2}>
                    {onClose && (
                        <Button variant="light" onClick={onClose} className="close-button">
                            <FaTimes />
                        </Button>
                    )}
                </Col>
            </Card.Header>
            <Card.Body>
                <Row className="g-0">
                    <Col md={3}>
                        {post.imageCoverPath && (
                            <div className="image-preview-container">
                                {renderImagePreview(post.imageCoverPath, post.id)}
                            </div>
                        )}
                    </Col>
                    <Col md={9} className='text-container'>
                        <Card.Text>
                            <small className="text-muted mb-1">
                                Postado em: {new Date(post.created_at).toLocaleDateString()}
                                {post.updated_at !== post.created_at && (
                                    <span>, atualizado em: {new Date(post.updated_at).toLocaleDateString()}</span>
                                )}
                            </small>
                            <small className="text-muted mt-1">Autor: {`${post.creator_name} ${post.creator_surname}`}</small>
                            <hr />
                        </Card.Text>
                        <Card.Text>
                            <div
                                className="ql-editor"
                                dangerouslySetInnerHTML={{ __html: formatContent(post.content_delta) }}
                            />
                        </Card.Text>
                    </Col>
                </Row>
                <Row className="g-0 pd-1 justify-content-center">
                    <Col md={9}></Col>
                    <Col md={2} className="d-flex justify-content-center align-items-end mb-3">
                        <Button
                            variant={
                                userVotes[post.id] === 'like' ? 'success' :
                                    hasLike ? 'light-success' : 'outline-success'
                            }
                            onClick={() => like(post.id)}
                            className="me-2"
                            disabled={userVotes[post.id]}
                        >
                            <FaArrowTurnUp /> {post.rankingUp || 0}
                        </Button>
                        <Button
                            variant={
                                userVotes[post.id] === 'dislike' ? 'danger' :
                                    hasDislike ? 'light-danger' : 'outline-danger'
                            }
                            onClick={() => dislike(post.id)}
                            disabled={userVotes[post.id]}
                        >
                            <FaArrowTurnDown /> {post.rankingDown || 0}
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default PostCard;