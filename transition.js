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

function crtSwitch(fromEl, toEl) {
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
