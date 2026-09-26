// 편지목록: 지금은 번호 1 편지 행만 클릭 가능
(() => {
  const row1El = document.getElementById('listRow1');

  // 행을 누르는 순간 마우스 클릭음 1회 (script.js의 playMouseClickSound)
  // 터치는 iOS가 pointerdown을 오디오 재생 gesture로 인정하지 않아서, 오디오가 unlock된 뒤인 click에서 재생
  let touchTap = false;
  row1El.addEventListener('pointerdown', (e) => {
    touchTap = e.pointerType !== 'mouse';
    if (e.button === 0 && !touchTap) playMouseClickSound();
  });

  addPressFeedback(row1El);

  row1El.addEventListener('click', () => {
    if (touchTap) {
      touchTap = false;
      playMouseClickSound();
    }
    console.log('OPEN_LETTER_1');
    crtSwitch(document.getElementById('list'), document.getElementById('read'));
  });
})();
