import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestAlgorithmPage from './TestAlgorithmPage';
import { act } from 'react';

// Mock para FileReader
class MockFileReader {
  result = '';
  onload = jest.fn();
  readAsText = jest.fn(function () {
    this.onload({ target: { result: this.result } });
  });
}

global.FileReader = MockFileReader;

jest.mock('./css/TestAlgorithmPage.css', () => ({}));

// Mock para DOMParser
const mockParseFromString = jest.fn();
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.observations = new Map();
    }
    observe(target) {
      this.observations.set(target, {});
    }
    unobserve(target) {
      this.observations.delete(target);
    }
    disconnect() {
      this.observations.clear();
    }
  };
});

beforeAll(() => {
  global.FileReader = MockFileReader;
});

describe('TestAlgorithmPage - Fluxo Completo', () => {
  const mockHTMLContent = `
    <html>
      <body>
        <table>
          <tr><td>Expert:</td><td>Meu Expert</td></tr>
          <tr><td>Symbol:</td><td>EURUSD</td></tr>
          <tr><td>Deals</td></tr>
          <tr>
            <td>2023-01-01</td>
            <td>123</td>
            <td>EURUSD</td>
            <td>buy</td>
            <td>out</td>
            <td>1.00</td>
            <td>1.1000</td>
            <td>0.00</td>
            <td>0.00</td>
            <td>100.00</td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const setup = () => {
    const utils = render(<TestAlgorithmPage />);
    const fileInput = screen.getByLabelText(/selecione o arquivo html para importar/i);
    return { ...utils, fileInput };
  };

  test('deve renderizar os gráficos após upload do arquivo', async () => {
    // 1. Setup mocks
    const mockParseResult = {
      querySelectorAll: jest.fn().mockImplementation(selector => {
        if (selector === 'td') {
          return [
            { 
              textContent: 'Expert:', 
              nextElementSibling: { textContent: ' Meu Expert ' } 
            },
          ];
        }
        if (selector === 'table') {
          return [{
            querySelectorAll: jest.fn(selector => {
              if (selector === 'th') {
                return [{ textContent: 'Deals' }];
              }
              if (selector === 'tr') {
                return [{
                  querySelectorAll: jest.fn(() => [
                    { textContent: '2023-01-01' },
                    { textContent: '123' },
                  ])
                }];
              }
              return [];
            })
          }];
        }
        return [];
      })
    };
  
    // 2. Mock FileReader implementation
    const mockFileReaderInstance = {
      readAsText: jest.fn(),
      result: mockHTMLContent,
      onload: jest.fn(),
      onerror: jest.fn()
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance);
    mockParseFromString.mockReturnValue(mockParseResult);
  
    // 3. Render component
    render(<TestAlgorithmPage />);
    
    // 4. Create test file
    const file = new File([mockHTMLContent], 'test.html', { type: 'text/html' });
    
    // 5. Trigger file input change
    const input = screen.getByLabelText(/selecione o arquivo html para importar/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    // 6. Manually trigger FileReader onload
    act(() => {
      mockFileReaderInstance.onload({ 
        target: { 
          result: mockHTMLContent 
        } 
      });
    });
  
    // 7. Wait for and verify results
    await waitFor(() => {
      expect(screen.getByText('Resumo da Estratégia')).toBeInTheDocument();
      expect(screen.getByText(/distribuição de negóciações/i)).toBeInTheDocument();
    });
  });

  test('permite upload de arquivo', async () => {
    render(<TestAlgorithmPage />);

    const file = new File(['<html><body>test</body></html>'], 'test.html', { type: 'text/html' });
    const input = screen.getByLabelText('Selecione o arquivo HTML para importar:');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(FileReader).toHaveBeenCalled();
    });
  });

  test('alterna entre abas (configurações, resultados e negociações) e busca dados', async () => {
    // 1. Setup mocks
    const mockParseResult = {
      querySelectorAll: jest.fn().mockImplementation(selector => {
        if (selector === 'td') {
          return [
            { 
              textContent: 'Expert:', 
              nextElementSibling: { textContent: ' Meu Expert ' } 
            },
          ];
        }
        if (selector === 'table') {
          return [{
            querySelectorAll: jest.fn(selector => {
              if (selector === 'th') {
                return [{ textContent: 'Deals' }];
              }
              if (selector === 'tr') {
                return [{
                  querySelectorAll: jest.fn(() => [
                    { textContent: '2023-01-01' },
                    { textContent: '123' },
                  ])
                }];
              }
              return [];
            })
          }];
        }
        return [];
      })
    };
  
    // 2. Mock FileReader implementation
    const mockFileReaderInstance = {
      readAsText: jest.fn(),
      result: mockHTMLContent,
      onload: jest.fn(),
      onerror: jest.fn()
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance);
    mockParseFromString.mockReturnValue(mockParseResult);
  
    // 3. Render component
    render(<TestAlgorithmPage />);
    
    // 4. Create test file
    const file = new File([mockHTMLContent], 'test.html', { type: 'text/html' });
    
    // 5. Trigger file input change
    const input = screen.getByLabelText(/selecione o arquivo html para importar/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    // 6. Manually trigger FileReader onload
    act(() => {
      mockFileReaderInstance.onload({ 
        target: { 
          result: mockHTMLContent 
        } 
      });
    });
  
    // 7. Wait for and verify tabs
    await waitFor(() => {
      expect(screen.getByText(/Configurações/i)).toBeInTheDocument();
      expect(screen.getByText(/Resultados/i)).toBeInTheDocument();
      expect(screen.getByText(/Negociações/i)).toBeInTheDocument();
    });

    // 8. Simulate tab change
    const configTabConf = screen.getByText(/Configurações/i);
    fireEvent.click(configTabConf);
    expect(screen.getByText(/Depósito Inicial/i)).toBeInTheDocument();

    // 9. Simulate tab change
    const configTabRes = screen.getByText(/Resultados/i);
    fireEvent.click(configTabRes);
    expect(screen.getByText(/Lucro Líquido/i)).toBeInTheDocument();
  
});

});