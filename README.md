# Digital Garden

Rendering of a Zettelkasten collection of markdown content into a web site with
visualisations to help navigation and discovery of related content.

## tl;dr

    pnpm install
    pnpm build:prepare
    pnpm dev

## Linking Gardens

Configure environment with variables defined in either via a `.env` or as
shell environment variables.

Define one or more gardens, by providing an environment variable starting with
`GARDEN_` defining a git URL to the markdown content.

    GARDEN_MY=https://github.com/purplepip/boxofjam.git

## Vercel Deployment

Change the build command to

    pnpm build:prepare && pnpm build

And change install command to

    pnpm install --filter @garden/site

And set your garden locations in the environment variables.

## Testing

### e2e

    pnpm test:e2e
