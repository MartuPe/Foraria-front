import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders login page link', () => {
  render(
      <App />
  );
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
