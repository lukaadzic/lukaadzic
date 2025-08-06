// keystatic.config.ts
import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        publishedDate: fields.date({ label: "Published Date" }),
        excerpt: fields.text({
          label: "Excerpt",
          description: "A short description of the post",
        }),
        featuredImage: fields.image({
          label: "Featured Image",
          directory: "public/images/posts",
          publicPath: "/images/posts/",
        }),
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
