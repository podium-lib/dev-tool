'use strict';

const { promisify } = require('util');
const body = promisify(require('body'));
const URL = require('url').URL;
const Context = require('@podium/context');
const { version } = require('../package.json');
const cors = require('cors');
const corsMiddleware = promisify(cors());
const { getFromLocalsPodium, setAtLocalsPodium } = require('@podium/utils');
const abslog = require('abslog');

module.exports = class DevToolApi {
    constructor({ enabled = true, logger } = {}) {
        this.apiPath = '/podium/api';
        this.enabled = enabled;
        this.log = abslog(logger);

        if (enabled) {
            this.log.debug('Podium developer tools middleware enabled');
        }

        const context = new Context({ name: 'devTools' });
        this.contextParserNames = Array.from(context.parsers.keys());
    }

    normalize(context = {}) {
        context = context || {};
        let ctx = {};
        for (const key of this.contextParserNames) {
            ctx[key] = context[key] || '';
        }

        this.log.trace(
            `Normalized set context values "${JSON.stringify(
                context
            )}" to context object "${JSON.stringify(ctx)}"`
        );

        return ctx;
    }

    denormalize(context) {
        let ctx = {};
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

    pathname(request) {
        const url = new URL(request.originalUrl, 'http://localhost');
        return url.pathname;
    }

    match(path, method, request) {
        const regex = new RegExp(this.apiPath + path);
        return regex.test(this.pathname(request)) && request.method === method;
    }

    mergeContext(res) {
        if (this.context) {
            const existingContext = getFromLocalsPodium(res, 'context');

            this.log.trace(
                `Merging context values "${JSON.stringify(
                    existingContext
                )}" and "${JSON.stringify(
                    this.context
                )}" to produce new Podium context`
            );

            const context = Object.assign(existingContext, this.context);

            setAtLocalsPodium(res, 'context', context);

            this.log.debug(
                `Merged development context with context on inbound request "${JSON.stringify(
                    context
                )}"`
            );
        }
    }

    middleware() {
        return async (req, res, next) => {
            if (!this.enabled) next();

            await corsMiddleware(req, res);

            // GET /podium/api/version
            if (this.match('/version', 'GET', req)) {
                this.log.trace(`GET /podium/api/version`);
                return res.json({ version });
            }

            // GET /podium/api/context
            if (this.match('/context', 'GET', req)) {
                this.log.trace(`GET /podium/api/context`);
                return res.json(this.normalize(this.context));
            }

            // POST /podium/api/context
            if (this.match('/context', 'POST', req)) {
                this.log.trace(`POST /podium/api/context`);
                try {
                    const response = await body(req, res);

                    if (response) {
                        const context = JSON.parse(response);
                        this.context = this.denormalize(context);
                    }

                    return res.sendStatus(200);
                } catch (err) {
                    this.log.error(err);
                    return res.sendStatus(500);
                }
            }

            // middleware merges with any existing Podium context defaults
            this.mergeContext(res);

            next();
        };
    }
};
