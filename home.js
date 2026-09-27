// 초기화면: 지금은 통신광장만 클릭 가능
(() => {
  const plazaEl = document.getElementById('homePlaza');

  // 버튼을 누르는 순간 마우스 클릭음 1회 (script.js의 playMouseClickSound)
  plazaEl.addEventListener('pointerdown', (e) => {
    if (e.button === 0) playMouseClickSound();
  });

  addPressFeedback(plazaEl);

  plazaEl.addEventListener('click', () => {
    console.log('OPEN_COMMUNICATION_PLAZA');
    crtSwitch(document.getElementById('home'), document.getElementById('list'));
  });
})();

// 초기화면 → 엔터테인먼트 글목록
(() => {
  const entertainmentEl = document.getElementById('homeEntertainment');

  entertainmentEl.addEventListener('pointerdown', (e) => {
    if (e.button === 0) playMouseClickSound();
  });

  addPressFeedback(entertainmentEl);

  entertainmentEl.addEventListener('click', () => {
    console.log('OPEN_ENTERTAINMENT');
    crtSwitch(document.getElementById('home'), document.getElementById('entertainment'));
  });
})();

// 엔터테인먼트 버튼의 CRT 오류 깜빡임: 초기화면에 들어올 때마다 툭……툭툭 몇 번만, 그 뒤로는 정상
(() => {
  const homeEl = document.getElementById('home');
  const glitchEl = document.getElementById('homeEntertainmentGlitch');

  const START_DELAY = 170; // CRT 전환(가로줄)이 끝난 직후
  const FLICKERS = [ // [첫 깜빡임 기준 시작 시각, 길이] (ms)
    [0, 80],
    [950, 60],
    [1080, 70],
    [1420, 90],
    [2180, 70],
    [2490, 85],
  ];

  let timers = [];
  const stop = () => {
    timers.forEach(clearTimeout);
    timers = [];
    glitchEl.classList.remove('is-glitching');
  };

  const play = () => {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    FLICKERS.forEach(([at, length]) => {
      timers.push(setTimeout(() => glitchEl.classList.add('is-glitching'), START_DELAY + at));
      timers.push(setTimeout(() => glitchEl.classList.remove('is-glitching'), START_DELAY + at + length));
    });
  };

  new MutationObserver(() => (homeEl.hidden ? stop() : play()))
    .observe(homeEl, { attributes: true, attributeFilter: ['hidden'] });
})();
