export const eventNames = {
	deleteHeader: "delete-header",
	toggleHeader: "toggle-header",
};

/*
	TODO:
	This addresses a strange bug/behaviour in how chrome currently loads extensions.
	The bug causes events for keydown on the letter "h", keycode 72, to not be forwarded to the input.
	In the future, to check if this bug has been fixed, simply remove this function and the event-listeners.
	If you are able to type the letter "h" in the input-fields, this can safely be removed.
 */
function insertHAtCursor(e) {
	if (e.key === "h") {
		const inputElement = e.target;
		const cursorPosition = inputElement.selectionStart;
		const currentValue = inputElement.value;
		const beforeCursor = currentValue.substring(0, cursorPosition);
		const afterCursor = currentValue.substring(cursorPosition);
		inputElement.value = beforeCursor + "h" + afterCursor;
		inputElement.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
	}
}

class HeaderInputGroup extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		const style = document.createElement("style");
		style.textContent = /* css */ `
			.container {
				display: flex;
				flex-direction: column;
				gap: var(--spacing-8);
			}

			.input {
				border-radius: var(--border-radius);
				border: var(--input-border);
				padding: var(--spacing-16);
				display: block;
				min-width: 280px;
				width: 100%;
			}

			.input-checkbox {
				display: flex;
				align-items: center;
			}

			.input-checkbox input {
				cursor: pointer;
				accent-color: var(--button-primary-bg-color);
			}

			.actions {
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				gap: var(--spacing-16);
			}`;

		const container = document.createElement("div");
		container.classList.add("container");

		const headerNameLabel = document.createElement("label");
		headerNameLabel.textContent = "Header";
		const headerNameInput = document.createElement("input");
		headerNameInput.type = "text";
		headerNameInput.value = "";
		headerNameInput.classList.add("input");
		headerNameInput.addEventListener("keydown", insertHAtCursor, true);
		headerNameLabel.appendChild(headerNameInput);
		container.appendChild(headerNameLabel);

		const headerValueLabel = document.createElement("label");
		headerValueLabel.textContent = "Header value";
		const headerValueInput = document.createElement("input");
		headerValueInput.type = "text";
		headerValueInput.value = "";
		headerValueInput.classList.add("input");
		headerValueInput.addEventListener("keydown", insertHAtCursor, true);
		headerValueLabel.appendChild(headerValueInput);
		container.appendChild(headerValueLabel);

		const actions = document.createElement("div");
		actions.className = "actions";

		const enableLabel = document.createElement("label");
		enableLabel.textContent = "Enabled";
		enableLabel.classList.add("input-checkbox");
		const enableCheckbox = document.createElement("input");
		enableCheckbox.type = "checkbox";
		enableCheckbox.checked = true;
		enableCheckbox.addEventListener("change", (e) => {
			this.dispatchEvent(new CustomEvent(eventNames.toggleHeader, { detail: { enabled: enableCheckbox.checked } }));
		});
		enableLabel.appendChild(enableCheckbox);

		const deleteButton = document.createElement("button");
		deleteButton.textContent = `Delete`;
		deleteButton.classList.add("button-tertiary");
		deleteButton.addEventListener("click", () => {
			this.dispatchEvent(
				new CustomEvent(eventNames.deleteHeader, {
					bubbles: true,
					composed: true,
				}),
			);
			this.remove();
		});

		actions.appendChild(enableLabel);
		actions.appendChild(deleteButton);
		container.appendChild(actions);

		const globalCss = document.createElement("link");
		globalCss.rel = "stylesheet";
		globalCss.href = "../devtools.css";
		this.shadowRoot.append(style, container, globalCss);

		this.headerNameInput = headerNameInput;
		this.headerValueInput = headerValueInput;
		this.enableCheckbox = enableCheckbox;
		this.container = container;
	}
}

customElements.define("header-input-group", HeaderInputGroup);
