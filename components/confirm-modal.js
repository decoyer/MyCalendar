import { LitElement, css, html } from "../assets/lit-core.min.js";

export class ConfirmModal extends LitElement {
  // 속성 정의
  static properties = {
    modalTitle: { type: String },
    btn1: { type: String },
    btn2: { type: String },
  };

  // 삭제 이벤트 핸들러
  handleDelete() {
    this.dispatchEvent(
      new CustomEvent("confirm", { bubbles: true, composed: true })
    );
  }

  // 삭제 취소 이벤트 핸들러
  handleCancel() {
    this.dispatchEvent(
      new CustomEvent("cancel", { bubbles: true, composed: true })
    );
  }

  // 렌더링 함수
  render() {
    return html`
      <div class="modal" @click="${this.handleCancel}">
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h3>${this.modalTitle}</h3>
          <div class="modal-buttons">
            <button class="confirm-button" @click="${this.handleDelete}">
              ${this.btn1}
            </button>
            <button class="cancel-button" @click="${this.handleCancel}">
              ${this.btn2}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .modal {
      display: flex;
      align-items: center;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
    }

    .modal-content {
      background-color: #fff;
      margin: 10% auto;
      padding: 20px;
      width: 15%;
      height: 10%;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      text-align: left;
      font-size: 20px;
    }

    .modal-content h3 {
      margin-top: 0;
      font-size: 20px;
      text-align: center;
      color: #333;
    }

    .modal-content button {
      color: #fff;
      min-width: 100px;
      margin: 10px 0;
      border: none;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: 0.5s ease;
    }

    .modal-buttons {
      display: flex;
      justify-content: space-evenly;
    }

    .modal-content .confirm-button {
      background-color: #4caf50;
    }

    .modal-content .cancel-button {
      background-color: #666;
    }

    .modal-content button:hover {
      opacity: 0.8;
    }
  `;
}
customElements.define("confirm-modal", ConfirmModal);
