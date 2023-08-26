import * as Lit from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { button } from "./button.js";
const { html, LitElement, css } = Lit;

class TypoModal extends LitElement {
  static styles = [
    button,
    css`
      #dialog {
        border-radius: 4px;
        position: fixed;
        box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.4);
        background-color: white;
        gap: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        margin: 0px;
      }

      #dialog p {
        margin: 0px;
        max-width: 160px;
        word-break: keep-all;
        font-size: 14px;
      }

      .dialog_control {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      #candidates {
        display: flex;
        gap: 8px;
      }
    `,
  ];

  static properties = {
    typo: { type: Object },
    currentIndex: { type: Number },
    wholeLength: { type: Number },
    positionX: { type: Number },
    positionY: { type: Number },
  };

  keyboardShortcut = (e)=>{
    
    e.preventDefault();
    e.stopPropagation();
    const selected = isNaN(+e.key) ? e.key : +e.key;

    if (this.typo.suggestions[selected - 1]) {
      this.dispatchEvent(
        new CustomEvent("replace", {
          detail: {
            suggestion: this.typo.suggestions[selected - 1],
          },
        })
      );
    } else if (selected === "Enter") {
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: {
            delta: e.shiftKey ? -1 : 1,
          },
        })
      );
    }
  }
  
  onClickDocument = (e) => {
    this.dispatchEvent(new CustomEvent("close"));
  }


  firstUpdated() {
    super.firstUpdated();

    document.addEventListener("click", this.onClickDocument);

    document.body.addEventListener("keypress", this.keyboardShortcut);
  }

  render() {
    return html`
      <div
        id="dialog"
        style=${`left: ${this.positionX}px; top: ${this.positionY + 30}px`}
        @click=${(e) => e.stopPropagation()}
      >
        <div class="dialog_control">
          <p>${this.currentIndex + 1} / ${this.wholeLength}</p>
          <p>
            <span
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("move", {
                    detail: {
                      delta: -1,
                    },
                  })
                )}
            >
              &lt;
            </span>
            &nbsp;
            <span
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("move", {
                    detail: {
                      delta: 1,
                    },
                  })
                )}
            >
              &gt;
            </span>
          </p>
        </div>
        <div id="candidates">
          ${this.typo.suggestions.map(
            (suggestion) =>
              html`
                <button
                  @click=${() => {
                    this.dispatchEvent(
                      new CustomEvent("replace", {
                        detail: {
                          suggestion,
                        },
                      })
                    );
                  }}
                >
                  ${suggestion}
                </button>
              `
          )}
        </div>
      </div>
    `;
  }

  close(){
    document.body.removeEventListener("keypress", this.keyboardShortcut);
    document.removeEventListener("click", this.onClickDocument);
  }
}

customElements.define("typo-modal", TypoModal);
