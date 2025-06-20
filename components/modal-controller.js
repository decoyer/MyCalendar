export class ModalController {
  constructor(component) {
    this.component = component;
    this.activeModals = []; // 현재 열려있는 모달 목록
  }

  // 모달 열기
  openComponentModal = ({
    name, // 모달 엘리먼트 이름
    props = {}, // 속성 객체
    events = {}, // 이벤트 핸들러 객체
  }) => {
    return new Promise((resolve) => {
      // 모달 엘리먼트 생성
      const modalEl = document.createElement(name);

      // 속성 설정
      Object.entries(props).forEach(([key, value]) => {
        modalEl[key] = value;
      });

      // 이벤트 리스너 바인딩
      Object.entries(events).forEach(([eventName, handler]) => {
        if (typeof handler === "function") {
          modalEl.addEventListener(eventName, (e) => {
            const result = handler(e);

            // true/false 반환 시 resolve
            if (result === true || result === false) {
              resolve(result);
            }

            // 모달 닫기
            if (["close", "cancel", "confirm"].includes(eventName)) {
              this.closeModal();
            }
          });
        }
      });

      // 모달 목록에 추가
      this.activeModals.push(modalEl);
      // DOM에 추가
      document.body.appendChild(modalEl);
    });
  };

  // 모달 닫기
  closeModal() {
    const modalEl = this.activeModals.pop();
    if (modalEl && document.body.contains(modalEl)) {
      // DOM에서 제거
      document.body.removeChild(modalEl);
    }
  }
}
