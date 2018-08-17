/**
 * @jest-environment node
 */
'use strict';

const express = require('express');
const Podlet = require('@podium/podlet');
const DevTool = require('../lib/index');
const request = require('supertest');

let app;
let podlet;
let devTool;

beforeEach(() => {
    podlet = new Podlet({
        name: 'myPodlet',
        version: '1.0.0',
        defaults: true,
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
        version: '0.1.0',
    });
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
                debug: '',
                deviceType: '',
                locale: '',
                mountOrigin: '',
                mountPathname: '',
                publicPathname: '',
                requestedBy: '',
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
            locale: 'en-EN',
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
            locale: 'en-EN',
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
        publicPathname: '',
        mountPathname: '',
        mountOrigin: '',
        requestedBy: '',
        deviceType: '',
        locale: '',
        debug: '',
    });
});
