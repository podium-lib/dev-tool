import React, { Component } from 'react';
import './Connection.css';

class Connection extends Component {
    constructor(props) {
        super();

        this.state = {
            host: props.host,
            port: props.port,
        };

        this.submit = this.submit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    submit(event) {
        event.preventDefault();
        this.props.onChange(this.state.host, this.state.port);
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    render() {
        return (
            <div className="connection">
                <form className="context-form" onSubmit={this.submit}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">host</span>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            name="host"
                            value={this.state.host}
                            onChange={this.handleInputChange}
                        />
                        <div className="input-group-prepend">
                            <span className="input-group-text">port</span>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            name="port"
                            value={this.state.port}
                            onChange={this.handleInputChange}
                        />
                        <button
                            className="btn btn-primary form-submit"
                            type="submit"
                        >
                            update
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

export default Connection;
