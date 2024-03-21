import React, { Component } from 'react';
import Context from './context/Context';
import './Panel.css';

export default class Panel extends Component {
    render() {
        const { selected = '', data = {}, onChange, onSave } = this.props;

        let context = {};
        if (data[selected]) {
            context = data[selected];
        }

        return (
            <section>
                <Context
                    name={selected}
                    data={context}
                    onChange={onChange}
                    onSave={onSave}
                />
            </section>
        );
    }
}
