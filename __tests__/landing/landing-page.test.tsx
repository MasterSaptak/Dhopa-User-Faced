import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import LandingPage from "@/app/(landing)/page"

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill: _fill, priority: _priority, ...rest }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...rest} />
  },
}))

describe("Landing page smoke test", () => {
  it("renders header, hero and pricing grid", () => {
    render(<LandingPage />)

    expect(screen.getByRole("banner")).toBeTruthy()
    expect(screen.getByLabelText("Hero section")).toBeTruthy()
    expect(screen.getByLabelText("Pricing section")).toBeTruthy()
  })

  it("exposes CTA buttons for conversions", () => {
    render(<LandingPage />)

    const hero = screen.getByLabelText("Hero section")
    const heroScope = within(hero)

    expect(heroScope.getByRole("link", { name: /get started/i })).toBeTruthy()
    expect(heroScope.getByRole("link", { name: /see pricing/i })).toBeTruthy()
    expect(heroScope.getByRole("link", { name: /place your order/i })).toBeTruthy()
  })
})

