import React, { Component } from 'react';
import './App.css';
import Status from './status/Status';
import Container from './container/Container';
import Connection from './connection/Connection';
import { version } from '../../../package.json';
import Api from '../../services/api';
import Page from '../../services/page';
import compareVersions from 'compare-versions';

class App extends Component {
    constructor() {
        super();
        this.api = new Api();
        this.page = new Page();
        this.state = {
            apiVersion: null,
            version,
            minApiVersion: '3.0.0',
            contexts: {},
            supported: false,
            notFound: true,
        };
        this.onSave = this.onSave.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onConnectionChange = this.onConnectionChange.bind(this);
    }

    onChange(type, name, key, value) {
        if (type === 'context') {
            this.setState({
                contexts: {
                    ...this.state.contexts,
                    [name]: { ...this.state.contexts[name], [key]: value },
                },
            });
        }
    }

    async onConnectionChange(host, port) {
        this.api.host = host;
        this.api.port = port;

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('host', host);
        currentUrl.searchParams.set('port', port);
        window.history.pushState({}, '', currentUrl.href);

        try {
            await this.getMeta();
            await this.getContexts();
        } catch (err) {
            console.log(err);
            this.setState({
                apiVersion: null,
                contexts: {},
                supported: false,
            });
        }
    }

    async onSave(type, name) {
        if (type === 'context') {
            await this.api.setContext(name, this.state.contexts[name]);
        }
        this.page.reload();
    }

    async componentDidMount() {
        try {
            await this.getMeta();
            await this.getContexts();
        } catch (err) {
            console.log(err);
        }

        this.page.onChange(async () => {
            try {
                await this.getMeta();
                await this.getContexts();
            } catch (err) {
                console.log(err);
                this.setState({
                    apiVersion: null,
                    contexts: {},
                    supported: false,
                });
            }
        });
    }

    async getMeta() {
        const { version, enabled } = await this.api.getMeta();

        const min = this.state.minApiVersion.replace(/-[(beta)(alpha)].*/, '');
        let curr = version;

        if (version) {
            curr = version.replace(/-[(beta)(alpha)].*/, '');
        }

        const supported = compareVersions(curr, min) > -1;

        this.setState({
            enabled,
            apiVersion: curr,
            supported,
            notFound: !Boolean(version),
        });
    }

    async getContexts() {
        if (this.state.apiVersion) {
            let contexts = {};
            for (const context of await this.api.getContexts()) {
                contexts[context.name] = context.context;
            }

            this.setState({
                contexts,
            });
        }
    }

    render() {
        let container = '';
        if (this.state.supported) {
            container = (
                <Container
                    data={this.state.contexts}
                    onChange={this.onChange}
                    onSave={this.onSave}
                />
            );
        }

        return (
            <div className="App">
                <div className="card">
                    <div className="card-header row">
                        <div className="col-sm-auto">
                            <Status
                                supported={this.state.supported}
                                notFound={this.state.notFound}
                                clientVersion={this.state.version}
                                apiVersion={this.state.apiVersion}
                                apiMinVersion={this.state.minApiVersion}
                                apiMaxVersion={this.state.maxApiVersion}
                            />
                            <Connection
                                host={this.api.host}
                                port={this.api.port}
                                onChange={this.onConnectionChange}
                            />
                        </div>
                    </div>
                </div>
                {container}
            </div>
        );
    }
}

export default App;
