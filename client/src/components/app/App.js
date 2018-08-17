import React, { Component } from 'react';
import './App.css';
import Status from './status/Status';
import Container from './container/Container';
import { version } from '../../../package.json';
import Api from '../../services/api';
import Page from '../../services/page';

class App extends Component {
    constructor() {
        super();
        this.api = new Api();
        this.page = new Page();
        this.state = {
            apiVersion: null,
            version,
            contexts: {},
            supported: false,
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

        this.setState({
            enabled,
            apiVersion: version,
            supported: Boolean(version),
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
                                apiVersion={this.state.apiVersion}
                                version={this.state.version}
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
