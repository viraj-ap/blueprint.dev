export type Template = {
  id: string;
  name: string;
  content: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "empty",
    name: "Empty Project",
    content: JSON.stringify({
      ROOT: {
        id: "ROOT",
        type: "doc",
        children: [],
      },
    }),
  },
  {
    id: "blog",
    name: "Blog Post",
    content: JSON.stringify({
      ROOT: {
        id: "ROOT",
        type: "doc",
        children: [],
      },
    }),
  },
];
