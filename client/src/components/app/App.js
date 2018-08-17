import React, { Component } from 'react';
import './App.css';
import Status from './status/Status';
import Container from './container/Container';
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
            minApiVersion: '0.0.0',
            maxApiVersion: '1.0.0',
            contexts: {},
            supported: false,
            notFound: true,
        };
        this.onSave = this.onSave.bind(this);
        this.onChange = this.onChange.bind(this);
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

        const supported =
            compareVersions(version, this.state.maxApiVersion) < 1 &&
            compareVersions(version, this.state.minApiVersion) > -1;

        this.setState({
            enabled,
            apiVersion: version,
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
                        </div>
                    </div>
                </div>
                {container}
            </div>
        );
    }
}

export default App;
