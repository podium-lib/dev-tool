import React from "react";
import Context from "./context/Context.jsx";

export default class Panel extends React.Component {
	render() {
		const { selected = "", data = {}, onChange, onSave } = this.props;

		let context = {};
		if (data[selected]) {
			context = data[selected];
		}

		return (
			<section>
				<Context name={selected} data={context} onChange={onChange} onSave={onSave} />
			</section>
		);
	}
}
