'use strict';

const DevTool = require('../lib');
const Podlet = require('@podium/podlet');
const app = require('express')();

const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    defaults: true,
});

podlet.defaults({
    token: 'as3d24asd34asd4',
    mountOrigin: '/testing',
});

const podlet2 = new Podlet({
    name: 'myPodlet2',
    version: '1.0.0',
    defaults: true,
});

podlet2.defaults({
    mountPathname: '/blah',
});

const devTool = new DevTool({
    logger: console,
});
devTool.register(podlet);
devTool.register(podlet2);

app.use('/podlet', podlet.middleware());

app.get(`/podlet${podlet.manifest()}`, (req, res) => {
    res.json(podlet);
});

app.get(`/podlet${podlet.content()}`, (req, res) => {
    res.json({ context: res.locals.podium.context });
});

app.use('/podlet2', podlet2.middleware());

app.get(`/podlet2${podlet.manifest()}`, (req, res) => {
    res.json(podlet);
});

app.get(`/podlet2${podlet.content()}`, (req, res) => {
    res.json({ context: res.locals.podium.context });
});

app.listen(7100);
devTool.listen(8172);

// GET http://localhost:7101/
// GET http://localhost:7101/podlet
// GET http://localhost:7101/podlet/:name
// GET http://localhost:7101/context
// GET http://localhost:7101/context/:name
// POST http://localhost:7101/context
// POST http://localhost:7101/context/:name
