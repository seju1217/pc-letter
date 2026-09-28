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
