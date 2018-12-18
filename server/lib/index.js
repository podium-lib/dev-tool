'use strict';

const { promisify } = require('util');
const body = promisify(require('body'));
const Context = require('@podium/context');
const { version, name } = require('../package.json');
const cors = require('cors');
const abslog = require('abslog');
const express = require('express');

module.exports = class DevTool {
    constructor({ enabled = true, port = 8172, logger } = {}) {
        this.enabled = enabled;
        this.port = port;
        this.log = abslog(logger);
        this.log.debug(`${name} ${enabled ? 'enabled' : 'disabled'}`);

        this.podlets = [];

        const context = new Context({ name: 'devTools' });
        this.contextParserNames = Array.from(context.parsers.keys());

        this.app = express();
        this.app.use(cors());
        this.routes();
    }

    routes() {
        this.app.get('/', this.getVersion.bind(this));

        if (!this.enabled) return;

        this.app.get('/podlet', this.getPodlet.bind(this));
        this.app.get('/podlet/:name', this.getPodlet.bind(this));
        this.app.get('/context', this.getContext.bind(this));
        this.app.get('/context/:name', this.getContext.bind(this));
        this.app.post('/context', this.postContext.bind(this));
        this.app.post('/context/:name', this.postContext.bind(this));
    }

    normalize(context = {}) {
        context = context || {};
        let ctx = {};

        for (const key of this.contextParserNames) {
            ctx[key] = context[key] || '';
        }

        ctx = Object.assign(ctx, context);

        this.log.trace(
            `Normalized set context values "${JSON.stringify(
                context
            )}" to context object "${JSON.stringify(ctx)}"`
        );

        return ctx;
    }

    denormalize(context) {
        const ctx = {};
        for (const key of Object.keys(context)) {
            if (context[key]) ctx[key] = context[key];
        }

        this.log.trace(
            `Denormalized context object "${JSON.stringify(
                context
            )}" to set context values "${JSON.stringify(ctx)}"`
        );

        return ctx;
    }

    getVersion(req, res) {
        return res.json({ version, enabled: this.enabled });
    }

    getPodlet(req, res) {
        let podlets = this.podlets.map(podlet => podlet.toJSON());

        if (req.params.name) {
            podlets = podlets.filter(
                podlet => podlet.name === req.params.name
            )[0];
        }

        res.send(podlets);
    }

    getContext(req, res) {
        let contexts = this.podlets.map(podlet => ({
            name: podlet.name,
            context: this.normalize(podlet.defaults()),
        }));

        if (req.params.name) {
            contexts = contexts
                .filter(context => context.name === req.params.name)
                .map(({ context }) => context)[0];
        }

        return res.json(contexts);
    }

    async postContext(req, res) {
        try {
            const response = await body(req, res);

            if (response) {
                const context = this.denormalize(JSON.parse(response));
                for (const podlet of this.podlets) {
                    if (req.params.name && req.params.name !== podlet.name)
                        continue;
                    podlet.defaults(context);
                }
            }

            return res.sendStatus(204);
        } catch (err) {
            this.log.error(err);
            return res.sendStatus(500);
        }
    }

    register(podlet) {
        this.podlets.push(podlet);
    }

    listen(port, cb) {
        this.app.listen(port, cb);
    }

    start() {
        return new Promise(resolve => {
            const start = new Date().getTime();
            this.server = this.app.listen(this.port, () => {
                const ms = new Date().getTime() - start;
                this.port = this.server.address().port;
                this.log.trace(
                    `dev tool server started on port "${
                        this.port
                    }" (in ${ms} ms)`
                );
                resolve();
            });
        });
    }

    stop() {
        return new Promise(resolve => {
            const start = new Date().getTime();
            this.server.close(() => {
                const ms = new Date().getTime() - start;
                this.log.trace(`dev tool server shutdown in ${ms} ms`);
                resolve();
            });
        });
    }
};
