// keystatic.config.ts
import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    project: "luka-adzic-portfolio/lukaadzic", // Replace with your actual team/project from Keystatic Cloud
  },
  collections: {
    posts: collection({
      label: "Journal Entries",
      slugField: "title",
      path: "src/content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        publishedDate: fields.date({ label: "Published Date" }),
        postType: fields.select({
          label: "Entry Type",
          options: [
            { label: "Long Entry", value: "post" },
            { label: "Quick Note", value: "take" },
          ],
          defaultValue: "post",
        }),
        excerpt: fields.text({
          label: "Excerpt",
          description: "A short description of the post",
        }),
        featuredImage: fields.image({
          label: "Featured Image",
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
        featuredImagePosition: fields.text({
          label: "Legacy Position (ignore - will be removed)",
          description:
            "This field is deprecated, use Featured Image Crop Position below",
        }),

        featuredImageCrop: fields.object(
          {
            x: fields.number({
              label: "X Position (%) - 0=left, 50=center, 100=right",
              defaultValue: 50,
              validation: { min: 0, max: 100 },
            }),
            y: fields.number({
              label: "Y Position (%) - 0=top, 50=center, 100=bottom",
              defaultValue: 50,
              validation: { min: 0, max: 100 },
            }),
          },
          {
            label: "Featured Image Crop Position",
            description:
              "Adjust what part of the image shows in the writing page preview frame. Upload your image first, then adjust these values and preview on the writing page.",
          }
        ),
        additionalImages: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/posts",
              publicPath: "/images/posts/",
            }),
            alt: fields.text({
              label: "Alt text",
              description: "Alternative text for the image",
            }),
          }),
          {
            label: "Additional Images",
            description:
              "Add more images to display in a grid below the featured image",
            itemLabel: (props) => props.fields.alt.value || "Additional Image",
          }
        ),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/posts",
              publicPath: "/images/posts/",
            },
          },
        }),
      },
    }),
  },
});
