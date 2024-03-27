import React, { Component } from "react";
import classNames from "classnames";
import "./Tab.css";

export default class Tab extends Component {
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
