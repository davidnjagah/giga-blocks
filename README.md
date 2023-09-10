# Description

Monorepo for GIGA made using pnpm workspaces and added nx for caching.

## Setup and Running

Installing packages in root of repo

```
pnpm i
```

For running specific apps

```
pnpm run --filter <app name> <command(dev, start)>
```

For adding package to specific apps or library

```
pnpm add --filter <app/lib name> <package name>
```

For running build or lint or test for all apps at once

```
pnpm run build/test/lint
```

If you want to add new libraries in libs, then simply add library and initialize it inside the library directory with:

```
pnpm init
```

And add it to pnpm package using:

```
pnpm add ./libs/<library name> -w
```

For running nx for specific apps or library you can write following syntax:

```
npx nx <command(built,lint,test)> <apps/libs name>
```