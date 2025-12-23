import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  describe('no-members type', () => {
    it('should render no members message', () => {
      render(<EmptyState type="no-members" />);

      expect(screen.getByText('Nenhum membro cadastrado')).toBeInTheDocument();
      expect(
        screen.getByText('Comece adicionando seu primeiro perfil do GitHub para monitorar.')
      ).toBeInTheDocument();
    });

    it('should render Users icon', () => {
      const { container } = render(<EmptyState type="no-members" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('no-results type', () => {
    it('should render no results message', () => {
      render(<EmptyState type="no-results" searchQuery="test query" />);

      expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
      expect(screen.getByText(/não encontramos membros para "test query"/i)).toBeInTheDocument();
    });

    it('should render SearchX icon', () => {
      const { container } = render(<EmptyState type="no-results" searchQuery="test" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should include search query in message', () => {
      render(<EmptyState type="no-results" searchQuery="john" />);

      expect(screen.getByText(/não encontramos membros para "john"/i)).toBeInTheDocument();
    });
  });
});

