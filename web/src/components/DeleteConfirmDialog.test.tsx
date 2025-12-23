import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

describe("DeleteConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    memberName: "John Doe",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render dialog when open", () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Remover Membro")).toBeInTheDocument();
    expect(
      screen.getByText(/tem certeza que deseja remover/i)
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    render(<DeleteConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Remover Membro")).not.toBeInTheDocument();
  });

  it("should display member name in confirmation message", () => {
    render(<DeleteConfirmDialog {...defaultProps} memberName="Jane Smith" />);

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should call onConfirm when remove button is clicked", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const removeButton = screen.getByRole("button", { name: /remover/i });
    await userEvent.click(removeButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await userEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalled();
  });

  it("should show loading state when isLoading is true", () => {
    render(<DeleteConfirmDialog {...defaultProps} isLoading={true} />);

    const removeButton = screen.getByRole("button", { name: /remover/i });
    expect(removeButton).toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    expect(cancelButton).toBeDisabled();
  });

  it("should display warning icon", () => {
    render(<DeleteConfirmDialog {...defaultProps} open={true} />);

    const icons = document.body.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should display action cannot be undone message", () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    expect(screen.getByText(/não pode ser desfeita/i)).toBeInTheDocument();
  });
});
