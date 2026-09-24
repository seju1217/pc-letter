// 최초 진입 시 PC통신 접속 로딩 화면
(() => {
  const DOT_INTERVAL = 400;   // 접속중. → .. → ... 간격 (ms)
  const LOADING_TIME = 3900;  // 쪽지 화면으로 넘어가기까지 (ms)
  const TRANSITION_TIME = 650;

  const loader = document.getElementById('loader');
  if (!loader) return;

  const dotsEl = document.getElementById('loaderDots');
  const canvas = document.getElementById('loaderNoise');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 로딩 중에는 뒤의 쪽지 화면이 키 입력을 받지 않게
  const blockKeys = (e) => e.stopImmediatePropagation();
  window.addEventListener('keydown', blockKeys, true);

  // 줄마다 정해진 시각에 표시
  loader.querySelectorAll('.loader__line').forEach((line) => {
    setTimeout(() => line.classList.add('is-shown'), Number(line.dataset.at) || 0);
  });

  let dots = 0;
  const dotsTimer = setInterval(() => {
    dots = (dots % 3) + 1;
    dotsEl.textContent = '.'.repeat(dots);
  }, DOT_INTERVAL);

  // 저해상도 흑백 노이즈
  let noiseTimer = null;
  if (!reduceMotion && canvas.getContext) {
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(canvas.width, canvas.height);
    const drawNoise = () => {
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };
    drawNoise();
    noiseTimer = setInterval(drawNoise, 60);
  }

  setTimeout(() => {
    clearInterval(dotsTimer);
    loader.classList.add('loader--off');

    setTimeout(() => {
      clearInterval(noiseTimer);
      window.removeEventListener('keydown', blockKeys, true);
      loader.remove();
    }, TRANSITION_TIME);
  }, LOADING_TIME);
})();
