# @podium/dev-tool

Tool that exposes a development API on Podium podlets for use in [browser development tools](../client).

## Getting started

Install the developer tool module:

```sh
npm install @podium/dev-tool
```

Then configure it in your podlet:

```js
import express from "express";
import Podlet from "@podium/podlet";
import DevTool from "@podium/dev-tool";

const app = express();

const podlet = new Podlet({
	name: "myPodlet",
	version: "1.0.0",
	pathname: "/",
	development: true,
});

podlet.defaults({
	token: "as3d24asd34asd4",
	mountOrigin: "/testing",
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
await devTool.start();
```

## Endpoints

```js
// GET http://localhost:8172/
// GET http://localhost:8172/podlet
// GET http://localhost:8172/podlet/:name
// GET http://localhost:8172/context
// GET http://localhost:8172/context/:name
// POST http://localhost:8172/context
// POST http://localhost:8172/context/:name
```
