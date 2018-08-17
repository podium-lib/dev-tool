import React, { Component } from 'react';
import './Status.css';

class Status extends Component {
    render() {
        let message =
            'Unable to establish a connection to Podium developer tools';
        let clientVersion = '';
        let apiVersion = '';

        if (!this.props.notFound && !this.props.supported) {
            message = `API and extension version mismatch detected. This version of the extension supports API versions between ${
                this.props.apiMinVersion
            } and ${this.props.apiMaxVersion} but the current API version is ${
                this.props.apiVersion
            }`;
        }

        if (!this.props.notFound && this.props.supported)
            message = 'Podium developer tools';
        if (this.props.clientVersion)
            clientVersion = ' Extension: v' + this.props.clientVersion;
        if (this.props.apiVersion)
            apiVersion = ' API: v' + this.props.apiVersion;

        return (
            <div className="status">
                <div>{message}</div>
                <div className="meta">
                    {clientVersion} {apiVersion}
                </div>
            </div>
        );
    }
}

export default Status;
