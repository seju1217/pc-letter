// 편지읽기: 1번 편지 타이핑
// 타이핑 리듬(delayAfter)과 키 소리(playKeySound)는 script.js의 쪽지 타이핑을 그대로 사용
(() => {
  const LETTER_1 = {
    from: '절반1/이세영',
    to: '절반2/서재혁',
    date: '26/09/24 22:23:47',
    body: `반쯤 비어 있어도 괜찮았던 이세영의 하루는 이제 반이면 이상할 정도로 공허하고 불완전하고 낯설어.
아마 당신이라는 변수가, 하나가 아니면 견딜 수 없도록 나를 갈구시키나봐.
술을 마신 것도 아닌데 괜히 어렵게 말만 늘어놓네.
그립다, 이 한마디면 될걸...

크리스마스 이브에 만날래?`,
  };

  // 쪽지 화면(.screen)과 헷갈리지 않도록 편지읽기 화면을 id로 특정
  const readEl = document.getElementById('read');
  const bodyEl = document.getElementById('readBody');
  const cursorEl = document.getElementById('readCursor');

  // 보낸이 → 수신인 → 날짜 → 본문 순서로, 각 칸을 채울 span과 내용
  const parts = [
    { el: document.getElementById('readFrom'), text: LETTER_1.from },
    { el: document.getElementById('readTo'), text: LETTER_1.to },
    { el: document.getElementById('readDate'), text: LETTER_1.date },
    { el: document.getElementById('readBodyText'), text: LETTER_1.body },
  ].map((part) => ({ ...part, chars: Array.from(part.text) })); // 이모지 등도 한 글자로

  const bodyPart = parts[parts.length - 1];
  const PAUSE_BEFORE_BODY = 2000; // 날짜 → Enter → 본문 첫 글자 전 멈춤 (ms)

  // 본문 문자열 위치 → 글자(chars) 위치
  const charIndexOf = (text) => Array.from(LETTER_1.body.slice(0, LETTER_1.body.indexOf(text))).length;

  // 화면상 줄바꿈 위치 고정: 이 단어들 앞의 띄어쓰기는 줄을 바꿔 표시 (입력 소리·속도는 띄어쓰기 그대로)
  const BREAK_BEFORE = ['이상할 정도로', '나를 갈구시키나봐'];
  const softBreaks = new Set(BREAK_BEFORE.map((word) => charIndexOf(' ' + word)));

  // '될걸' 뒤 '...'은 여운을 두고 한 점씩: 첫 점 앞부터 Enter 전까지 점 사이 간격을 고정
  const DOT_DELAY = 500; // 점 3개 + Enter까지 약 1.5초
  const dotsStart = charIndexOf('될걸...') + 2; // 첫 '.' 위치
  const dotsEnd = dotsStart + 2;                // 마지막 '.' 위치

  // 마지막 문장: '크리스마스 이브에'를 다 쓴 직후 1.25초 정지, '만날래?'는 평소 리듬에 살짝만 늦춤
  const PAUSE_BEFORE_ASK = 1250;
  // [' '→만, 만→날, 날→래, 래→?]
  const ASK_EXTRA = [0, 150, 170, 180];
  const askStart = charIndexOf('만날래?') - 1; // '만' 바로 앞 띄어쓰기 위치

  let typing = false;
  let paused = false;
  let timer = null;
  let partIndex = 0;
  let charIndex = 0;

  // 깜빡이는 커서를 지금 쓰고 있는 칸의 글자 바로 뒤로
  const moveCursorTo = (part) => part.el.after(cursorEl);

  function typeNext() {
    const part = parts[partIndex];

    // 한 칸을 다 썼으면 Enter를 치듯 다음 칸으로 (쪽지의 줄바꿈과 같은 소리·대기)
    if (charIndex >= part.chars.length) {
      if (partIndex === parts.length - 1) {
        typing = false;
        readEl.dataset.typingDone = 'true'; // 다 쓴 뒤에만 Backspace 뒤로가기 허용 (transition.js)
        return;
      }
      partIndex++;
      charIndex = 0;
      moveCursorTo(parts[partIndex]);
      playKeySound('\n');
      timer = setTimeout(typeNext, parts[partIndex] === bodyPart ? PAUSE_BEFORE_BODY : delayAfter('\n'));
      return;
    }

    const index = charIndex++;
    const char = part.chars[index];
    const isBody = part === bodyPart;
    part.el.textContent += isBody && softBreaks.has(index) ? '\n' : char;
    playKeySound(char);
    bodyEl.scrollTop = bodyEl.scrollHeight; // 본문이 넘치면 마지막 줄이 보이게
    let delay = delayAfter(char);
    // '걸' 다음부터 마지막 '.' 다음(Enter 전)까지: 점 하나하나 천천히
    if (isBody && index >= dotsStart - 1 && index <= dotsEnd) delay = DOT_DELAY;
    if (isBody && index === askStart - 1) delay = PAUSE_BEFORE_ASK; // '에' 다음
    if (isBody && index >= askStart && index < askStart + ASK_EXTRA.length) delay += ASK_EXTRA[index - askStart];
    timer = setTimeout(typeNext, delay);
  }

  function startTyping() {
    clearTimeout(timer);
    parts.forEach((part) => { part.el.textContent = ''; });
    partIndex = 0;
    charIndex = 0;
    paused = false;
    typing = true;
    delete readEl.dataset.typingDone;
    moveCursorTo(parts[0]);
    timer = setTimeout(typeNext, 400);
  }

  // 작성 중 클릭: 현재 위치에서 멈춤 ↔ 멈춘 곳부터 이어서 쓰기
  function togglePause() {
    paused = !paused;
    clearTimeout(timer);
    if (!paused) timer = setTimeout(typeNext, TYPING_SPEED);
  }

  // 쪽지와 같은 동작: 처음 누르면 쓰기 시작, 작성 중에는 일시정지/재개, 다 쓴 뒤 누르면 처음부터 다시
  function handleStart() {
    if (!typing) startTyping();
    else togglePause();
  }

  // 타이핑을 시작하는 클릭/탭: 마우스 클릭음 1회 즉시 → 1.6초 뒤 시작 (대기 중 추가 클릭은 무시)
  // startTyping()의 0.4초 대기와 합쳐 클릭음 후 약 2초에 첫 글자
  const START_DELAY = 1600;
  let startPending = false;
  let startTimer = null;
  readEl.addEventListener('click', () => {
    if (startPending) return;
    if (typing) {
      handleStart();
      return;
    }
    playMouseClickSound();
    startPending = true;
    startTimer = setTimeout(() => {
      startPending = false;
      handleStart();
    }, START_DELAY);
  });
  // 브라우저 뒤로가기로 화면을 떠나면: 시작 대기는 취소, 작성 중이면 그 자리에서 일시정지 (다시 오면 클릭으로 이어서)
  new MutationObserver(() => {
    if (!readEl.hidden) return;
    if (startPending) {
      clearTimeout(startTimer);
      startPending = false;
    }
    if (typing && !paused) togglePause();
  }).observe(readEl, { attributes: true, attributeFilter: ['hidden'] });

  document.addEventListener('keydown', (e) => {
    if (readEl.hidden) return; // 편지읽기 화면이 보일 때만
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (startPending) return; // 클릭 후 대기 중이면 중복 시작 방지
      handleStart();
    }
  });
})();
