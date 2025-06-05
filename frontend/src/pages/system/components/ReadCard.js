import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Pagination, Form, InputGroup } from 'react-bootstrap';
import { FaMagnifyingGlass as FaSearch, FaSort } from 'react-icons/fa6';
import { FaArrowTurnUp, FaArrowTurnDown } from 'react-icons/fa6';
import './css/ReadCard.css';
import PostCard from './PostCard.js';

const PostsList = ({ posts = [], api, userID, onPostUpdate }) => {
    // Estados para controle da lista
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [userVotes, setUserVotes] = useState({});
    const [expandedPostId, setExpandedPostId] = useState(null);

    // Estados para filtros e ordenação
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');

    const postsPerPage = 20;

    // Opções de ordenação
    const sortOptions = [
        { value: 'newest', label: 'Mais recentes' },
        { value: 'oldest', label: 'Mais antigos' },
        { value: 'most_likes', label: 'Mais curtidos' },
        { value: 'most_dislikes', label: 'Mais dislikes' },
        { value: 'recently_updated', label: 'Recentemente atualizados' }
    ];

    // Carrega votos do localStorage
    useEffect(() => {
        (async () => {
            await fetchVotes();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Aplica filtros e ordenação quando posts ou filtros mudam
    useEffect(() => {
        let result = [...posts];

        // Filtro por termo de pesquisa
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(term)
            );
        }

        // Ordenação
        result = sortPosts(result, sortOption);

        setFilteredPosts(result);
        setCurrentPage(1); // Resetar para a primeira página
    }, [searchTerm, sortOption, posts]);

    // Função de ordenação
    const sortPosts = (posts, option) => {
        const sorted = [...posts];

        switch (option) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'most_likes':
                return sorted.sort((a, b) => (b.rankingUp || 0) - (a.rankingUp || 0));
            case 'most_dislikes':
                return sorted.sort((a, b) => (b.rankingDown || 0) - (a.rankingDown || 0));
            case 'recently_updated':
                return sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            default:
                return sorted;
        }
    };

    // Função para buscar os votos do usuário
    const fetchVotes = async () => {
        try {
            const response = await api.get(`/votelist/${userID}`);
            const votes = Array.isArray(response.data) ? response.data : [response.data];

            // Transformar o array de votos em um objeto mais fácil de manipular
            const votesMap = {};
            votes.forEach(vote => {
                votesMap[vote.post_id] = vote.vote_type; // 'like' ou 'dislike'
            });

            setUserVotes(votesMap);
        } catch (error) {
            console.log('Erro ao buscar votos:', error);
        }
    };

    // Função para lidar com like
    const handleLike = async (postId) => {
        try {
            // Se já deu like neste post
            if (userVotes[postId] === 'like') {
                // Remove o like (cancela)
                await api.delete(`/vote/${postId}/${userID}`);
                setUserVotes(prev => {
                    const newVotes = { ...prev };
                    delete newVotes[postId];
                    return newVotes;
                });
            }
            // Se já deu dislike neste post
            else if (userVotes[postId] === 'dislike') {
                // Remove o dislike e adiciona like
                await api.put(`/vote/${postId}/${userID}`, { vote_type: 'like' });
                setUserVotes(prev => ({
                    ...prev,
                    [postId]: 'like'
                }));
            }
            // Se nunca votou neste post
            else {
                // Adiciona like
                await api.post('/vote', {
                    userId: userID,
                    postId: postId,
                    vote_type: 'like'
                });
                setUserVotes(prev => ({
                    ...prev,
                    [postId]: 'like'
                }));
            }

            if (onPostUpdate) {
                await onPostUpdate();
            }
        } catch (error) {
            console.log('Erro ao processar like:', error);
        }
    };

    // Função para lidar com dislike (lógica inversa do like)
    const handleDislike = async (postId) => {
        try {
            // Se já deu dislike neste post
            if (userVotes[postId] === 'dislike') {
                // Remove o dislike (cancela)
                await api.delete(`/vote/${postId}/${userID}`);
                setUserVotes(prev => {
                    const newVotes = { ...prev };
                    delete newVotes[postId];
                    return newVotes;
                });
            }
            // Se já deu like neste post
            else if (userVotes[postId] === 'like') {
                // Remove o like e adiciona dislike
                await api.put(`/vote/${postId}/${userID}`, { vote_type: 'dislike' });
                setUserVotes(prev => ({
                    ...prev,
                    [postId]: 'dislike'
                }));
            }
            // Se nunca votou neste post
            else {
                // Adiciona dislike
                await api.post('/vote', {
                    userId: userID,
                    postId: postId,
                    vote_type: 'dislike'
                });
                setUserVotes(prev => ({
                    ...prev,
                    [postId]: 'dislike'
                }));
            }

            if (onPostUpdate) {
                await onPostUpdate();
            }
        } catch (error) {
            console.log('Erro ao processar dislike:', error);
        }
    };

    // Função auxiliar para verificar se um post tem like
    const hasLike = (postId) => {
        return userVotes[postId] === 'like';
    };

    // Função auxiliar para verificar se um post tem dislike
    const hasDislike = (postId) => {
        return userVotes[postId] === 'dislike';
    };

    // Alternar expansão do post
    const toggleExpand = (postId) => {
        setExpandedPostId(postId);
    };

    const closeExpandedView = () => {
        setExpandedPostId(null);
    };

    // Lógica de paginação
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Mudar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Função para renderizar preview da imagem
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

    // Encontrar o post expandido
    const expandedPost = expandedPostId ? filteredPosts.find(post => post.id === expandedPostId) : null;

    return (
        <div className="container-screen ml-1 mr-1">
            {/* Modal para visualização expandida */}
            {expandedPost && (
                <PostCard
                    post={expandedPost}
                    onClose={closeExpandedView}
                    like={handleLike}
                    dislike={handleDislike}
                    hasLike={hasLike(expandedPost.id)}
                    hasDislike={hasDislike(expandedPost.id)}
                />
            )}

            {/* Conteúdo normal (lista de posts) */}
            {!expandedPost && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <h2 className="mb-0"> </h2>

                        <div className="d-flex flex-wrap gap-3">
                            {/* Campo de pesquisa */}
                            <InputGroup style={{ width: '250px' }}>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Pesquisar por título..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>

                            {/* Seletor de ordenação */}
                            <InputGroup style={{ width: '250px' }}>
                                <InputGroup.Text>
                                    <FaSort />
                                </InputGroup.Text>
                                <Form.Select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </div>
                    </div>

                    {/* Mostra quantidade de resultados */}
                    <div className="mb-3">
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </div>

                    {/* Lista de posts */}
                    {currentPosts.length > 0 ? (
                        currentPosts.map(post => (
                            <Card
                                key={post.id}
                                className="read-card mb-3"
                                bsPrefix="read-card" // Isso previne a adição da classe 'card' padrão
                            >
                                <Row className="g-0">
                                    <Col md={3}>
                                        <div className="image-preview-container">
                                            {renderImagePreview(post.imageCoverPath, post.id)}
                                        </div>
                                    </Col>
                                    <Col md={7}>
                                        <Card.Body>
                                            <Card.Title>{post.title}</Card.Title>
                                            <Card.Text>
                                                <small className="text-muted">
                                                    Postado em: {new Date(post.created_at).toLocaleDateString()}
                                                    {post.updated_at !== post.created_at && (
                                                        <span>, atualizado em: {new Date(post.updated_at).toLocaleDateString()}</span>
                                                    )}
                                                </small>
                                            </Card.Text>
                                            <Card.Text>
                                                {`${truncateContent(post.content_delta, 100)}...`}
                                                <Button
                                                    variant="link"
                                                    onClick={() => toggleExpand(post.id)}
                                                    className="expand-button"
                                                >
                                                    Expandir
                                                </Button>
                                            </Card.Text>
                                        </Card.Body>
                                    </Col>
                                    <Col md={2} className="vote-section">
                                        <div className="vote-buttons">
                                            <Button
                                                variant={
                                                    userVotes[post.id] === 'like' ? 'success' :
                                                        hasLike ? 'light-success' : 'outline-success'
                                                }
                                                onClick={() => handleLike(post.id)}
                                                className="me-2"
                                            >
                                                <FaArrowTurnUp /> {post.rankingUp || 0}
                                            </Button>
                                            <Button
                                                variant={
                                                    userVotes[post.id] === 'dislike' ? 'danger' :
                                                        hasDislike ? 'light-danger' : 'outline-danger'
                                                }
                                                onClick={() => handleDislike(post.id)}
                                            >
                                                <FaArrowTurnDown /> {post.rankingDown || 0}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        ))
                    ) : (
                        <div className="alert alert-info">
                            Nenhum post encontrado com os critérios atuais.
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                />

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }

                                    return (
                                        <Pagination.Item
                                            key={pageNumber}
                                            active={pageNumber === currentPage}
                                            onClick={() => paginate(pageNumber)}
                                        >
                                            {pageNumber}
                                        </Pagination.Item>
                                    );
                                })}

                                <Pagination.Next
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Função auxiliar para formatar o conteúdo Delta (simplificada)
const formatContent = (deltaString) => {
    try {
        const delta = JSON.parse(deltaString);
        return delta.ops.map(op => op.insert).join('');
    } catch (e) {
        return deltaString;
    }
};

// Função auxiliar para truncar o conteúdo
const truncateContent = (deltaString, length) => {
    const plainText = formatContent(deltaString);
    return plainText.length > length ? plainText.substring(0, length) : plainText;
};

export default PostsList;