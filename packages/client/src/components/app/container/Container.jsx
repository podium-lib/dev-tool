import React from "react";
import Tabs from "./tabs/Tabs.jsx";
import Panel from "./panel/Panel.jsx";

export default class Container extends React.Component {
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
				<Tabs selected={name} names={names} onClick={this.onClick.bind(this)} />
				<Panel selected={name} data={data} onChange={onChange} onSave={onSave} />
			</div>
		);
	}
}
