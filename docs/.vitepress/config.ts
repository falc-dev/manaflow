const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

export default {
  title: "Manaflow",
  description: "Replay-first TCG engine and viewer monorepo",
  base: isGitHubPagesBuild && repositoryName ? `/${repositoryName}/` : "/",
  themeConfig: {
    nav: [
      { text: "Inicio", link: "/" },
      { text: "Guia", link: "/guide/getting-started" },
      { text: "Ejemplos", link: "/examples/" },
      { text: "Paquetes", link: "/packages/" },
    ],
    sidebar: [
      {
        text: "Guia",
        items: [
          { text: "Introduccion", link: "/" },
          { text: "Primeros pasos", link: "/guide/getting-started" },
        ],
      },
      {
        text: "Ejemplos",
        items: [
          { text: "Indice", link: "/examples/" },
          { text: "Guia TCG paso a paso", link: "/examples/tcg-replay-step-by-step" },
          { text: "Core Replay", link: "/examples/core-replay" },
          { text: "Runtime Store", link: "/examples/runtime-store" },
          { text: "React Player", link: "/examples/react-player" },
          { text: "Vue Controller", link: "/examples/vue-controller" },
          { text: "HTML Visor Custom", link: "/examples/html-visor-custom" },
        ],
      },
      {
        text: "Paquetes",
        items: [
          { text: "Indice", link: "/packages/" },
          { text: "@manaflow/types", link: "/packages/types" },
          { text: "@manaflow/core", link: "/packages/core" },
          { text: "@manaflow/game-logic", link: "/packages/game-logic" },
          { text: "@manaflow/replay-runtime", link: "/packages/replay-runtime" },
          { text: "@manaflow/html-visor", link: "/packages/html-visor" },
          { text: "@manaflow/phaser-visor", link: "/packages/phaser-visor" },
          { text: "@manaflow/react", link: "/packages/react" },
          { text: "@manaflow/react-demo", link: "/packages/react-demo" },
          { text: "@manaflow/vue", link: "/packages/vue" },
          { text: "@manaflow/webpack-plugin", link: "/packages/webpack-plugin" },
        ],
      },
    ],
  },
};
