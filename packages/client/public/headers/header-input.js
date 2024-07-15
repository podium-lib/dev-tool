/**
 * @typedef {object} HeaderInputGroupProps
 * @prop {string} header
 * @prop {string} value
 * @prop {boolean} enabled
 */

/**
 * @param {HeaderInputGroupProps} props
 * @returns {HTMLDivElement}
 */
export function createInputGroup(props) {
	const container = document.createElement("div");
	container.classList.add("container");

	const headerNameLabel = document.createElement("label");
	headerNameLabel.textContent = "Header";
	const headerNameInput = document.createElement("input");
	headerNameInput.type = "text";
	headerNameInput.value = props.header;
	headerNameInput.classList.add("input");
	headerNameLabel.appendChild(headerNameInput);
	container.appendChild(headerNameLabel);

	const headerValueLabel = document.createElement("label");
	headerValueLabel.textContent = "Header value";
	const headerValueInput = document.createElement("input");
	headerValueInput.type = "text";
	headerValueInput.value = props.value;
	headerValueInput.classList.add("input");
	headerValueLabel.appendChild(headerValueInput);
	container.appendChild(headerValueLabel);

	const actions = document.createElement("div");
	actions.className = "actions";

	const enableLabel = document.createElement("label");
	enableLabel.textContent = "Enabled";
	enableLabel.classList.add("input-checkbox");
	const enableCheckbox = document.createElement("input");
	enableCheckbox.type = "checkbox";
	enableCheckbox.checked = props.enabled;
	enableLabel.appendChild(enableCheckbox);

	const deleteButton = document.createElement("button");
	deleteButton.textContent = "Delete";
	deleteButton.type = "button";
	deleteButton.classList.add("button-tertiary");
	deleteButton.addEventListener("click", () => {
		container.remove();
	});

	actions.appendChild(enableLabel);
	actions.appendChild(deleteButton);
	container.appendChild(actions);
	return container;
}
