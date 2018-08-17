import React, { Component } from 'react';
import './Status.css';

class Status extends Component {
    render() {
        let message =
            'Unable to establish a connection to Podium developer tools';
        let version = '';
        let apiVersion = '';

        if (this.props.supported) message = 'Podium developer tools';

        if (this.props.version) version = ' Extension: v' + this.props.version;
        if (this.props.apiVersion)
            apiVersion = ' API: v' + this.props.apiVersion;

        return (
            <div className="status">
                <div>{message}</div>
                <div className="meta">
                    {version} {apiVersion}
                </div>
            </div>
        );
    }
}

export default Status;
