'use strict';

const express = require('express');
const Podlet = require('@podium/podlet');
const DevToolApi = require('../lib/index');

const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    defaults: true,
    // logger: console,
});

const logger = {
    ...console,
    fatal: console.log,
    trace() {},
};
const devToolApi = new DevToolApi({ enabled: true, logger });

app.use(podlet.middleware());
app.use(devToolApi.middleware());

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get(podlet.content(), (req, res) => {
    res.json({ context: res.locals.podium.context });
});

app.listen(7100);
