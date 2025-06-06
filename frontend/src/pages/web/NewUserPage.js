import React, { useState, useEffect } from 'react';
import api from '../../hooks/api.js';
import axios from 'axios';
import CopyRight from '../../components/CopyRight.js';
import { Row, Col, Card, Form, Button, Alert, InputGroup, OverlayTrigger, Popover } from 'react-bootstrap';
import { IoSearch } from "react-icons/io5";
import { MdInfoOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const NewUserPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');

    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);

    const [phone, setPhone] = useState('');

    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
    const [cityId, setCityId] = useState('');

    const [states, setStates] = useState([]);
    const [estateID, setEstateID] = useState('');
    const [selectedState, setSelectedState] = useState('');

    const [username, setUsername] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [showPasswordRules, setShowPasswordRules] = useState(false);

    const [error, setError] = useState(null)
    const [usernameMessage, setUsernameMessage] = useState('')

    // Carrega a lista de estados
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
                setStates(response.data);
            } catch (error) {
                console.error('Erro ao buscar estados:', error);
            }
        };
        fetchStates();
    }, []);

    // Carrega as cidades
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailValid) {
            setError('Por favor, insira um email válido.');
            return;
        }

        if (!isUsernameAvailable) {
            setError('O nome de usuário já está em uso.');
            return;
        }

        // Validação manual dos campos obrigatórios
        const form = e.target;
        if (!form.checkValidity()) {
            // Mostra mensagens de validação do HTML5
            form.reportValidity();
            return;
        }

        try {
            const response = await api.post('/register', {
                nome: name,
                sobrenome: surname,
                email: email,
                telefone: phone,
                estadoID: estateID,
                cidadeID: cityId,
                cidadeNome: selectedCity,
                username: username,
                password: password
            });

            if (response.data) {
                navigate('/login');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Erro ao processar a requisição';
            console.error('Erro detalhado:', error);
            setError(errorMessage);
        }
    };

    const validateEmail = (email) => {
        const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);

        setIsEmailValid(validateEmail(newEmail) || newEmail === '');
    };

    const formatPhone = (value) => {
        // Remove todos os caracteres não numéricos
        const cleaned = value.replace(/\D/g, '');
        const limit = cleaned.slice(0, 11);

        if (limit.length <= 11) {
            return limit
                .replace(/(\d{2})(\d)/, '($1) $2') // Adiciona parênteses e espaço após o DDD
                .replace(/(\d{4,5})(\d{4})/, '$1-$2'); // Adiciona o hífen
        }

        return limit;
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhone(e.target.value);
        setPhone(formattedPhone);
    };

    const checkUsernameAvailability = async (username) => {
        if (username.trim() !== '') {
            try {
                const response = await api.get('/usernamecheck', { params: { username } });
                setIsUsernameAvailable(response.data.isAvailable);

                if (!response.data.isAvailable) {
                    setUsernameMessage(
                        <Alert variant="danger" className="mb-3">
                            Este username já está em uso. Por favor, escolha outro.
                        </Alert>
                    )
                } else (
                    setUsernameMessage(
                        <Alert variant="success" className="mb-3">
                            Username disponível!
                        </Alert>
                    )
                )
            } catch (error) {
                console.error('Erro ao verificar username:', error);
            }
        }
    };

    const passwordRules = (
        <Popover ControlId="popover-basic">
            <Popover.Header as="h3">A senha deve conter:</Popover.Header>
            <Popover.Body>
                <li>Pelo menos 8 caracteres</li>
                <li>Pelo menos uma letra maiúscula</li>
                <li>Pelo menos uma letra minúscula</li>
                <li>Pelo menos um número</li>
            </Popover.Body>
        </Popover>
    );

    const validatePassword = (value) => {
        const hasMinLength = value.length >= 8;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);

        return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setIsPasswordValid(validatePassword(value));
    };

    const togglePasswordRules = () => {
        setShowPasswordRules(!showPasswordRules);
    };

    return (
        <>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <Row>
                    <Col>
                        <Card className="p-4 shadow-sm mw-100" style={{ width: '600px', height: 'auto' }}>
                            <Form onSubmit={handleSubmit} style={{ width: '90%' }} data-testid="register-form">
                                <h3 className="text-center mb-4">Novo Usuário</h3>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>Nome:</InputGroup.Text>
                                    <Form.Control
                                        data-testid="nome-input"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>Sobrenome:</InputGroup.Text>
                                    <Form.Control
                                        data-testid="sobrenome-input"
                                        type="text"
                                        value={surname}
                                        onChange={(e) => setSurname(e.target.value)}
                                        required
                                    />
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>Email:</InputGroup.Text>
                                    <Form.Control
                                        data-testid="email-input"
                                        type="text"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        isInvalid={!isEmailValid && email !== ''}
                                    />
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>Telefone:</InputGroup.Text>
                                    <Form.Control
                                        data-testid="telefone-input"
                                        type="text"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        maxLength={15}
                                    />
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>Estado:</InputGroup.Text>
                                    <Form.Select
                                        data-testid="estado-input"
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value)
                                            setEstateID(selectedState.id)
                                        }}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {states.map((state) => (
                                            <option key={state.id} value={state.sigla}>
                                                {state.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>
                                        Cidade:
                                    </InputGroup.Text>
                                    <Form.Select
                                        data-testid="cidade-input"
                                        value={selectedCity}
                                        onChange={(e) => {
                                            const selectedCityData = cities.find((city) => city.nome === e.target.value);

                                            if (selectedCityData) {
                                                const cityId = selectedCityData.id;
                                                const estateIdFromCity = cityId.toString().substring(0, 2);

                                                setSelectedCity(selectedCityData.nome);
                                                setCityId(cityId);
                                                setEstateID(estateIdFromCity);
                                            }
                                        }}
                                        required
                                        disabled={!selectedState}
                                    >
                                        <option value="">Selecione</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.nome}>
                                                {city.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '120px' }}>
                                        Username:
                                    </InputGroup.Text>
                                    <Form.Control
                                        data-testid="username-input"
                                        type="text"
                                        placeholder="Deve ser único"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); }}
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        ControlId="button-addon2"
                                        onClick={() => checkUsernameAvailability(username)}
                                        data-testid="username-check-button"
                                    >
                                        <IoSearch />
                                    </Button>
                                </InputGroup>
                                {usernameMessage}

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '170px' }}>
                                        Password:
                                    </InputGroup.Text>
                                    <Form.Control
                                        data-testid="password-input"
                                        type="text"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        className={password && !isPasswordValid ? 'invalid-password' : ''}
                                    />
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={passwordRules}
                                        show={showPasswordRules}
                                    >
                                        <Button variant="outline-secondary" ControlId="button-addon2" onClick={togglePasswordRules}>
                                            <MdInfoOutline />
                                        </Button>
                                    </OverlayTrigger>
                                </InputGroup>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text ControlId="basic-addon1" style={{ width: '170px' }}>
                                        Confirmar Password:
                                    </InputGroup.Text>
                                    <Form.Control
                                        data-testid="confirmar-password-input"
                                        type="text"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); }}
                                        required
                                        className={confirmPassword && confirmPassword !== password ? 'invalid-password' : ''}
                                    />
                                </InputGroup>

                                <Button variant="primary" type="submit" className="w-100" style={{ marginTop: '20px' }}  >
                                    Cadastrar
                                </Button>
                                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
            <CopyRight />
        </>
    );
};

export default NewUserPage;
