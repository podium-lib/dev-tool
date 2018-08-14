'use strict';

const { promisify } = require('util');
const body = promisify(require('body'));
const URL = require('url').URL;
const Context = require('@podium/context');
const { version } = require('../package.json');
const cors = require('cors');
const corsMiddleware = promisify(cors());

module.exports = class DevToolApi {
    constructor({ pathname = '/podium/api', enabled = true } = {}) {
        this.pathname = pathname;
        this.enabled = enabled;

        const context = new Context({ name: 'devTools' });
        this.contextParsers = Array.from(context.parsers.keys());
    }

    middleware() {
        return async (req, res, next) => {
            if (!this.enabled) next();

            await corsMiddleware(req, res);

            const url = new URL(req.originalUrl, 'http://localhost');

            const contextRegex = new RegExp(this.pathname + '/context');
            if (contextRegex.test(url.pathname)) {
                if (req.method === 'POST') {
                    try {
                        const response = await body(req, res);

                        if (response) {
                            const context = JSON.parse(response);

                            let ctx = {};
                            for (const key of Object.keys(context)) {
                                if (context[key]) ctx[key] = context[key];
                            }

                            this.context = ctx;
                        }

                        res.sendStatus(200);
                    } catch (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                }
                if (req.method === 'GET') {
                    const context = this.context || {};
                    let ctx = {};
                    for (const key of this.contextParsers) {
                        ctx[key] = context[key] || '';
                    }

                    res.json(ctx);
                }
                return;
            }

            const versionRegex = new RegExp(this.pathname + '/version');
            if (versionRegex.test(url.pathname)) {
                if (req.method === 'GET') {
                    res.set('Access-Control-Allow-Origin', '*');
                    res.json({ version });
                }
                return;
            }

            res.locals = res.locals || {};
            res.locals.podium = res.locals.podium || {};

            if (this.context) {
                res.locals.podium.context = {
                    ...res.locals.podium.context,
                    ...this.context,
                };
            }

            next();
        };
    }
};
