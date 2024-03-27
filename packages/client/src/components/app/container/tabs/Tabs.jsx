import React from "react";
import Tab from "./tab/Tab.jsx";

export default class Tabs extends React.Component {
	state = { selected: "" };

	onClick(name) {
		this.setState({ selected: name });
		this.props.onClick(name);
	}

	render() {
		const { names } = this.props;
		const selected = this.state.selected || names[0];
		if (names.length > 1) {
			return (
				<ul className="podlet-name-tabs nav nav-pills">
					{names.map((name, i) => {
						return <Tab key={i} name={name} selected={selected === name} onClick={this.onClick.bind(this)} />;
					})}
				</ul>
			);
		} else {
			return <div />;
		}
	}
}
