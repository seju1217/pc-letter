// 엔터테인먼트 글목록: 1~4번 게시글 행 → 로딩창(모래시계 2초) → 해당 번호의 읽기 화면
(() => {
  const listEl = document.getElementById('entertainment');

  const LOADING_TIME = 2000; // 로딩창을 띄워 두는 시간
  const FRAME_TIME = 250;    // 모래시계 한 프레임 길이

  // 픽셀 모래시계 (11 x 14칸) — k: 테두리, w: 빈 유리, s: 모래, .: 투명
  const HOURGLASS_DONE = [ // ⌛ 모래가 다 내려옴
    'kkkkkkkkkkk',
    '.kwwwwwwwk.',
    '.kwwwwwwwk.',
    '.kwwwwwwwk.',
    '..kwwwwwk..',
    '...kwwwk...',
    '....kwk....',
    '....kwk....',
    '...kwwwk...',
    '..kwssswk..',
    '.kwssssswk.',
    '.ksssssssk.',
    '.ksssssssk.',
    'kkkkkkkkkkk',
  ];
  const HOURGLASS_FULL = [...HOURGLASS_DONE].reverse(); // 막 뒤집음: 모래가 위에
  const HOURGLASS_FLOWING = [ // ⏳ 모래가 흐르는 중
    'kkkkkkkkkkk',
    '.kwwwwwwwk.',
    '.kwwwwwwwk.',
    '.kwssssswk.',
    '..ksssssk..',
    '...ksssk...',
    '....ksk....',
    '....ksk....',
    '...kwswk...',
    '..kwwswwk..',
    '.kwwwswwwk.',
    '.kwssssswk.',
    '.ksssssssk.',
    'kkkkkkkkkkk',
  ];

  const COLORS = { k: '#000000', w: '#ffffff', s: '#c0a040' };

  const toSvg = (rows) => {
    let rects = '';
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (COLORS[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${COLORS[ch]}"/>`;
      });
    });
    return `<svg viewBox="0 0 11 14" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  };

  // ⌛ → (옆으로 눕힘: 뒤집는 중) → 모래가 위로 → ⏳ → ⌛ … 순서로 뚝뚝 끊어서 교체
  const FRAMES = [
    { svg: toSvg(HOURGLASS_DONE), rotate: 0 },
    { svg: toSvg(HOURGLASS_DONE), rotate: 90 },
    { svg: toSvg(HOURGLASS_FULL), rotate: 0 },
    { svg: toSvg(HOURGLASS_FLOWING), rotate: 0 },
  ];

  let loading = null; // { el, frameTimer, doneTimer }

  const stopLoading = () => {
    if (!loading) return;
    clearInterval(loading.frameTimer);
    clearTimeout(loading.doneTimer);
    loading.el.remove();
    loading = null;
  };

  const openPost = (n) => {
    if (loading) return;

    const el = document.createElement('div');
    el.className = 'ent-loading';
    el.innerHTML = `
      <div class="ent-loading__window" role="alertdialog" aria-labelledby="entLoadingTitle" aria-describedby="entLoadingText">
        <div class="ent-loading__titlebar">
          <span class="ent-loading__title" id="entLoadingTitle">글읽기</span>
          <span class="ent-loading__close" aria-hidden="true">×</span>
        </div>
        <div class="ent-loading__body">
          <div class="ent-loading__icon"></div>
          <p class="ent-loading__text" id="entLoadingText">글을 불러오는 중입니다...</p>
        </div>
      </div>`;
    listEl.append(el);

    const iconEl = el.querySelector('.ent-loading__icon');
    let frame = 0;
    const drawFrame = () => {
      const { svg, rotate } = FRAMES[frame % FRAMES.length];
      iconEl.innerHTML = svg;
      iconEl.style.transform = rotate ? `rotate(${rotate}deg)` : '';
      frame += 1;
    };
    drawFrame();

    loading = {
      el,
      frameTimer: setInterval(drawFrame, FRAME_TIME),
      doneTimer: setTimeout(() => {
        stopLoading();
        crtSwitch(listEl, document.getElementById(`entertainmentRead${n}`), true, false);
      }, LOADING_TIME),
    };
  };

  // 로딩 중 뒤로가기(←·Backspace)로 글목록을 떠나면 로딩 취소
  window.addEventListener('popstate', stopLoading);

  document.querySelectorAll('.entertainment__row').forEach((rowEl) => {
    const n = rowEl.dataset.post;

    // 행을 누르는 순간 마우스 클릭음 1회 (list.js와 같은 방식: 터치는 click에서 재생)
    let touchTap = false;
    rowEl.addEventListener('pointerdown', (e) => {
      touchTap = e.pointerType !== 'mouse';
      if (e.button === 0 && !touchTap) playMouseClickSound();
    });

    addPressFeedback(rowEl);

    rowEl.addEventListener('click', () => {
      if (touchTap) {
        touchTap = false;
        playMouseClickSound();
      }
      console.log(`OPEN_ENTERTAINMENT_POST_${n}`);
      openPost(n);
    });
  });
})();

// 1번 글 영상: 읽기 화면을 떠나면(숨겨지면) 일시정지 — 숨긴 iframe도 소리는 계속 나기 때문
(() => {
  const screenEl = document.getElementById('entertainmentRead1');
  const videoEl = document.getElementById('entertainmentRead1Video');

  new MutationObserver(() => {
    if (!screenEl.hidden) return;
    videoEl.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube.com');
  }).observe(screenEl, { attributes: true, attributeFilter: ['hidden'] });
})();

// 2번 글 영상: 1번 글과 같은 방식으로, 읽기 화면을 떠나면 일시정지
(() => {
  const screenEl = document.getElementById('entertainmentRead2');
  const videoEl = document.getElementById('entertainmentRead2Video');

  new MutationObserver(() => {
    if (!screenEl.hidden) return;
    videoEl.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube.com');
  }).observe(screenEl, { attributes: true, attributeFilter: ['hidden'] });
})();

// 3번 글 영상: 1·2번 글과 같은 방식으로, 읽기 화면을 떠나면 일시정지
(() => {
  const screenEl = document.getElementById('entertainmentRead3');
  const videoEl = document.getElementById('entertainmentRead3Video');

  new MutationObserver(() => {
    if (!screenEl.hidden) return;
    videoEl.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube.com');
  }).observe(screenEl, { attributes: true, attributeFilter: ['hidden'] });
})();

// 4번 글 영상: 1~3번 글과 같은 방식으로, 읽기 화면을 떠나면 일시정지
(() => {
  const screenEl = document.getElementById('entertainmentRead4');
  const videoEl = document.getElementById('entertainmentRead4Video');

  new MutationObserver(() => {
    if (!screenEl.hidden) return;
    videoEl.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube.com');
  }).observe(screenEl, { attributes: true, attributeFilter: ['hidden'] });
})();

// 게시글 읽기 화면 '뒤로' 버튼 → 글목록
// 브라우저 뒤로가기·Backspace와 같은 경로(history.back → popstate → crtSwitch)를 써서 history가 꼬이지 않게 함
// 영상 일시정지는 화면이 숨겨질 때 위의 각 글 영상 코드가 처리
(() => {
  document.querySelectorAll('.entertainment-read__back').forEach((backEl) => {
    const screenEl = backEl.closest('.screen');
    backEl.addEventListener('click', () => {
      if (screenEl.hidden || currentScreenId !== screenEl.id) return; // 연타로 두 번 뒤로 가지 않도록
      console.log(`BACK_TO_ENTERTAINMENT_LIST_FROM_${screenEl.id}`);
      history.back();
    });
  });
})();
