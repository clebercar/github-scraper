import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('should render with icon, label and value', () => {
    render(<StatCard icon={<Users />} label="Followers" value={100} />);

    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should format numbers with locale string', () => {
    render(<StatCard icon={<Users />} label="Followers" value={1000} />);

    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('should display dash when value is null', () => {
    render(<StatCard icon={<Users />} label="Followers" value={null} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should display string values as is', () => {
    render(<StatCard icon={<Users />} label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCard icon={<Users />} label="Followers" value={100} className="custom-class" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should render icon', () => {
    const { container } = render(<StatCard icon={<Users />} label="Followers" value={100} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

