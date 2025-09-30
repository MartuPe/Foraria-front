import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App component', () => {
  render(<App />);
  // Replace this with a relevant assertion for your App
  expect(screen.getByText(/Foraria/i)).toBeInTheDocument();
});