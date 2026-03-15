const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

export default {
  title: "Manaflow",
  description: "Replay-first TCG engine and viewer monorepo",
  base: isGitHubPagesBuild && repositoryName ? `/${repositoryName}/` : "/",
  themeConfig: {
    nav: [
      { text: "Inicio", link: "/" },
      { text: "Tutoriales", link: "/tutorials/" },
      { text: "Recipes", link: "/recipes/" },
      { text: "Referencia", link: "/reference/glossary" },
    ],
    sidebar: [
      {
        text: "Empezar",
        collapsed: false,
        items: [
          { text: "Introduccion", link: "/" },
          { text: "Primeros pasos", link: "/guide/getting-started" },
          { text: "Tutoriales", link: "/tutorials/" },
        ],
      },
      {
        text: "Guía",
        collapsed: false,
        items: [
          { text: "Arquitectura", link: "/guide/architecture" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
        ],
      },
      {
        text: "Recipes",
        collapsed: false,
        items: [
          { text: "Índice", link: "/recipes/" },
          { text: "Quick Start React", link: "/recipes/quick-start-react" },
          { text: "Quick Start Vue", link: "/recipes/quick-start-vue" },
          { text: "Personalizar cartas", link: "/recipes/custom-card-render" },
          { text: "Personalizar zonas", link: "/recipes/custom-zones" },
          { text: "Agregar nuevo juego", link: "/recipes/add-new-game" },
        ],
      },
      {
        text: "Referencia",
        collapsed: true,
        items: [
          { text: "Glosario", link: "/reference/glossary" },
          { text: "Tipos", link: "/reference/types" },
          { text: "Esquemas JSON", link: "/reference/schemas" },
        ],
      },
      {
        text: "Paquetes",
        collapsed: true,
        items: [
          { text: "Índice", link: "/packages/" },
          { text: "@manaflow/types", link: "/packages/types" },
          { text: "@manaflow/core", link: "/packages/core" },
          { text: "@manaflow/react", link: "/packages/react" },
          { text: "@manaflow/vue", link: "/packages/vue" },
        ],
      },
    ],
  },
};
