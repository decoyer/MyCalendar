import { LitElement, css, html } from "../assets/lit-core.min.js";
import "./confirm-modal.js";
import { ModalController } from "./modal-controller.js";

export class MemoModal extends LitElement {
  // 생성자 정의
  constructor() {
    super();
    this.modalController = new ModalController(this); // 컨트롤러 초기화
  }

  // 속성 정의
  static properties = {
    memos: { type: Array },
    selectedDateKey: { type: String },
    btn1: { type: String },
    btn2: { type: String },
    btn3: { type: String },
    btn4: { type: String },
  };

  // 날짜 포맷팅
  formatDateKey(key) {
    if (!key) return "";
    const [year, month, day] = key.split("-");
    return `${year}년 ${month}월 ${day}일`;
  }

  // 이벤트 발생
  closeModal = () => {
    this.dispatchEvent(
      new CustomEvent("close", { bubbles: true, composed: true })
    );
  };

  updateMemo = () => {
    this.dispatchEvent(
      new CustomEvent("update", {
        detail: { memos: this.memos },
        bubbles: true,
        composed: true,
      })
    );
  };

  // Enter 키로 메모 추가
  handleEnter(e) {
    if (e.key === "Enter") this.addMemo();
  }

  // 메모 추가 함수
  addMemo = () => {
    const input = this.renderRoot.getElementById("newMemo");
    const newMemo = input.value.trim();
    if (!newMemo) return;

    // 메모 업데이트
    const updatedMemos = [...this.memos, newMemo];
    this.memos = updatedMemos;

    // 로컬 스토리지에 저장
    localStorage.setItem(this.selectedDateKey, JSON.stringify(updatedMemos));

    this.updateMemo();

    input.value = "";
  };

  // 삭제 모달 열기
  async deleteMemo(index) {
    this.index = index;
    let res = await this.modalController.openComponentModal({
      name: "confirm-modal",
      props: {
        modalTitle: "정말 삭제하시겠습니까?",
        btn1: "확인",
        btn2: "취소",
      },
      events: {
        confirm: () => true,
        cancel: () => false,
      },
    });

    if (res) {
      this.confirmDelete();
    }
  }

  // 메모 삭제 함수
  confirmDelete = () => {
    // 메모 업데이트
    const updatedMemos = this.memos.filter((_, i) => i !== this.index);
    this.memos = updatedMemos;

    // 로컬 스토리지에서 삭제
    updatedMemos.length === 0
      ? localStorage.removeItem(this.selectedDateKey)
      : localStorage.setItem(
          this.selectedDateKey,
          JSON.stringify(updatedMemos)
        );

    this.updateMemo();
  };

  // 메모 수정 함수
  editMemo(index) {
    const input = this.renderRoot.querySelectorAll(".memo-input")[index];
    const editBtn = this.renderRoot.querySelectorAll(".edit-button")[index];

    if (input.readOnly) {
      // 메모 수정
      input.readOnly = false;
      input.focus();
      editBtn.textContent = "저장";
      editBtn.classList.add("save-button");
    } else {
      // 메모 저장
      const text = input.value.trim();
      if (text === "") {
        // 빈 메모 삭제
        this.deleteMemo(index);
        return;
      }

      // 메모 업데이트
      const updatedMemos = this.memos.map((memo, i) =>
        i === index ? text : memo
      );
      this.memos = updatedMemos;

      // 로컬 스토리지에 저장
      localStorage.setItem(this.selectedDateKey, JSON.stringify(updatedMemos));

      this.updateMemo();

      // 메모 수정 종료
      input.readOnly = true;
      editBtn.textContent = "수정";
      editBtn.classList.remove("save-button");
    }
  }

  // 렌더링 함수
  render() {
    return html`
      <div class="modal" @click="${this.closeModal}">
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <h3>${this.formatDateKey(this.selectedDateKey)}</h3>
          <hr />
          <ul class="memo-list">
            ${this.memos.map(
              (memo, index) => html` <li>
                <input value="${memo}" class="memo-input" readonly />
                <button
                  class="edit-button"
                  @click="${() => this.editMemo(index)}"
                >
                  ${this.btn1}
                </button>
                <button
                  class="delete-button"
                  @click="${() => this.deleteMemo(index)}"
                >
                  ${this.btn2}
                </button>
              </li>`
            )}
          </ul>
          <hr />
          <input
            id="newMemo"
            placeholder="새 메모 입력"
            @keydown="${this.handleEnter}"
            autofocus
          />
          <div class="modal-buttons">
            <button class="add-button" @click="${this.addMemo}">
              ${this.btn3}
            </button>
            <button class="close-button" @click="${this.closeModal}">
              ${this.btn4}
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
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
      background-color: #fff;
      margin: 10% auto;
      padding: 20px;
      width: 20%;
      height: 40%;
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

    .modal-content input {
      width: 100%;
      margin: 10px 0;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 10px;
      font-size: 16px;
      box-sizing: border-box;
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
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }

    .modal-content .add-button {
      background-color: #4caf50;
    }

    .modal-content .close-button {
      background-color: #666;
    }

    .modal-content button:hover {
      opacity: 0.8;
    }

    .memo-list {
      list-style-type: none;
      padding: 0;
      margin: 10px 0;
      height: 50%;
      overflow-y: auto;
    }

    .memo-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .memo-list button {
      margin-left: 10px;
      font-size: 16px;
      padding: 5px 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: 0.5s ease;
    }

    .memo-list .edit-button {
      background-color: #007bff;
    }

    .memo-list .save-button {
      background-color: #0f52ba;
    }

    .memo-list .delete-button {
      background-color: #f44336;
    }

    .memo-list button:hover {
      opacity: 0.8;
    }

    .memo-list::-webkit-scrollbar {
      display: none;
    }
  `;
}
customElements.define("memo-modal", MemoModal);
