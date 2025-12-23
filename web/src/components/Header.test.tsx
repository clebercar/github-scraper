import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  it('should render header with logo and title', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText('GitHub Profiles')).toBeInTheDocument();
    expect(screen.getByText('Gerenciador de Perfis')).toBeInTheDocument();
  });

  it('should have link to home', () => {
    renderWithRouter(<Header />);

    const homeLink = screen.getByRole('link');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render GitHub icon', () => {
    renderWithRouter(<Header />);

    const icon = screen.getByRole('link').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

