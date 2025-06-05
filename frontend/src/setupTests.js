// Adiciona matchers customizados do testing-library
import '@testing-library/jest-dom';

// Configuração para testes com dates
import { setDefaultOptions } from 'date-fns';
setDefaultOptions({ weekStartsOn: 1 });

// Mock global de console.error
jest.spyOn(console, 'error').mockImplementation(() => {});