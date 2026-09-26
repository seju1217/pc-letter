// 편지목록: 지금은 번호 1 편지 행만 클릭 가능
(() => {
  const row1El = document.getElementById('listRow1');

  // 행을 누르는 순간 마우스 클릭음 1회 (script.js의 playMouseClickSound)
  row1El.addEventListener('pointerdown', (e) => {
    if (e.button === 0) playMouseClickSound();
  });

  row1El.addEventListener('click', () => {
    console.log('OPEN_LETTER_1');
    crtSwitch(document.getElementById('list'), document.getElementById('read'));
  });
})();
