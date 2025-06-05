import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { IoSearch } from 'react-icons/io5';
import api from '../../../hooks/api.js';
import axios from 'axios';
import './css/AccountUpdate.css';
import ReusedModal from '../../../components/Modal.js';

const AccountUpdate = () => {
    // State declarations
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [phone, setPhone] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cityId, setCityId] = useState('');
    const [estateID, setEstateID] = useState('');
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState(null);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [error, setError] = useState('');
    const [editableFields, setEditableFields] = useState({
        name: false,
        surname: false,
        email: false,
        phone: false,
        username: false
    });
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: ''
    });
    const userId = localStorage.getItem('userID');

    useEffect(() => {
        const loadData = async () => {

            try {
                const response = await api.get(`/me/${userId}`);
                const user = response.data.user;

                if (response) {
                    setName(user.nome);
                    setSurname(user.sobrenome);
                    setEmail(user.email);
                    setPhone(user.telefone);
                    setEstateID(user.idEstado);
                    setSelectedState(user.idEstado);
                    setCityId(user.idCidade);
                    setSelectedCity(user.idCidade);
                    setUsername(user.username);

                    // Carrega todos os estados
                    const statesResponse = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
                    setStates(statesResponse.data);

                    // Se tiver estado, carrega as cidades correspondentes
                    if (user.idEstado) {
                        const citiesResponse = await axios.get(
                            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${user.idEstado}/municipios`
                        );
                        setCities(citiesResponse.data);
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };

        loadData();
    }, [userId]);

    useEffect(() => {
        if (selectedState) {
            const fetchCities = async () => {
                try {
                    const response = await axios.get(
                        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
                    );
                    setCities(response.data);
                } catch (error) {
                    console.error('Erro ao buscar cidades:', error);
                }
            };
            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedState]);

    // Função para alternar o estado de edição de um campo
    const toggleEditField = (fieldName) => {
        setEditableFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    // Email validation handler
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(value));
    };

    // Phone number formatting handler
    const handlePhoneChange = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);
        
        let formatted = limited
            .replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (_, ddd, prefixo, sufixo) => {
                let result = '';
                if (ddd) result += `(${ddd}`;
                if (prefixo) result += ` ${prefixo}`;
                if (sufixo) result += `-${sufixo}`;
                return result;
            });
        
        setPhone(formatted);
    };

    const checkUsernameAvailability = async (username) => {
        if (username.trim() !== '') {
            try {
                const response = await api.get('/usernamecheck', { params: { username } });

                if (!response.data.isAvailable) {
                    setUsernameMessage(
                        <Alert variant="danger" className="mb-3">
                            Este username já está em uso. Por favor, escolha outro.
                        </Alert>
                    )
                } else {
                    setUsernameMessage(
                        <Alert variant="success" className="mb-3">
                            Username disponível!
                        </Alert>
                    )
                    setUsername(username);
                }
            } catch (error) {
                console.error('Erro ao verificar username:', error);
            }
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEmailValid) {
            setError('Por favor, insira um email válido');
            return;
        }

        try {
            const response = await api.put('/update-user', {
                userId,
                name,
                surname,
                email,
                phone,
                cityId,
                estateID,
                username
            });

            if (response) {
                setEditableFields({
                    name: false,
                    surname: false,
                    email: false,
                    phone: false,
                    username: false
                })
            }

            setModalContent({
                title: 'Sucesso',
                message: 'Dados atualizados com sucesso!'
            });
            setShowModal(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao atualizar dados');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm mw-100" style={{ width: '600px', height: 'auto' }}>
                        <Form onSubmit={handleSubmit} style={{ width: '90%' }}>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Nome:</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={!editableFields.name}
                                />
                                <Button
                                    variant={editableFields.name ? "outline-secondary" : "outline-primary"}
                                    onClick={() => toggleEditField('name')}
                                    className='button-editar'
                                >
                                    {editableFields.name ? 'Cancelar' : 'Editar'}
                                </Button>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Sobrenome:</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    required
                                    disabled={!editableFields.surname}
                                />
                                <Button
                                    variant={editableFields.surname ? "outline-secondary" : "outline-primary"}
                                    onClick={() => toggleEditField('surname')}
                                    className='button-editar'
                                >
                                    {editableFields.surname ? 'Cancelar' : 'Editar'}
                                </Button>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Email:</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    isInvalid={!isEmailValid && email !== ''}
                                    disabled={!editableFields.email}
                                />
                                <Button
                                    variant={editableFields.email ? "outline-secondary" : "outline-primary"}
                                    onClick={() => toggleEditField('email')}
                                    className='button-editar'
                                >
                                    {editableFields.email ? 'Cancelar' : 'Editar'}
                                </Button>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Telefone:</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    disabled={!editableFields.phone}
                                />
                                <Button
                                    variant={editableFields.phone ? "outline-secondary" : "outline-primary"}
                                    onClick={() => toggleEditField('phone')}
                                    className="button-editar"
                                >
                                    {editableFields.phone ? 'Cancelar' : 'Editar'}
                                </Button>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Estado:</InputGroup.Text>
                                <Form.Select
                                    value={selectedState || ""}
                                    onChange={(e) => {
                                        const stateId = e.target.value;
                                        setSelectedState(stateId);
                                        setSelectedCity(''); // Reseta a cidade quando muda o estado
                                    }}
                                    required
                                >
                                    {/* Opção vazia apenas se não houver selectedState */}
                                    {!selectedState && <option value="">Selecione</option>}

                                    {states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.nome}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Cidade:</InputGroup.Text>
                                <Form.Select
                                    value={selectedCity || ""}
                                    onChange={(e) => {
                                        const cityId = e.target.value;
                                        setSelectedCity(cityId);
                                        setCityId(cityId);
                                    }}
                                    required
                                    disabled={!selectedState}
                                >
                                    {!selectedCity && <option value="">Selecione</option>}

                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.nome}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>

                            <InputGroup className="mb-3">
                                <InputGroup.Text style={{ width: '120px' }}>Username:</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Deve ser único"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={!editableFields.username}
                                />
                                <Button
                                    variant={editableFields.username ? "outline-primary" : "outline-secondary"}
                                    onClick={() => checkUsernameAvailability(username)}
                                    disabled={!editableFields.username}
                                >
                                    <IoSearch />
                                </Button>
                                <Button
                                    variant={editableFields.username ? "outline-secondary" : "outline-primary"}
                                    onClick={() => toggleEditField('username')}
                                    className='button-editar'
                                >
                                    {editableFields.username ? 'Cancelar' : 'Editar'}
                                </Button>
                            </InputGroup>
                            {usernameMessage}

                            <Button variant="primary" type="submit" className="w-100" style={{ marginTop: '20px' }}>
                                Salvar
                            </Button>
                            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                        </Form>
                    </Card>
                </Col>
            </Row>
            <ReusedModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title={modalContent.title}
                message={modalContent.message}
            />
        </div>
    );
};

export default AccountUpdate;