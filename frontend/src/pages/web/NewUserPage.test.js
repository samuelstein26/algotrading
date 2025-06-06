import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewUserPage from './NewUserPage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import mockApi from '../../hooks/api.js';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('../../hooks/api.js', () => ({
    post: jest.fn(),
    get: jest.fn(),
}));

describe('NewUserPage', () => {
    const mockNavigate = jest.fn();

    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
      });

    beforeEach(() => {
        useNavigate.mockImplementation(() => mockNavigate);
        axios.get.mockImplementation((url) => {
            if (url.includes('estados')) {
                return Promise.resolve({
                    data: [
                        { id: 1, sigla: 'SP', nome: 'São Paulo' },
                        { id: 2, sigla: 'RJ', nome: 'Rio de Janeiro' },
                    ],
                });
            }
            return Promise.reject(new Error('URL não mockada'));
        });

        mockApi.get.mockImplementation((url) => {
            if (url.includes('servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios')) { // ou o endpoint real que seu componente usa
                return Promise.resolve({
                    data: [
                        { id: '3550308', nome: 'São Paulo' },
                        { id: '3509502', nome: 'Campinas' }
                    ]
                });
            }
            return Promise.reject(new Error('Endpoint não mockado'));
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza corretamente', () => {
        render(<NewUserPage />);
        expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
        expect(screen.getByTestId('nome-input')).toBeInTheDocument();
        expect(screen.getByTestId('sobrenome-input')).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    test('validação de email', () => {
        render(<NewUserPage />);
        const emailInput = screen.getByTestId('email-input');

        // Testa email inválido
        fireEvent.change(emailInput, { target: { value: 'emailinvalido' } });
        expect(emailInput).toHaveClass('is-invalid');

        // Testa email válido
        fireEvent.change(emailInput, { target: { value: 'valido@email.com' } });
        expect(emailInput).not.toHaveClass('is-invalid');
    });

    test('formatação de telefone', () => {
        render(<NewUserPage />);
        const phoneInput = screen.getByTestId('telefone-input');

        fireEvent.change(phoneInput, { target: { value: '11987654321' } });
        expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    test('carrega estados ao montar o componente', async () => {
        render(<NewUserPage />);

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(axios.get).toHaveBeenCalledWith(
            'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
        );
        expect(await screen.findByText('São Paulo')).toBeInTheDocument();
    });

    test('validação de senha', () => {
        render(<NewUserPage />);
        const passwordInput = screen.getByTestId('password-input');

        // Senha inválida
        fireEvent.change(passwordInput, { target: { value: '123' } });
        expect(passwordInput).toHaveClass('invalid-password');

        // Senha válida
        fireEvent.change(passwordInput, { target: { value: 'Senha123' } });
        expect(passwordInput).not.toHaveClass('invalid-password');
    });

    test('verificação de disponibilidade de username', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { isAvailable: false } });

        render(<NewUserPage />);

        // Encontra o input pelo placeholder (ou outro atributo)
        const usernameInput = screen.getByPlaceholderText('Deve ser único');

        // Encontra o botão pelo data-testid
        const checkButton = screen.getByTestId('username-check-button');

        fireEvent.change(usernameInput, { target: { value: 'usuario' } });
        fireEvent.click(checkButton);

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith('/usernamecheck', {
                params: { username: 'usuario' },
            });
        });

        expect(await screen.findByText(/já está em uso/i)).toBeInTheDocument();
    });

    test('deve prevenir submit quando campos required estão vazios', async () => {
        render(<NewUserPage />);

        const form = screen.getByTestId('register-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockApi.post).not.toHaveBeenCalled();
        });
    });

    test('carrega os estados do IBGE e exibe a lista', async () => {
        const mockData = [{ id: 1, nome: 'São Paulo' }, { id: 2, nome: 'Rio de Janeiro' }];
        axios.get.mockResolvedValueOnce({ data: mockData });

        render(<NewUserPage />);

        // espera a atualização assíncrona de estado
        await waitFor(() => {
            expect(screen.getByText('São Paulo')).toBeInTheDocument();
            expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
        });
    });
});