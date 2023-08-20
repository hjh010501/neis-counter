import * as Lit from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { button } from "./button.js";

const { html, LitElement, css } = Lit;

class Agreement extends LitElement {
  static styles = [
    button,
    css`
      dialog {
        margin: 24px;
        border-radius: 4px;
        width: 480px;
        margin-left: auto;
        margin-top: 60px;
        border-width: 2px;
      }
      h1 {
        font-size: 16px;
      }
      @media (max-width:768px) {
        dialog{
          width: 400px;
        }
      }
      @media (max-width:480px) {
        dialog{
          width: 90vw;
          margin: auto;
        }
      }
    `,
  ];

  open() {
    this.shadowRoot.querySelector("dialog").showModal();
  }

  render() {
    return html`
      <dialog>
        <h1>맞춤법 검사기 사용에 대한 안내</h1>
        <p>
          글을 더 편하게 작성할 수 있도록 맞춤법 검사 기능을 제공하고 있습니다.
        </p>
        <p>
          맞춤법 검사를 수행하기 위해서는 입력한 글을 맞춤법 검사를 중계하는
          서버로 전송해야 합니다. 서버에서는 글의 내용을 포함하여 그 어떤 정보도
          저장하거나 수집하지 않습니다.
        </p>

        <button
          @click=${() => {
            this.dispatchEvent(new CustomEvent("canceled"));
            this.shadowRoot.querySelector("dialog").close();
          }}
        >
          사용하지 않기
        </button>
        <button
          class="primary"
          @click=${() => {
            this.dispatchEvent(new CustomEvent("agree"));
            this.shadowRoot.querySelector("dialog").close();
          }}
        >
          맞춤법 검사 기능을 사용하겠습니다.
        </button>
      </dialog>
    `;
  }
}

customElements.define("agreement-modal", Agreement);
