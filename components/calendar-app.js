import { LitElement, css, html } from "../assets/lit-core.min.js";
import "./memo-modal.js";
import { ModalController } from "./modal-controller.js";

export class CalendarApp extends LitElement {
  // 생성자 정의
  constructor() {
    super();
    this.today = new Date();
    this.yearLimit = 5; // 연도 제한
    this.modalController = new ModalController(this); // 컨트롤러 초기화
  }

  // 속성 정의
  static properties = {
    currentYear: { type: Number },
    currentMonth: { type: Number },
  };

  // 초기화 함수
  firstUpdated() {
    this.currentYear = this.today.getFullYear();
    this.currentMonth = this.today.getMonth();
  }

  // 연도 선택 옵션 추가
  getYears() {
    return Array.from(
      { length: 11 },
      (_, i) => this.today.getFullYear() - this.yearLimit + i
    );
  }

  // 월 선택 옵션 추가
  getMonths() {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  // 연도 선택 시 동작
  updateYear(e) {
    this.currentYear = parseInt(e.target.value);
  }

  // 월 선택 시 동작
  updateMonth(e) {
    this.currentMonth = parseInt(e.target.value);
  }

  // 월별 이동
  move = (n) => {
    let month = this.currentMonth + n;
    let year = this.currentYear;

    // 날짜 계산
    year += Math.floor(month / 12);
    month = (month + 12) % 12;

    // 연도 제한
    if (
      year < this.today.getFullYear() - this.yearLimit ||
      year > this.today.getFullYear() + this.yearLimit
    ) {
      return;
    }

    this.currentMonth = month;
    this.currentYear = year;
  };

  // 달력 그리기 함수
  getCalendar() {
    let month = this.currentMonth;
    let year = this.currentYear;

    const firstDay = new Date(year, month, 1).getDay(); // 첫째 날 요일
    const lastDate = new Date(year, month + 1, 0).getDate(); // 이번 달 마지막 날짜
    const prevLastDate = new Date(year, month, 0).getDate(); // 이전 달 마지막 날짜

    const calendar = [];
    let row = [];

    // 이전 달 날짜 출력
    for (let i = firstDay - 1; i >= 0; i--) {
      row.push(html`
        <td class="empty" @click=${() => this.move(-1)}>${prevLastDate - i}</td>
      `);
    }

    // 이번 달 날짜 출력
    for (let date = 1; date <= lastDate; date++) {
      if (row.length === 7) {
        calendar.push(html`<tr>
          ${row}
        </tr>`);
        row = [];
      }

      const dayOfWeek = (firstDay + date - 1) % 7;
      const key = `${year}-${month + 1}-${date}`;
      const memos = JSON.parse(localStorage.getItem(key) || "[]");

      // 요일 구별 처리
      const isToday =
        year === this.today.getFullYear() &&
        month === this.today.getMonth() &&
        date === this.today.getDate();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;

      // 요일 클래스 추가
      const classes = [
        isToday ? "today" : "",
        isSunday ? "sunday" : "",
        isSaturday ? "saturday" : "",
      ]
        .filter(Boolean)
        .join(" ");

      // 메모 키워드 추가
      const keywords = {
        월급: "💸",
        휴가: "✈️",
        병원: "💊",
        생일: "🎂",
        회식: "🍽️",
        마감: "⏰",
        // 필요 시 추가
      };

      // 날짜 클릭 시 모달 표시
      row.push(html`<td
        class="${classes}"
        @click="${() => this.openModal(key)}"
      >
        ${date}
        <div class="memo-view">
          ${memos.map((m) => {
            // 메모 키워드 찾기
            const emoji =
              Object.entries(keywords).find(([keyword]) =>
                m.includes(keyword)
              )?.[1] || "📝";

            return html`<span class="memo">${emoji} ${m}</span>`;
          })}
        </div>
      </td>`);
    }

    let nextDate = 1;

    // 다음 달 날짜 출력
    while (row.length < 7) {
      row.push(html`<td class="empty" @click=${() => this.move(1)}>
        ${nextDate++}
      </td>`);
    }

    if (row.length > 0) {
      calendar.push(html`<tr>
        ${row}
      </tr>`);
    }

    return calendar;
  }

  // 모달 열기 함수
  openModal(key) {
    this.modalController.openComponentModal({
      name: "memo-modal",
      props: {
        memos: JSON.parse(localStorage.getItem(key) || "[]"),
        selectedDateKey: key,
        btn1: "수정",
        btn2: "삭제",
        btn3: "추가",
        btn4: "닫기",
      },
      events: {
        close: () => this.modalController.closeModal(),
        update: () => this.requestUpdate(),
      },
    });
  }

  // 렌더링 함수
  render() {
    return html`<div class="header">
        <button @click=${() => this.move(-1)}>◀ 이전 달</button>
        <div class="selector">
          <select @change=${this.updateYear} .value=${this.currentYear}>
            ${this.getYears().map(
              (year) => html`<option value=${year}>${year}년</option>`
            )}
          </select>
          <select @change=${this.updateMonth} .value=${this.currentMonth}>
            ${this.getMonths().map(
              (month, idx) => html`<option value=${idx}>${month}월</option>`
            )}
          </select>
        </div>
        <button @click=${() => this.move(1)}>다음 달 ▶</button>
      </div>

      <div class="calendar">
        <table>
          <thead>
            <tr>
              <th>일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>
            ${this.getCalendar()}
          </tbody>
        </table>
      </div>`;
  }

  // 전체 레이아웃 및 스타일 정의
  static styles = css`
    .calendar {
      display: inline-block;
      border: 1px solid #ccc;
      border-radius: 10px;
      overflow: hidden;
    }

    table {
      border-collapse: separate;
      border-spacing: 0;
      min-width: 75rem;
    }

    th {
      background-color: #8c8f97;
      border: 1px solid #ccc;
      font-size: 20px;
      width: 1rem;
      overflow: hidden;
      padding: 10px;
    }

    thead th:first-child {
      border-top-left-radius: 10px;
    }

    thead th:last-child {
      border-top-right-radius: 10px;
    }

    tbody tr:last-child td:first-child {
      border-bottom-left-radius: 10px;
    }

    tbody tr:last-child td:last-child {
      border-bottom-right-radius: 10px;
    }

    td {
      background-color: #fff;
      font-size: 20px;
      border: 1px solid #ccc;
      height: 5rem;
      padding: 10px 5px;
      cursor: pointer;
      text-align: left;
      vertical-align: top;
      transition: 0.5s ease;
    }

    td.today {
      background-color: #ffee8c;
      font-weight: bold;
    }

    td.sunday {
      color: #dc143c;
      background-color: #ffeceb;
    }

    td.saturday {
      color: #305cde;
      background-color: #dcfff1;
    }

    td.empty {
      color: #666;
      background-color: #f0f1f2;
    }

    td:hover {
      background-color: #ffc067;
      opacity: 0.8;
    }

    .memo {
      color: #4caf50;
      font-size: 0.75em;
      font-weight: bold;
      display: block;
    }

    .header {
      font-size: 36px;
      margin: 20px;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
    }

    .header button {
      font-size: 24px;
      border: none;
      background-color: transparent;
      cursor: pointer;
      transition: 0.5s ease;
    }

    .header button:hover {
      color: #6305dc;
      opacity: 0.8;
    }

    .selector select {
      padding: 5px;
      font-size: 24px;
      border: none;
      border-radius: 10px;
      background-color: transparent;
      cursor: pointer;
    }

    .memo-view {
      height: 80%;
      overflow: auto;
    }

    .memo-view::-webkit-scrollbar {
      display: none;
    }
  `;
}
customElements.define("calendar-app", CalendarApp);
