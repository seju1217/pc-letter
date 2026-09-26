// 로그인 화면: 로딩 화면이 끝나면 보이는 첫 화면
(() => {
  const LOGIN_ID = '서재혁';
  const LOGIN_PW = '0912';

  const form = document.getElementById('login');
  const idEl = document.getElementById('loginId');
  const pwEl = document.getElementById('loginPw');
  const errorEl = document.getElementById('loginError');

  // 버튼을 누르는 순간 마우스 클릭음 1회 (script.js의 playMouseClickSound)
  form.querySelector('.login__button').addEventListener('pointerdown', (e) => {
    if (e.button === 0) playMouseClickSound();
  });

  // 문자 키를 누를 때마다 키 소리 1회 (script.js의 playKeySound)
  // 한글은 ㅅ·ㅓ처럼 자판을 칠 때마다. 소리만 내고 입력·IME 조합에는 관여하지 않음
  // 한글 IME 중에는 key가 'Process'로 오므로 그때는 code(물리 키 위치)로 문자 키인지 판단
  const CHAR_CODE = /^(Key[A-Z]|Digit\d|Numpad(\d|Decimal|Add|Subtract|Multiply|Divide)|Space|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|Backquote|IntlBackslash|IntlRo|IntlYen)$/;
  const isCharKey = (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.key === 'Process' || e.key === 'Unidentified') return CHAR_CODE.test(e.code);
    return Array.from(e.key).length === 1; // 'a', '0', ' ', 'ㅅ' 등 (Enter·Shift·F1은 이름이 긺)
  };
  [idEl, pwEl].forEach((field) => {
    field.addEventListener('keydown', (e) => {
      if (isCharKey(e)) playKeySound(e.code === 'Space' ? ' ' : e.key); // 스페이스는 기존처럼 조금 낮은 소리
    });
  });

  // 비밀번호는 실제 값은 그대로 두고, 화면에는 자리수만큼 *로 표시
  const pwMaskEl = document.getElementById('loginPwMask');
  const syncPwMask = () => {
    pwMaskEl.textContent = '*'.repeat(Array.from(pwEl.value).length);
    pwMaskEl.scrollLeft = pwEl.scrollLeft; // 칸을 넘칠 만큼 길어졌을 때 스크롤도 맞춤
  };
  pwEl.addEventListener('input', syncPwMask);
  pwEl.addEventListener('scroll', syncPwMask);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = idEl.value.normalize('NFC').trim();
    const pw = pwEl.value;

    if (id === LOGIN_ID && pw === LOGIN_PW) {
      errorEl.hidden = true;
      console.log('LOGIN_SUCCESS');
      document.activeElement.blur(); // 숨겨질 입력칸에 커서가 남지 않도록
      crtSwitch(form, document.getElementById('home'));
      return;
    }

    // 깜빡임 애니메이션이 매번 다시 재생되도록 한 번 숨겼다가 표시
    errorEl.hidden = true;
    void errorEl.offsetWidth;
    errorEl.hidden = false;
    pwEl.value = '';
    syncPwMask();
    (id === LOGIN_ID ? pwEl : idEl).focus();
  });

  // 로딩 화면이 사라지면 ID 칸에 커서를 둠 (로딩 중에 친 키가 입력되지 않도록 그 뒤에)
  const loader = document.getElementById('loader');
  if (!loader) {
    idEl.focus();
    return;
  }
  const observer = new MutationObserver(() => {
    if (loader.isConnected) return;
    observer.disconnect();
    idEl.focus({ preventScroll: true });
  });
  observer.observe(document.body, { childList: true });
})();
