import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MemberProfile from "./MemberProfile";
import { api } from "@/services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

const mockMember = {
  id: 1,
  name: "John Doe",
  url: "https://github.com/johndoe",
  username: "johndoe",
  avatar_url: "https://github.com/johndoe.png",
  followers_count: 100,
  following_count: 50,
  public_repos_count: 20,
  starts_count: 500,
  total_contributions_last_year: 1000,
  organizations: ["org1", "org2"],
  location: "São Paulo, Brazil",
  short_url: "https://short.ly/abc123",
  scraping_status: "completed" as const,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ["/members/1"]
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {component}
          <Toaster />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe("MemberProfile", () => {
  beforeEach(() => {
    mockedApi.getMember.mockResolvedValue(mockMember);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    renderWithRouter(<MemberProfile />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should render member profile after loading", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByText("São Paulo, Brazil")).toBeInTheDocument();
  });

  it("should display member statistics", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("should display member organizations", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("org1")).toBeInTheDocument();
    });

    expect(screen.getByText("org2")).toBeInTheDocument();
  });

  it("should display status badge", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("Concluído")).toBeInTheDocument();
    });
  });

  it("should have back link to home", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const backLink = screen.getByRole("link", { name: /voltar para lista/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("should open edit modal when edit button is clicked", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /editar/i });
    await userEvent.click(editButton);

    expect(screen.getByText("Editar Membro")).toBeInTheDocument();
  });

  it("should open delete dialog when delete button is clicked", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /remover/i });
    await userEvent.click(deleteButton);

    expect(screen.getByText("Remover Membro")).toBeInTheDocument();
    expect(
      screen.getByText(/tem certeza que deseja remover/i)
    ).toBeInTheDocument();
  });

  it("should call rescan API when rescan button is clicked", async () => {
    mockedApi.rescanMember.mockResolvedValue(mockMember);

    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const rescanButton = screen.getByRole("button", { name: /re-escanear/i });
    await userEvent.click(rescanButton);

    await waitFor(() => {
      expect(mockedApi.rescanMember).toHaveBeenCalledWith(1, {
        name: mockMember.name,
        url: mockMember.url,
      });
    });
  });

  it("should handle member not found error", async () => {
    mockedApi.getMember.mockRejectedValue(new Error("Member not found"));

    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("Erro ao carregar membro")).toBeInTheDocument();
    });
  });

  it("should display member URLs", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const githubUrl = screen.getByText(mockMember.url);
    expect(githubUrl).toBeInTheDocument();

    const shortUrl = screen.getByText(/URL Curta:/i);
    expect(shortUrl).toBeInTheDocument();
  });

  it("should display created and updated dates", async () => {
    renderWithRouter(<MemberProfile />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText(/criado em:/i)).toBeInTheDocument();
    expect(screen.getByText(/atualizado em:/i)).toBeInTheDocument();
  });
});
