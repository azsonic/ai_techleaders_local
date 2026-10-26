import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { addons } from "storybook/preview-api";

import "./preview.css";

/** Rule 9: the theme goes on the document root so dialogs, menus and popovers rendered outside the story inherit it. */
const applyTheme = (theme: unknown) => {
  // Events without a theme (a framed story reports none) must not reset the page to light.
  if (theme !== "dark" && theme !== "light") return;
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
};

/*
 * A story shown in its own frame inside a docs page (open dialogs, menus, toasts) has no toolbar of its own.
 * It follows the docs page that contains it, so the theme reaches overlays rendered in that frame too.
 */
const docsHost = (() => {
  try {
    return window.frameElement?.closest(".sbdocs")
      ? window.parent.document.documentElement
      : null;
  } catch {
    return null;
  }
})();

if (docsHost) {
  const follow = () =>
    applyTheme(docsHost.classList.contains("dark") ? "dark" : "light");
  follow();
  new MutationObserver(follow).observe(docsHost, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

const withTheme: Decorator = (Story, context) => {
  if (!docsHost) applyTheme(context.globals.theme);
  return <Story />;
};

// Documentation pages render no story, so the decorator does not run there. Follow the toolbar directly.
const channel = addons.getChannel();
channel.on("globalsUpdated", ({ globals }: { globals: { theme?: string } }) =>
  applyTheme(globals.theme),
);
channel.on("setGlobals", ({ globals }: { globals: { theme?: string } }) =>
  applyTheme(globals.theme),
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: docsHost
    ? {}
    : { theme: import.meta.env.STORYBOOK_THEME === "dark" ? "dark" : "light" },
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    docs: { toc: true },
    options: {
      storySort: {
        order: [
          "Design system",
          [
            "Start here",
            "Components",
            "How to choose",
            "Usage and accessibility",
            "Content",
            "What to avoid",
            "What is missing",
            "Contributing",
            "Screens and state maps",
          ],
          "Foundations",
          "Primitives",
          "Product",
          "Patterns",
        ],
      },
    },
  },
};

export default preview;
