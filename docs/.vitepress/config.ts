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
    ],
    sidebar: [
      {
        text: "Documentacion",
        items: [
          { text: "Introduccion", link: "/" },
          { text: "Primeros pasos", link: "/guide/getting-started" },
        ],
      },
    ],
  },
};
