import React, { Component } from "react";
import "./Context.css";

export default class Context extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.props.onChange("context", this.props.name, name, value);
  }

  submit(event) {
    event.preventDefault();
    this.props.onSave("context", this.props.name);
  }

  render() {
    const { data } = this.props;

    return (
      <form className="context-form" onSubmit={this.submit}>
        {Object.keys(data).map((field, i) => {
          return (
            <div key={i}>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text">{field}</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  name={field}
                  value={data[field]}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          );
        })}
        <button className="btn btn-primary form-submit" type="submit">
          save
        </button>
      </form>
    );
  }
}
