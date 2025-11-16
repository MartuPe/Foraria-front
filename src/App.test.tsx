jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    // métodos que tu código usa, p.ej.:
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders App without crashing', () => {
  render(<App />);
});
