import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LocalTime } from "@devmentor/ui/components/bookings/local-time";

const meta = {
  title: "Product/E02 Find and book/Local time",
  component: LocalTime,
  args: { iso: "2026-11-13T09:00:00Z", zone: "Europe/London" },
  argTypes: {
    iso: { control: "text", description: "UTC ISO string from the server." },
    zone: {
      control: "text",
      description:
        "IANA zone. Leave empty to use the viewer's browser zone (UTC until mounted).",
    },
  },
} satisfies Meta<typeof LocalTime>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SameMomentInTwoZones: Story = {
  name: "Data: one moment, viewer zone and Europe/Warsaw",
  render: (args) => (
    <p className="flex flex-col text-interface">
      <LocalTime {...args} />
      <LocalTime
        iso={args.iso}
        zone="Europe/Warsaw"
        className="text-muted-foreground"
      />
    </p>
  ),
};

export const AcrossMidnight: Story = {
  name: "Data: the day changes with the zone",
  args: { iso: "2026-11-13T23:30:00Z", zone: "Asia/Tokyo" },
};
