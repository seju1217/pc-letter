// 배경음악: The Velvet Underground - Pale Blue Eyes
// 공식 음원(유니버설뮤직 제공 'The Velvet Underground - Topic' 업로드)을 YouTube 공식 IFrame Player API로 재생
// - 음원 파일을 내려받거나 소리만 따로 추출하지 않고, YouTube 플레이어를 화면에 보이게 둔 채 재생
// - 소리 있는 자동재생을 브라우저가 막으면, 첫 클릭/키 입력 때 이어서 재생
// - 모든 화면이 한 페이지 안에서 전환되므로 플레이어는 한 번만 만들어지고 음악이 끊기지 않음
(() => {
  const VIDEO_ID = 'MA3aKUwu-Dk'; // Pale Blue Eyes (Provided to YouTube by UMG)
  const AUTOPLAY_CHECK = 1500;    // 이 시간 안에 재생이 시작되지 않으면 자동재생이 막힌 것으로 봄 (ms)

  const windowEl = document.getElementById('music');
  const titleEl = document.getElementById('musicTitle');
  const statusEl = document.getElementById('musicStatus');

  let player = null;
  let ready = false;
  let started = false;
  let wantPlay = false; // 플레이어 준비 전에 사용자가 이미 눌렀는지

  const STATUS = {
    '-1': '대기 중',
    0: '■ 끝',
    1: '▶ 재생 중',
    2: 'Ⅱ 일시정지',
    3: '… 불러오는 중',
    5: '대기 중',
  };
  const setStatus = (text) => { statusEl.textContent = text; };

  // 첫 사용자 입력에서 재생 (자동재생이 막혔을 때의 fallback)
  // 플레이어가 아직 준비 중이면 기억해 뒀다가 준비되는 즉시 재생
  const GESTURES = ['pointerdown', 'keydown'];
  const playOnGesture = () => {
    if (started) return;
    wantPlay = true;
    if (ready) player.playVideo();
  };
  const listenGestures = (on) => GESTURES.forEach((type) => {
    document[on ? 'addEventListener' : 'removeEventListener'](type, playOnGesture, true);
  });

  function createPlayer() {
    player = new YT.Player('musicPlayer', {
      videoId: VIDEO_ID,
      width: 200, // 실제 크기는 music.css에서 반응형으로 (정책상 최소 200x200)
      height: 200,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: VIDEO_ID, // loop는 playlist 지정이 있어야 동작
        playsinline: 1,
        rel: 0,
        color: 'white',     // 진행 막대를 빨강 대신 흰색으로 (덜 튀게, 공식 옵션)
        iv_load_policy: 3,  // 주석 표시 끔 (공식 옵션)
      },
      events: {
        onReady: () => {
          ready = true;
          player.playVideo(); // 자동재생 시도 (이미 눌렀다면 wantPlay 상태에서 바로 재생됨)
          setTimeout(() => {
            if (!started && !wantPlay) setStatus('▷ 누르면 재생');
          }, AUTOPLAY_CHECK);
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING && !started) {
            started = true;
            listenGestures(false);
          }
          if (started || e.data === YT.PlayerState.PLAYING) setStatus(STATUS[e.data] || '');
        },
        onError: () => setStatus('× 재생할 수 없음'),
      },
    });
  }

  // 로그인 화면이 나타나는 순간(로딩 화면이 사라질 때) 창을 띄우고 플레이어를 불러옴
  function openMusicWindow() {
    windowEl.hidden = false;
    setStatus('… 불러오는 중');
    listenGestures(true); // 준비 전에 누른 입력도 놓치지 않도록 바로 대기
    window.onYouTubeIframeAPIReady = createPlayer;
    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    document.head.append(api);
  }

  const loader = document.getElementById('loader');
  if (!loader) {
    openMusicWindow();
  } else {
    const observer = new MutationObserver(() => {
      if (loader.isConnected) return;
      observer.disconnect();
      openMusicWindow();
    });
    observer.observe(document.body, { childList: true });
  }

  // 제목 표시줄을 끌어서 창 옮기기 (가리는 메뉴가 있으면 비켜 놓을 수 있게)
  titleEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const rect = windowEl.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    titleEl.setPointerCapture(e.pointerId);

    const move = (ev) => {
      const x = Math.min(Math.max(ev.clientX - dx, 0), window.innerWidth - rect.width);
      const y = Math.min(Math.max(ev.clientY - dy, 0), window.innerHeight - rect.height);
      windowEl.style.left = `${x}px`;
      windowEl.style.top = `${y}px`;
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
    };
    const stop = () => {
      titleEl.removeEventListener('pointermove', move);
      titleEl.removeEventListener('pointerup', stop);
      titleEl.removeEventListener('pointercancel', stop);
    };
    titleEl.addEventListener('pointermove', move);
    titleEl.addEventListener('pointerup', stop);
    titleEl.addEventListener('pointercancel', stop);
  });
})();
