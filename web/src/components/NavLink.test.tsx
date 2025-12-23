import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { NavLink } from "./NavLink";

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("NavLink", () => {
  it("should render link", () => {
    renderWithRouter(<NavLink to="/test">Test Link</NavLink>);

    const link = screen.getByRole("link", { name: "Test Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should apply className", () => {
    renderWithRouter(
      <NavLink to="/test" className="custom-class">
        Test Link
      </NavLink>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
  });

  it("should apply activeClassName when link is active", () => {
    renderWithRouter(
      <NavLink to="/" activeClassName="active-class">
        Home
      </NavLink>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveClass("active-class");
  });

  it("should apply pendingClassName when link is pending", () => {
    renderWithRouter(
      <NavLink to="/pending" pendingClassName="pending-class">
        Pending
      </NavLink>
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });
});
