import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Index from "./Index";
import { api } from "@/services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {component}
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe("Index", () => {
  const mockMembers = [
    {
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
      organizations: ["org1"],
      location: "São Paulo",
      short_url: "https://short.ly/abc123",
      scraping_status: "completed" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      url: "https://github.com/janesmith",
      username: "janesmith",
      avatar_url: null,
      followers_count: 200,
      following_count: 100,
      public_repos_count: 30,
      starts_count: 1000,
      total_contributions_last_year: 2000,
      organizations: ["org2", "org3"],
      location: "Rio de Janeiro",
      short_url: "https://short.ly/def456",
      scraping_status: "processing" as const,
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    mockedApi.getMembers.mockResolvedValue(mockMembers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
    renderWithProviders(<Index />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should render members list after loading", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Gerenciador de Perfis" })
    ).toBeInTheDocument();
  });

  it("should render empty state when no members", async () => {
    mockedApi.getMembers.mockResolvedValue([]);

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum membro cadastrado")).toBeInTheDocument();
    });
  });

  it("should filter members by search query", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
    await userEvent.type(searchInput, "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("should show no results message when search has no matches", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
    await userEvent.type(searchInput, "NonExistentUser");

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum resultado encontrado")
      ).toBeInTheDocument();
    });
  });

  it("should clear search when clear button is clicked", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nome/i);
    await userEvent.type(searchInput, "John");

    const clearButton = screen.getByRole("button", { name: "" });
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should open modal when add button is clicked", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /adicionar novo/i });
    await userEvent.click(addButton);

    expect(screen.getByText("Adicionar Novo Membro")).toBeInTheDocument();
  });

  it("should refresh members when refresh button is clicked", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const initialCallCount = mockedApi.getMembers.mock.calls.length;

    const refreshButton = screen.getByRole("button", { name: /atualizar/i });
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockedApi.getMembers.mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });
  });

  it("should display member count", async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/2 de 2 membros/i)).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    const errorMessage = "Failed to fetch members";
    mockedApi.getMembers.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText("Erro ao carregar membros")).toBeInTheDocument();
    });
  });
});
