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
	if (e.key === 'h') {
		const inputElement = e.target;
		const cursorPosition = inputElement.selectionStart;
		const currentValue = inputElement.value;
		const beforeCursor = currentValue.substring(0, cursorPosition);
		const afterCursor = currentValue.substring(cursorPosition);
		inputElement.value = beforeCursor + 'h' + afterCursor;
		inputElement.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
	}
}

class HeaderInputGroup extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		const style = document.createElement("style");
		style.textContent = `
            .container {
                display: flex;
                align-items: center;
                gap: var(--gap-small);
                padding:10px;
            }

            .container-even {
            		background-color: var(--color-cream);
						}
						.container-odd {
								background-color: white;
						}

            .input-group {
                width: 100%;
                display: flex;
                flex-direction: column;
            }

            .input-label {
                font-weight: 500;
                margin-bottom: var(--padding-small);
                color: var(--form-label-color);
            }

            .input {
                border-radius: var(--radius-small);
                border: var(--input-border);
                width:180px;
                padding: var(--padding-medium);
            }

            .input-checkbox {
                margin: 0 18px 0 10px;
                cursor: pointer;
                height: 16px;
                width: 16px;
                accent-color: var(--button-primary-bg-color);
            }

            .button-secondary {
                background-color: white;
                color: var(--text-color);
                align-self: end;
                padding: var(--padding-medium) var(--padding-large);
                font-size: 16px;
                border: 2px solid var(--button-primary-bg-color);
                font-weight: bold;
                border-radius: var(--radius-small);
                cursor: pointer;

                &:hover {
                    border-color: var(--button-primary-bg-color-hover);
                }
            }
        `;

		const container = document.createElement("div");
		container.classList.add("container");

		const enableCheckbox = document.createElement("input");
		enableCheckbox.type = "checkbox";
		enableCheckbox.checked = true;
		enableCheckbox.classList.add("input-checkbox");
		enableCheckbox.addEventListener("change", (e) => {
			this.dispatchEvent(new CustomEvent(eventNames.toggleHeader, { detail: { enabled: enableCheckbox.checked } }));
		});

		const headerNameInput = document.createElement("input");
		headerNameInput.type = "text";
		headerNameInput.placeholder = "Header Name";
		headerNameInput.value = "";
		headerNameInput.classList.add("input");
		headerNameInput.addEventListener("keydown", insertHAtCursor, true);

		const headerValueInput = document.createElement("input");
		headerValueInput.type = "text";
		headerValueInput.placeholder = "Header Value";
		headerValueInput.value = "";
		headerValueInput.classList.add("input");
		headerValueInput.addEventListener("keydown", insertHAtCursor, true);


		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.classList.add("button-secondary");
		deleteButton.addEventListener("click", () => {
			this.dispatchEvent(
				new CustomEvent(eventNames.deleteHeader, {
					bubbles: true,
					composed: true,
				}),
			);
			this.remove();
		});

		container.appendChild(enableCheckbox);
		container.appendChild(headerNameInput);
		container.appendChild(headerValueInput);
		container.appendChild(deleteButton);

		this.shadowRoot.append(style, container);

		this.headerNameInput = headerNameInput;
		this.headerValueInput = headerValueInput;
		this.enableCheckbox = enableCheckbox;
		this.container = container;
	}
}

customElements.define("header-input-group", HeaderInputGroup);
