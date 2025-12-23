import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MemberCard } from './MemberCard';
import { Member } from '@/types/member';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MemberCard', () => {
  const mockMember: Member = {
    id: 1,
    name: 'John Doe',
    url: 'https://github.com/johndoe',
    username: 'johndoe',
    avatar_url: 'https://github.com/johndoe.png',
    followers_count: 100,
    following_count: 50,
    public_repos_count: 20,
    starts_count: 500,
    total_contributions_last_year: 1000,
    organizations: ['org1', 'org2'],
    location: 'Sao Paulo',
    short_url: 'https://short.ly/abc123',
    scraping_status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render member name', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render member username', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('should render member location', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText(/Sao Paulo/)).toBeInTheDocument();
  });

  it('should render short url', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText('https://short.ly/abc123')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('should render avatar with initials as fallback', () => {
    const memberWithoutAvatar = { ...mockMember, avatar_url: null };
    renderWithRouter(<MemberCard member={memberWithoutAvatar} onEdit={mockOnEdit} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render organizations', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    expect(screen.getByText(/org1, org2/)).toBeInTheDocument();
  });

  it('should show truncated organizations when more than 2', () => {
    const memberWithManyOrgs = {
      ...mockMember,
      organizations: ['org1', 'org2', 'org3', 'org4'],
    };
    renderWithRouter(<MemberCard member={memberWithManyOrgs} onEdit={mockOnEdit} />);

    expect(screen.getByText(/\+2/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    await userEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockMember);
  });

  it('should have link to view member details', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    const viewLink = screen.getByRole('link', { name: /visualizar/i });
    expect(viewLink).toHaveAttribute('href', '/members/1');
  });

  it('should render short url as external link', () => {
    renderWithRouter(<MemberCard member={mockMember} onEdit={mockOnEdit} />);

    const externalLink = screen.getByText('https://short.ly/abc123').closest('a');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not render username section when username is null', () => {
    const memberWithoutUsername = { ...mockMember, username: null };
    renderWithRouter(<MemberCard member={memberWithoutUsername} onEdit={mockOnEdit} />);

    expect(screen.queryByText('@')).not.toBeInTheDocument();
  });

  it('should render different status badges', () => {
    const processingMember = { ...mockMember, scraping_status: 'processing' as const };
    renderWithRouter(<MemberCard member={processingMember} onEdit={mockOnEdit} />);

    expect(screen.getByText('Processando')).toBeInTheDocument();
  });
});
