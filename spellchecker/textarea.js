import * as Lit from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./modal.js";
import "./agreement.js";

const { html, LitElement, css } = Lit;

class SpellCheckInput extends LitElement {
  static properties = {
    content: {
      state: true,
    },
    typos: {
      state: true,
    },
    typoIndex: {
      state: true,
    },
    modalPositionX: {
      state: true,
    },
    modalPositionY: {
      state: true,
    },
    offset: {
      state: true,
    },
  };

  constructor() {
    super();
    this.agreed = localStorage.getItem("agreed") === "true";
    this.offset = 0;
  }

  static styles = css`
    div {
      height: 100%;
      width: 100%;
      outline: none;
    }
  `;

  firstUpdated(e) {
    super.firstUpdated();

    this.shadowRoot
      .querySelector("div[contenteditable]")
      .addEventListener("paste", function (e) {
        e.preventDefault();
        var text = (e.originalEvent || e).clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
      });
  }

  render() {
    return html`
      <div
        style="overflow-y: auto; padding: 25px; width: calc(100% - 50px); height: calc(100% - 50px)"
        contenteditable
        @input=${(e) => {
          this.content = e.target.innerText;
          this.dispatchEvent(
            new CustomEvent("content-change", {
              detail: {
                content: e.target.innerText,
              },
            })
          );
        }}
      ></div>
      <agreement-modal></agreement-modal>

      ${this.typos?.length > 0
        ? html`
            <typo-modal
              .typo=${this.typos[this.typoIndex]}
              @replace=${(e) => {
                const typo = this.typos[this.typoIndex];
                const suggestion = e.detail.suggestion;
                const originLength = this.content.length;

                this.setContent(
                  this.content.substring(0, typo.from + this.offset) +
                    suggestion +
                    this.content.substring(typo.to + this.offset)
                );

                this.offset += this.content.length - originLength;
                this.goIndex();
              }}
              @close=${() => this.closeModal()}
              @move=${(e) => this.goIndex(e.detail.delta)}
              currentIndex=${this.typoIndex}
              wholeLength=${this.typos.length}
              positionX=${this.modalPositionX}
              positionY=${this.modalPositionY}
            />
          `
        : null}
    `;
  }

  closeModal() {
    this.typoIndex = undefined;
    this.typos = [];
    let typo_modal = this.shadowRoot.querySelector("typo-modal");
    typo_modal.close()
  }

  goIndex(delta = 1) {
    if (this.typoIndex === undefined) return;
    this.typoIndex += delta;

    if (!this.typos[this.typoIndex]) {
      if (this.typoIndex === this.typos.length) {
        alert("맞춤법 수정이 완료되었습니다");
      }

      this.closeModal();
    }
  }

  setContent(text) {
    this.content = text;
    this.shadowRoot.querySelector("div[contenteditable]").innerText = text;

    this.dispatchEvent(
      new CustomEvent("content-change", {
        detail: {
          content: text,
        },
      })
    );
  }

  setCarat(start, end) {
    const element = this.shadowRoot.querySelector("div[contenteditable]");
    element.normalize();
    const range = document.createRange();
    const selection = window.getSelection();

    const child = [...element.childNodes].find((e) => e instanceof Text);

    range.setStart(child, start);
    range.setEnd(child, end);
    selection.removeAllRanges();
    selection.addRange(range);

    return range;
  }

  updated(changedProperties) {
    if (
      (changedProperties.has("typoIndex") || changedProperties.has("typos")) &&
      this.typoIndex !== undefined
    ) {
      const range = this.setCarat(
        this.typos[this.typoIndex].from + this.offset,
        this.typos[this.typoIndex].to + this.offset
      );

      const rect = range.getBoundingClientRect();

      this.modalPositionX = rect.left;
      this.modalPositionY = rect.top;
    }
  }

  spellCheck() {
    return new Promise((ok, error) => {
      if (!this.agreed) {
        const modal = this.shadowRoot.querySelector("agreement-modal");
        modal.open();

        modal.addEventListener("agree", () => {
          this.agreed = true;
          localStorage.setItem("agreed", true);
          this.spellCheck().then(ok).catch(error);
        });

        modal.addEventListener("canceled", () => {
          error();
        });
      } else
        fetch(
          "https://spell.rycont.workers.dev/" + encodeURIComponent(this.content)
        )
          .then((e) => e.json())
          .then(async (spellCheckErrors) => {
            if (spellCheckErrors.length === 0) {
              alert("맞춤법 오류를 찾지 못했습니다");
            } else {
              this.typos = spellCheckErrors;
              this.typoIndex = 0;
              this.offset = 0;
            }
            ok();
          })
          .catch(error);
    });
  }
}

customElements.define("spell-check-input", SpellCheckInput);
