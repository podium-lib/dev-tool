'use strict';

const express = require('express');
const Podlet = require('@podium/podlet');
const request = require('supertest');
const DevTool = require('../lib/index');

let app;
let podlet;
let devTool;

beforeEach(() => {
    podlet = new Podlet({
        name: 'myPodlet',
        version: '1.0.0',
        pathname: '/',
        development: true,
    });

    devTool = new DevTool({});
    devTool.register(podlet);

    app = express();

    app.use(podlet.middleware());

    app.get(podlet.manifest(), (req, res) => {
        res.json(podlet);
    });

    app.get(podlet.content(), (req, res) => {
        res.json({ context: res.locals.podium.context });
    });
});

test('get dev tool information', async () => {
    const { body } = await request(devTool.app).get('/');
    expect(body).toEqual({
        enabled: true,
        version: expect.any(String),
    });
});

test('start and stop methods', async () => {
    const logger = {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };
    devTool = new DevTool({ logger });
    devTool.register(podlet);

    await devTool.start();
    await devTool.stop();

    expect(logger.trace.mock.calls[0][0]).toMatch(
        'dev tool server started on port "8172" (in',
    );
    expect(logger.trace.mock.calls[1][0]).toMatch(
        'dev tool server shutdown in',
    );
    expect(logger.trace).toHaveBeenCalledTimes(2);
});

test('starting on a random port', async () => {
    const logger = {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };
    devTool = new DevTool({ logger, port: 0 });
    devTool.register(podlet);

    await devTool.start();
    await devTool.stop();

    expect(logger.trace.mock.calls[0][0]).toMatch(
        'dev tool server started on port "',
    );
    expect(logger.trace.mock.calls[0][0]).not.toMatch('undefined');
    expect(logger.trace.mock.calls[0][0]).not.toMatch('null');
    expect(logger.trace.mock.calls[0][0]).not.toMatch('8172');
    expect(logger.trace).toHaveBeenCalledTimes(2);
});

test('get all podlet information', async () => {
    const { body } = await request(devTool.app).get('/podlet');
    expect(body).toEqual([
        {
            assets: { css: '', js: '' },
            content: '/',
            fallback: '',
            name: 'myPodlet',
            proxy: {},
            version: '1.0.0',
        },
    ]);
});

test('get single podlet information', async () => {
    const { body } = await request(devTool.app).get('/podlet/myPodlet');
    expect(body).toEqual({
        assets: { css: '', js: '' },
        content: '/',
        fallback: '',
        name: 'myPodlet',
        proxy: {},
        version: '1.0.0',
    });
});

test('get all contexts', async () => {
    const { body } = await request(devTool.app).get('/context');
    expect(body).toEqual([
        {
            name: 'myPodlet',
            context: {
                debug: 'false',
                deviceType: 'desktop',
                locale: 'en-US',
                mountOrigin: '',
                mountPathname: '/',
                publicPathname: '/',
                requestedBy: 'myPodlet',
            },
        },
    ]);
});

test('set value on all contexts', async () => {
    await request(devTool.app)
        .post('/context')
        .send({ mountOrigin: 'http://fake.com:1337' });

    const { body } = await request(app).get('/');
    expect(body).toEqual({
        context: {
            debug: 'false',
            deviceType: 'desktop',
            locale: 'en-US',
            mountOrigin: 'http://fake.com:1337',
            mountPathname: '/',
            publicPathname: '/',
            requestedBy: 'myPodlet',
        },
    });
});

test('set value on all contexts', async () => {
    await request(devTool.app)
        .post('/context/myPodlet')
        .send({ mountOrigin: 'http://superfake.com:1337' });

    const { body } = await request(app).get('/');
    expect(body).toEqual({
        context: {
            debug: 'false',
            deviceType: 'desktop',
            locale: 'en-US',
            mountOrigin: 'http://superfake.com:1337',
            mountPathname: '/',
            publicPathname: '/',
            requestedBy: 'myPodlet',
        },
    });
});

test('get single context by podlet name', async () => {
    const { body } = await request(devTool.app)
        .get('/context/myPodlet')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

    expect(body).toEqual({
        publicPathname: '/',
        mountPathname: '/',
        mountOrigin: '',
        requestedBy: 'myPodlet',
        deviceType: 'desktop',
        locale: 'en-US',
        debug: 'false',
    });
});
