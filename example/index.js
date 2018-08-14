'use strict';

const express = require('express');
const Podlet = require('@podium/podlet');
const DevelopmentMiddleware = require('../lib/index');

const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    defaults: true,
});

const developmentMiddleware = new DevelopmentMiddleware({
    enabled: true,
    logger: console,
});

app.use(podlet.middleware());
app.use(developmentMiddleware.middleware());

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get(podlet.content(), (req, res) => {
    res.json({ context: res.locals.podium.context });
});

app.listen(7100);
