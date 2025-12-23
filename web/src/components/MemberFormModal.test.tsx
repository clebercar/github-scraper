import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberFormModal } from './MemberFormModal';
import { Toaster } from '@/components/ui/toaster';

const renderWithToaster = (component: React.ReactElement) => {
  return render(
    <>
      {component}
      <Toaster />
    </>
  );
};

describe('MemberFormModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render add mode when no member is provided', () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    expect(screen.getByText('Adicionar Novo Membro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
  });

  it('should render edit mode when member is provided', () => {
    const member = {
      id: 1,
      name: 'John Doe',
      url: 'https://github.com/johndoe',
      username: 'johndoe',
      avatar_url: null,
      followers_count: 100,
      following_count: 50,
      public_repos_count: 20,
      starts_count: 500,
      total_contributions_last_year: 1000,
      organizations: [],
      location: 'SP',
      short_url: 'https://short.ly/abc',
      scraping_status: 'completed' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    renderWithToaster(<MemberFormModal {...defaultProps} member={member} />);

    expect(screen.getByText('Editar Membro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://github.com/johndoe')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    renderWithToaster(<MemberFormModal {...defaultProps} open={false} />);

    expect(screen.queryByText('Adicionar Novo Membro')).not.toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const urlInput = screen.getByLabelText(/url do github/i);
    await userEvent.type(urlInput, 'https://github.com/test');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
  });

  it('should show validation error when url is empty', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.type(nameInput, 'John Doe');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('URL é obrigatória')).toBeInTheDocument();
  });

  it('should show validation error for invalid url', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.type(nameInput, 'John Doe');

    const urlInput = screen.getByLabelText(/url do github/i);
    await userEvent.type(urlInput, 'not-a-url');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('URL inválida')).toBeInTheDocument();
  });

  it('should show validation error for non-github url', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.type(nameInput, 'John Doe');

    const urlInput = screen.getByLabelText(/url do github/i);
    await userEvent.type(urlInput, 'https://gitlab.com/johndoe');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('URL deve ser do GitHub')).toBeInTheDocument();
  });

  it('should call onSubmit with form data when valid', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.type(nameInput, 'John Doe');

    const urlInput = screen.getByLabelText(/url do github/i);
    await userEvent.type(urlInput, 'https://github.com/johndoe');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        url: 'https://github.com/johndoe',
      });
    });
  });

  it('should call onOpenChange when cancel button is clicked', async () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display description for add mode', () => {
    renderWithToaster(<MemberFormModal {...defaultProps} />);

    expect(
      screen.getByText(/adicione um novo perfil do github para monitorar/i)
    ).toBeInTheDocument();
  });

  it('should display description for edit mode', () => {
    const member = {
      id: 1,
      name: 'John Doe',
      url: 'https://github.com/johndoe',
      username: 'johndoe',
      avatar_url: null,
      followers_count: 100,
      following_count: 50,
      public_repos_count: 20,
      starts_count: 500,
      total_contributions_last_year: 1000,
      organizations: [],
      location: 'SP',
      short_url: 'https://short.ly/abc',
      scraping_status: 'completed' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    renderWithToaster(<MemberFormModal {...defaultProps} member={member} />);

    expect(
      screen.getByText(/atualize as informações do membro/i)
    ).toBeInTheDocument();
  });
});
