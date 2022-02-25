# Digital Garden

Rendering of Digital Garden markdown into a web site.

## tl;dr

    pnpm install
    pnpm build:prepare
    pnpm dev

## Linking Garden

You can change the git checkout to a symbolic link

    rm gardens/boxofjam
    cd gardens
    ln -s boxofjam ../../../things/boxofjam

## Vercel Deployment

Change the build command to

    pnpm build:prepare && pnpm build

And change install command to

    pnpm install

## Other gardens

The gardens are configured in garden.config.js. Multiple gardens can be
configured. Only public GitHub URLs are supported for now.

## Testing

### e2e

    pnpm test:e2e
