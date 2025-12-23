import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingPage } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should render with medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('LoadingPage', () => {
  it('should render loading page with spinner and text', () => {
    render(<LoadingPage />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    const { container } = render(<LoadingPage />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });
});

