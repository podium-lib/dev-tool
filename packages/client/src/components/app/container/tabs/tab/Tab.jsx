import React from "react";
import classNames from "classnames";

export default class Tab extends React.Component {
	render() {
		const { name, selected, onClick } = this.props;
		const classes = classNames("nav-link", { active: selected });
		return (
			<li className="nav-item">
				<button className={classes} onClick={() => onClick(name)}>
					{name}
				</button>
			</li>
		);
	}
}
