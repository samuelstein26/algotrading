import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateAlgorithms from './CreateAlgorithms';
import mockApi from '../../../hooks/api';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock das funções e dependências
jest.mock('./css/CreateAlgorithms.css', () => ({}));
jest.mock('../../../hooks/api.js', () => ({
    post: jest.fn(),
    get: jest.fn(),
}));
jest.mock('../../../components/Modal.js', () => ({ show, onHide, title, message }) => (
    <div data-testid="modal" style={{ display: show ? 'block' : 'none' }}>
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onHide}>Close</button>
    </div>
));

const mockOnGenerateCode = jest.fn();
const mockOnSavePrompt = jest.fn();

describe('CreateAlgorithms', () => {
    beforeEach(() => {
        // Reset mocks antes de cada teste
        jest.clearAllMocks();
        localStorage.setItem('userID', '123');
        mockOnGenerateCode.mockResolvedValue('// Generated code');
        mockOnSavePrompt.mockResolvedValue(true);
    });

    test('rederiza o componente', () => {
        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        expect(screen.getByText('Modelos de Prompt')).toBeInTheDocument();
        expect(screen.getByTestId('prompt-input')).toBeInTheDocument();
        expect(screen.getByTestId('generate-button')).toBeInTheDocument();
    });

    test('carrega os modelos', async () => {
        const mockModels = [
            { id: 1, titulo: 'Model 1', conteudo: 'Content 1' },
            { id: 2, titulo: 'Model 2', conteudo: 'Content 2' }
        ];

        mockApi.get.mockResolvedValue({ data: mockModels });

        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith('/prompts-list/123/modelo');
            expect(screen.getByText('Model 1')).toBeInTheDocument();
            expect(screen.getByText('Model 2')).toBeInTheDocument();
        });
    });

    test('nenhum modelo disponivel quando nao ha modelos', async () => {
        mockApi.get.mockResolvedValue({ data: [] });

        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        await waitFor(() => {
            expect(screen.getByText('Nenhum modelo disponível no momento.')).toBeInTheDocument();
        });
    });

    test('should generate code when form is submitted', async () => {
        // 1. Setup mock to return test code
        mockOnGenerateCode.mockResolvedValue('// generated code');
        
        // 2. Render component
        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);
      
        // 3. Fill form using userEvent (better simulation)
        await userEvent.type(screen.getByTestId('titulo-input'), 'Test Title');
        await userEvent.type(screen.getByTestId('prompt-input'), 'Test Prompt');
        
        // 4. Submit form
        await userEvent.click(screen.getByTestId('generate-button'));
      
        // 5. Verify results
        await waitFor(() => {
          expect(mockOnGenerateCode).toHaveBeenCalledWith('Test Prompt');
          expect(screen.getByText(/Código Gerado:/)).toBeInTheDocument();
        });
      });

    test('Mostra erro no modal quando os campos sao salvo vazios', async () => {
        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        const saveButton = screen.getByTestId('save-model-button');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Erro')).toBeInTheDocument();
            expect(screen.getByText('Por favor, preencha todos os campos.')).toBeInTheDocument();
        });
    });

    test('muda o template com sucesso', async () => {
        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        const titleInput = screen.getByTestId('titulo-input');
        const promptInput = screen.getByTestId('prompt-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(promptInput, { target: { value: 'Test Prompt' } });

        expect(titleInput.value).toBe('Test Title');
        expect(promptInput.value).toBe('Test Prompt');
    });


    test('reseta campos quando o botao de reset for clicado', () => {
        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        const titleInput = screen.getByTestId('titulo-input');
        const promptInput = screen.getByTestId('prompt-input');
        const resetButton = screen.getByTestId('reset-button');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(promptInput, { target: { value: 'Test Prompt' } });
        fireEvent.click(resetButton);

        expect(titleInput.value).toBe('');
        expect(promptInput.value).toBe('');
    });

    test('Deleta modelo quando for clicado', async () => {
        const mockModels = [
            { id: 1, titulo: 'Model 1', conteudo: 'Content 1' }
        ];

        // Configuração correta do mock da API
        mockApi.get = jest.fn().mockResolvedValue({ data: mockModels });
        mockApi.delete = jest.fn().mockResolvedValue({});

        render(<CreateAlgorithms onGenerateCode={mockOnGenerateCode} onSavePrompt={mockOnSavePrompt} />);

        await waitFor(() => {
            const deleteButton = screen.getByLabelText('Deletar modelo Model 1');
            fireEvent.click(deleteButton);

            expect(mockApi.delete).toHaveBeenCalledWith('/delete-prompt/1/123');
        });
    });

});