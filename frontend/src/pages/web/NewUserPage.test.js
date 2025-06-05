import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewUserPage from './NewUserPage';
import '@testing-library/jest-dom/extend-expect';

// Mock API
jest.mock('../../hooks/api', () => ({
  post: jest.fn(),
  get: jest.fn(() => Promise.resolve({ data: { isAvailable: true } })),
}));

describe('NewUserPage', () => {
  const renderPage = () =>
    render(
      <BrowserRouter>
        <NewUserPage />
      </BrowserRouter>
    );

  it('renderiza o formulário corretamente', () => {
    renderPage();
    expect(screen.getByText(/Novo Usuário/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar/i)).toBeInTheDocument();
  });

  it('valida email incorreto', () => {
    renderPage();
    const emailInput = screen.getByLabelText(/Email:/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

    expect(emailInput).toHaveClass('is-invalid');
  });

  it('exibe mensagem de erro se username não estiver disponível', async () => {
    const api = require('../../hooks/api');
    api.get.mockResolvedValueOnce({ data: { isAvailable: false } });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/Deve ser único/i), {
      target: { value: 'usuarioexistente' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Este username já está em uso/i)
      ).toBeInTheDocument()
    );
  });

  it('valida senha incorreta', () => {
    renderPage();
    const passwordInput = screen.getByLabelText(/Password:/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    expect(passwordInput).toHaveClass('invalid-password');
  });

  it('valida que senhas diferentes exibem erro', () => {
    renderPage();
    const passInput = screen.getByLabelText(/Password:/i);
    const confirmPassInput = screen.getByLabelText(/Confirmar Password:/i);

    fireEvent.change(passInput, { target: { value: 'Senha123' } });
    fireEvent.change(confirmPassInput, { target: { value: 'Senha321' } });

    expect(confirmPassInput).toHaveClass('invalid-password');
  });
});
