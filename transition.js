// 화면 전환: fromEl을 숨기고 toEl을 보여주되, 그 사이에 CRT 재출력 효과 (transition.css)
const CRT_WIPE_TIME = 220; // transition.css의 animation 길이와 같게
const CRT_SWAP_AT = 55;    // 화면이 가장 어두워진 순간(25%)에 교체

// 누르는 순간 잠깐 눌린 색을 보여줌 (로그인 버튼의 :active와 같은 원리)
// 터치는 브라우저마다 :active가 안 보이거나 너무 짧아서 .is-pressed 클래스로 잠깐 유지
const PRESS_HOLD_TIME = 120; // 손을 뗀 뒤 눌림색 유지 시간 — 화면 교체(CRT_SWAP_AT)보다 길게

function addPressFeedback(el) {
  let timer;
  const release = () => el.classList.remove('is-pressed');
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    clearTimeout(timer);
    el.classList.add('is-pressed');
  });
  el.addEventListener('pointerup', () => {
    clearTimeout(timer);
    timer = setTimeout(release, PRESS_HOLD_TIME);
  });
  el.addEventListener('pointercancel', release);
}

// 브라우저 history에 기록하는 앱 화면 (id)
const APP_SCREEN_IDS = ['login', 'home', 'list', 'read'];
let currentScreenId = 'login';

// record: false면 history에 기록하지 않음 (뒤로가기로 되돌아갈 때)
function crtSwitch(fromEl, toEl, record = true) {
  if (record && APP_SCREEN_IDS.includes(toEl.id)) history.pushState({ screen: toEl.id }, '');
  if (APP_SCREEN_IDS.includes(toEl.id)) currentScreenId = toEl.id;

  const swap = () => {
    fromEl.hidden = true;
    toEl.hidden = false;
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    swap();
    return;
  }

  const wipe = document.createElement('div');
  wipe.className = 'crt-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  document.body.append(wipe);

  setTimeout(swap, CRT_SWAP_AT);
  setTimeout(() => wipe.remove(), CRT_WIPE_TIME + 30);
}

// 브라우저 뒤로가기(←)·Backspace로 직전 앱 화면으로
// 화면을 바꿀 때마다 crtSwitch가 history에 기록(pushState)하고, popstate에서는 기록 없이 되돌림 (새로고침 없음)
history.replaceState({ screen: currentScreenId }, '');

window.addEventListener('popstate', (e) => {
  const targetId = e.state && e.state.screen;
  if (!APP_SCREEN_IDS.includes(targetId) || targetId === currentScreenId) return;
  if (document.activeElement) document.activeElement.blur(); // 숨겨질 입력칸에 커서가 남지 않도록
  crtSwitch(document.getElementById(currentScreenId), document.getElementById(targetId), false);
});

// PC Backspace: 입력칸에서는 기존처럼 글자 삭제만, 편지읽기는 타이핑이 다 끝난 뒤에만
const isTextInput = (el) => el && (el.matches('input, textarea') || el.isContentEditable);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Backspace' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (isTextInput(document.activeElement)) return;
  if (currentScreenId === 'login') return; // 첫 화면: 더 돌아갈 앱 화면 없음
  if (currentScreenId === 'read' && document.getElementById('read').dataset.typingDone !== 'true') return;
  e.preventDefault();
  history.back();
});
