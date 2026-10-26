import { createCn } from "cn/config";

/*
 * Class merging that knows the design-token utilities. Without this, `text-conversation` (a font size)
 * is treated as a text color and silently dropped when merged with `text-foreground`.
 */
export const cn = createCn({
  extend: {
    theme: {
      text: ["interface", "conversation", "heading-page", "heading-section"],
      "font-weight": ["body", "emphasis"],
      radius: ["control", "panel"],
      spacing: [
        "inline",
        "within-group",
        "between-groups",
        "panel",
        "panel-compact",
        "section",
        "page-inline",
        "control",
        "control-dense",
        "control-min",
        "control-x",
        "control-x-dense",
      ],
    },
  },
});
