import * as Lit from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
const { css } = Lit;

export const button = css`
  button {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-family: "Noto Sans KR";
  }

  button.primary {
    background-color: #1d1d1d;
    color: #fff;
  }
`;
