// 화면 전환: fromEl을 숨기고 toEl을 보여주되, 그 사이에 CRT 재출력 효과 (transition.css)
const CRT_WIPE_TIME = 220; // transition.css의 animation 길이와 같게
const CRT_SWAP_AT = 55;    // 화면이 가장 어두워진 순간(25%)에 교체

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
