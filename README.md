# @podium/devtool

Tool that exposes a development API on Podium podlets and layouts for use in development tools

## Server usage

The following shows how to expose a development API for a podlet.
Multiple podlets can be registered at the same time.

```js
'use strict';

const DevTool = require('@podium/dev-tool');
const Podlet = require('@podium/podlet');
const app = require('express')();

const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
    development: true,
});

podlet.defaults({
    token: 'as3d24asd34asd4',
    mountOrigin: '/testing',
});

const devTool = new DevTool({
    logger: console,
});
devTool.register(podlet);

app.use(podlet.middleware());

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get(podlet.content(), (req, res) => {
    res.json({ context: res.locals.podium.context });
});

app.listen(7100);
devTool.listen(8172);
```

## Endpoints

```js
// GET http://localhost:7101/
// GET http://localhost:7101/podlet
// GET http://localhost:7101/podlet/:name
// GET http://localhost:7101/context
// GET http://localhost:7101/context/:name
// POST http://localhost:7101/context
// POST http://localhost:7101/context/:name
```

## Building the chrome extension

```bash
cd client
npm run build
```

The build directory can now be installed as a chrome extension by opening up extensions in chrome at `chrome://extensions/` and choosing "Load unpacked".
