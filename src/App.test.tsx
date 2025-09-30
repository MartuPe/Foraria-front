// src/App.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock de cada página para identificarla fácilmente
jest.mock('./pages/Login',             () => () => <div>Login Page</div>);
jest.mock('./pages/RecoverPassword',   () => () => <div>Recover Password Page</div>);
jest.mock('./pages/UpdateData',        () => () => <div>Update Data Page</div>);
jest.mock('./pages/Profile',           () => () => <div>Profile Page</div>);
jest.mock('./pages/ChangeData',        () => () => <div>Change Data Page</div>);

// Opcional: Silenciar los warnings de future flags de React Router
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(msg => {
    if (msg.includes('React Router Future Flag Warning')) return;
    // para cualquier otro warning:
    // console.warn(msg);
  });
});

describe('Rutas de <App />', () => {
  const renderAppAt = (path: string) => {
    // 1) Simula la ruta en el history del navegador
    window.history.pushState({}, '', path);
    // 2) Renderiza la App, que usa BrowserRouter internamente
    render(<App />);
  };

  it('renderiza Login en la ruta "/"', () => {
    renderAppAt('/');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renderiza Login en la ruta "/iniciarSesion"', () => {
    renderAppAt('/iniciarSesion');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renderiza RecoverPassword en la ruta "/recuperar"', () => {
    renderAppAt('/recuperar');
    expect(screen.getByText('Recover Password Page')).toBeInTheDocument();
  });

  it('renderiza UpdateData en la ruta "/actualizarInformacion"', () => {
    renderAppAt('/actualizarInformacion');
    expect(screen.getByText('Update Data Page')).toBeInTheDocument();
  });

  it('renderiza Profile en la ruta "/perfil"', () => {
    renderAppAt('/perfil');
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  it('renderiza ChangeData en la ruta "/editarInformacion"', () => {
    renderAppAt('/editarInformacion');
    expect(screen.getByText('Change Data Page')).toBeInTheDocument();
  });
});