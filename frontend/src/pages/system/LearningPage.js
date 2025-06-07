import React from "react";
import { useState, useEffect } from "react";
import { Tabs, Tab } from "react-bootstrap";
import "./css/LearningPage.css";
import ReadCard from "./components/ReadCard.js";
import EditCard from "./components/EditPostCard.js";
import CreateCard from "./components/CreateCard.js";
import api from "../../hooks/api.js";
import bigIntConverter from "../../hooks/bigIntConverter.js";

const LearningPage = () => {
    const [active, setActive] = useState("ler");
    const [editKey, setEditKey] = useState(0);
    const storedUserID = localStorage.getItem('userID');
    const [userPosts, setUserPosts] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchUserPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchData = async () => {
          await fetchPosts();
        };
      
        fetchData();
      
        const intervalId = setInterval(fetchData, 25000); 
      
        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
      }, []);

    const handleTabChange = (k) => {
        setActive(k);
        if (k === 'editar') {
            setEditKey(prev => prev + 1); // Muda a key para forçar recriação
        }
    };

    const handleSavePost = async (title, image, delta) => {
        try {
            const response = await api.post('/save-post', {
                storedUserID,
                title,
                image,
                delta: bigIntConverter(delta)
            });

            if (response.status === 200) {
                await fetchUserPosts();
                setEditKey(prev => prev + 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao salvar o post:', error);
            return false;
        }
    };

    const handleDeletePost = async (id) => {
        try {
            const response = await api.post('/delete-post', {
                id
            });

            if (response.status === 200) {
                await fetchUserPosts();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao deletar o post:', error);
            return false;
        }
    };

    const handleEditPost = async (postId, title, image, delta) => {
        try {
            const response = await api.post('/update-post', {
                storedUserID,
                postId,
                title,
                image,
                delta: bigIntConverter(delta)
            })

            if (response.status === 200) {
                await fetchUserPosts();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Erro ao deletar o post:', error);
            return false;
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await api.get(`/posts/user/${storedUserID}?timestamp=${Date.now()}`);
            const posts = Array.isArray(response.data) ? response.data : [response.data];
            const validPosts = posts.filter(post => post?.id && post?.title);

            // Adiciona imagens (se necessário)
            const postsWithImages = await Promise.all(
                validPosts.map(async post => {
                    try {
                        const imageResponse = await api.get(`/image/post/${post.id}`);
                        return {
                            ...post,
                            imageCoverPath: imageResponse.data?.storage_path || null
                        };
                    } catch (error) {
                        return post;
                    }
                })
            );

            setUserPosts(postsWithImages);
        } catch (err) {
            console.error('Erro ao buscar posts:', err);
            setUserPosts([]);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            const postsResponse = Array.isArray(response.data) ? response.data : [response.data];
            
            // Processa todos os posts em paralelo
            const processedPosts = await Promise.all(
                postsResponse
                    .filter(post => post?.id && post?.title)
                    .map(async post => {
                        try {
                            // Busca informações do criador
                            let creatorName = '';
                            let creatorSurname = '';
                            
                            try {
                                const creatorResponse = await api.get(`/user/${post.user_id}`);
                                if (creatorResponse.data) {
                                    creatorName = creatorResponse.data.nome || '';
                                    creatorSurname = creatorResponse.data.sobrenome || '';
                                }
                            } catch (creatorError) {
                                console.error('Erro ao buscar criador:', creatorError);
                            }
    
                            // Parse do content_delta para encontrar imagens
                            let firstImage = null;
                            
                            try {
                                const contentDelta = JSON.parse(post.content_delta);
                                if (contentDelta.ops) {
                                    for (const op of contentDelta.ops) {
                                        if (op.insert && typeof op.insert === 'string' && op.insert.includes('uploads/')) {
                                            const match = op.insert.match(/uploads\/[a-f0-9-]+\.(png|jpg|jpeg|gif)/i);
                                            if (match) {
                                                firstImage = match[0];
                                                break;
                                            }
                                        }
                                    }
                                }
                            } catch (parseError) {
                                console.error('Erro ao parsear content_delta:', parseError);
                            }
    
                            // Se não encontrou imagem no content, tenta buscar separadamente
                            if (!firstImage) {
                                try {
                                    const imageResponse = await api.get(`/image/post/${post.id}`);
                                    firstImage = imageResponse.data?.storage_path || null;
                                } catch (imageError) {
                                    console.error('Erro ao buscar imagem:', imageError);
                                }
                            }
    
                            return {
                                ...post,
                                creator_name: creatorName,
                                creator_surname: creatorSurname,
                                imageCoverPath: firstImage
                            };
                        } catch (error) {
                            console.error('Erro ao processar post:', error);
                            return {
                                ...post,
                                creator_name: '',
                                creator_surname: '',
                                imageCoverPath: null
                            };
                        }
                    })
            );
    
            setPosts(processedPosts);
        } catch (err) {
            console.error('Erro ao buscar posts:', err);
            setPosts([]);
        }
    };

    return (
        <Tabs
            controId="controlled-tab-example"
            activeKey={active}
            onSelect={handleTabChange}
            className="mb-3"
        >
            <Tab eventKey="ler" title="Ler">
                <ReadCard 
                    posts={posts}
                    api={api}
                    userID={storedUserID}
                    onPostUpdate={fetchPosts}
                    key={`edit-${editKey}`}
                />
            </Tab>
            <Tab eventKey="editar" title="Editar">
                <EditCard
                    userPosts={userPosts}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    key={`edit-${editKey}`}
                />
            </Tab>
            <Tab eventKey="criar" title="Criar">
                <CreateCard onSave={handleSavePost} />
            </Tab>
        </Tabs>
    );
};

export default LearningPage;