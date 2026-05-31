import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "cms/tina-prototype";

export default defineConfig({
  branch,

  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Page Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "eyebrow",
            label: "Eyebrow",
            required: true,
          },
          {
            type: "string",
            name: "headline",
            label: "Headline",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "string",
            name: "subheadline",
            label: "Subheadline",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "string",
            name: "primaryCtaLabel",
            label: "Primary CTA Label",
          },
          {
            type: "string",
            name: "primaryCtaHref",
            label: "Primary CTA URL",
          },
          {
            type: "string",
            name: "secondaryCtaLabel",
            label: "Secondary CTA Label",
          },
          {
            type: "string",
            name: "secondaryCtaHref",
            label: "Secondary CTA URL",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Internal Notes",
            isBody: true,
          },
        ],
      },
      {
        name: "blog",
        label: "Blog",
        path: "content/blog",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Publish Date",
            required: true,
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
          },
          {
            type: "string",
            name: "category",
            label: "Category",
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
