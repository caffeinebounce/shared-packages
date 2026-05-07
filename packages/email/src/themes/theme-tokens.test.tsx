import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { compassThemeTokens } from "./compass";
import { ThemedLayout } from "./components/ThemedLayout";
import { factoryThemeTokens } from "./factory";

describe("email theme tokens", () => {
  it("defines per-theme card radius tokens", () => {
    expect(factoryThemeTokens.boxRadius).toBe("0px");
    expect(compassThemeTokens.boxRadius).toBe("8px");
  });

  it("uses the configured content card radius", async () => {
    const html = await render(
      <ThemedLayout
        config={{
          appName: "Factory",
          companyName: "Factory HQ LLC",
          address: "1 SE 3rd Ave, Suite 1750, Miami, FL 33131",
          accentColor: factoryThemeTokens.accentColor,
          siteUrl: "https://factoryinvestments.com",
          logoUrl: "https://example.com/logo.png",
        }}
        tokens={factoryThemeTokens}
        category="transactional"
        preview="Preview"
      >
        <p>Test email</p>
      </ThemedLayout>,
    );

    expect(html).toContain("border-radius:0px");
  });
});
