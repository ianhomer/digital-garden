# Digital Garden

Rendering of Digital Garden markdown into a web site.

## tl;dr

    pnpm i
    pnpm prebuild
    pnpm dev

## Linking Garden

You can change the git checkout to a symbolic link

    rm gardens/boxofjam
    cd gardens
    ln -s boxofjam ../../../things/boxofjam

## Vercel Deployment

Change the build command to

    yum install yum-utils && yum-config-manager
      --add-repo=https://copr.fedorainfracloud.org/coprs/carlwgeorge/ripgrep/repo/epel-7/carlwgeorge-ripgrep-epel-7.repo
      && yum -y install ripgrep && yarn build

## Other gardens

The gardens are configured in garden.config.js. Multiple gardens can be
configured. Only public GitHub URLs are supported for now.
