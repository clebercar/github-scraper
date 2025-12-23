import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('should render pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('should render processing status', () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText('Processando')).toBeInTheDocument();
  });

  it('should render completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('should render failed status', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Falhou')).toBeInTheDocument();
  });

  it('should apply correct classes for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-status-pending/20', 'text-status-pending');
  });

  it('should apply correct classes for processing status', () => {
    const { container } = render(<StatusBadge status="processing" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-status-processing/20', 'text-status-processing', 'animate-pulse');
  });

  it('should apply correct classes for completed status', () => {
    const { container } = render(<StatusBadge status="completed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-status-completed/20', 'text-status-completed');
  });

  it('should apply correct classes for failed status', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-status-failed/20', 'text-status-failed');
  });

  it('should show pulse indicator for processing status', () => {
    const { container } = render(<StatusBadge status="processing" />);
    const pulseIndicator = container.querySelector('.animate-pulse');
    expect(pulseIndicator).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<StatusBadge status="pending" className="custom-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-class');
  });
});

