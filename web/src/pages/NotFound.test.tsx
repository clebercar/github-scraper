import React from "react";
import { render, screen } from "@testing-library/react";
import NotFound from "./NotFound";
import { BrowserRouter } from "react-router-dom";

describe("NotFound", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("should render 404 page", () => {
    renderWithRouter(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
  });

  it("should render link to home", () => {
    renderWithRouter(<NotFound />);

    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should log error to console when rendered", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderWithRouter(<NotFound />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      "/"
    );

    consoleErrorSpy.mockRestore();
  });
});
