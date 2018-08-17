import React, { Component } from 'react';
import './Container.css';
import Tabs from './tabs/Tabs';
import Panel from './panel/Panel';

export default class Container extends Component {
    state = {
        name: null,
    };

    onClick(name) {
        this.setState({ name });
    }

    render() {
        const { data, onChange, onSave } = this.props;
        const names = Object.keys(data);
        const name = this.state.name || names[0];

        return (
            <div className="">
                <Tabs
                    selected={name}
                    names={names}
                    onClick={this.onClick.bind(this)}
                />
                <Panel
                    selected={name}
                    data={data}
                    onChange={onChange}
                    onSave={onSave}
                />
            </div>
        );
    }
}
