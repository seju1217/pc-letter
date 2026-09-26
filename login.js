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
  // Android 가상 키보드는 keydown이 key 'Unidentified'(keyCode 229)·code ''로만 와서 어떤 키인지 알 수 없음
  // → 그때만 표시해 두고, 바로 뒤 input 이벤트가 문자 삽입(insert…)일 때 소리 1회
  // PC·iPhone은 code가 늘 있어서 이 경로를 타지 않음
  // Backspace는 실제로 지워져 값이 바뀐 input 이벤트에서만 소리 1회 (빈 칸에서 누르면 input이 안 와서 무음)
  // PC·iPhone은 keydown의 Backspace로, Android는 inputType 'deleteContentBackward'로 알아냄 (한글 조합 중 지우기도 포함)
  const isUnknownVirtualKey = (e) => !e.code && (e.key === 'Unidentified' || e.key === 'Process' || e.keyCode === 229);
  [idEl, pwEl].forEach((field) => {
    let pendingVirtualKey = false;
    let pendingBackspace = false;
    field.addEventListener('keydown', (e) => {
      pendingVirtualKey = isUnknownVirtualKey(e);
      pendingBackspace = e.key === 'Backspace' || e.code === 'Backspace';
      if (isCharKey(e)) playKeySound(e.code === 'Space' ? ' ' : e.key); // 스페이스는 기존처럼 조금 낮은 소리
    });
    field.addEventListener('input', (e) => {
      const byBackspace = pendingBackspace || e.inputType === 'deleteContentBackward';
      const byVirtualKey = pendingVirtualKey;
      pendingVirtualKey = pendingBackspace = false;
      if (byBackspace) playKeySound('');
      else if (byVirtualKey && e.inputType && e.inputType.startsWith('insert')) playKeySound(e.data && e.data.endsWith(' ') ? ' ' : e.data || '');
    });
  });

  // 비밀번호는 실제 값은 그대로 두고, 화면에는 자리수만큼 *로 표시
  // 커서도 실제 input의 커서가 아니라 * 사이의 현재 위치에 직접 그림:
  // iPhone Safari 등은 비밀번호 가림 문자를 자체 글꼴(더 넓은 ●)로 그려서, 투명한 원래 커서가 * 보다 오른쪽에 떨어짐
  const pwMaskEl = document.getElementById('loginPwMask');
  const syncPwMask = () => {
    const length = Array.from(pwEl.value).length;
    const focused = document.activeElement === pwEl;
    const start = pwEl.selectionStart ?? length;
    const collapsed = start === (pwEl.selectionEnd ?? length);

    pwMaskEl.textContent = '*'.repeat(start);
    if (focused && collapsed) {
      const caret = document.createElement('span'); // 매번 새로 만들어 입력할 때마다 깜빡임이 처음부터 (실제 커서처럼)
      caret.className = 'login__pw-caret';
      pwMaskEl.append(caret);
    }
    pwMaskEl.append('*'.repeat(length - start));

    // 칸을 넘칠 만큼 길어지면 커서가 보이도록 스크롤
    const caretEl = pwMaskEl.querySelector('.login__pw-caret');
    pwMaskEl.scrollLeft = caretEl ? Math.max(0, caretEl.offsetLeft - pwMaskEl.clientWidth + caretEl.offsetWidth * 4) : 0;
  };
  // 커서 위치가 바뀔 수 있는 모든 순간에 다시 그림 (입력·삭제·방향키·터치로 커서 이동·포커스)
  const syncSoon = () => requestAnimationFrame(syncPwMask);
  ['input', 'keydown', 'keyup', 'click', 'select', 'focus', 'blur'].forEach((type) => pwEl.addEventListener(type, syncSoon));
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === pwEl) syncSoon();
  });

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
