// ===== 쪽지 내용 (여기만 고치면 됩니다) =====
const SENDER = '이세영';

const MESSAGE = `반쯤 비어 있어도 괜찮았던 이세영의 하루는 이제 반이면 이상할 정도로 공허하고 불완전하고 낯설어.
아마 당신이라는 변수가, 하나가 아니면 견딜 수 없도록 나를 갈구시키나봐.
술을 마신 것도 아닌데 괜히 어렵게 말만 늘어놓네.
그립다, 이 한마디면 될걸...

크리스마스 이브에 만날래?`;

// 타이핑 속도 (ms)
const TYPING_SPEED = 110;       // 기본 글자 간격
const TYPING_JITTER = 70;       // 글자마다 더해지는 랜덤 편차
const PAUSE_PUNCTUATION = 350;  // , . ! ? 뒤 추가 대기
const PAUSE_NEWLINE = 550;      // 줄바꿈 뒤 추가 대기
const SOUND_VOLUME = 0.35;      // 0 ~ 1
// ==========================================

const screenEl = document.querySelector('.screen');
const messageEl = document.getElementById('message');
const textEl = document.getElementById('messageText');
const hintEl = document.getElementById('hint');

let audioCtx = null;
let noiseBuffer = null;
let soundBus = null;
let typing = false;
let timer = null;

// 노이즈 버퍼와 출력 경로 준비 (울림 없이 건조하게, 저음은 걷어냄)
function setupAudio(ctx) {
  audioCtx = ctx;

  const length = Math.floor(ctx.sampleRate * 0.2);
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 350;
  highpass.Q.value = 0.7;

  // 여러 겹이 겹칠 때 찢어지지 않도록 가볍게 눌러줌
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.knee.value = 6;
  limiter.ratio.value = 6;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;

  highpass.connect(limiter).connect(ctx.destination);
  soundBus = highpass;
}

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  setupAudio(new AudioContext());
}

const rand = (min, max) => min + Math.random() * (max - min);

// 필터를 거친 아주 짧은 노이즈 한 조각: 모든 타격음의 기본 단위
function noiseHit({ when, type, freq, q, gain, decay }) {
  const source = audioCtx.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;

  const env = audioCtx.createGain();
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(gain, when + 0.0008);
  env.gain.exponentialRampToValueAtTime(0.0001, when + decay);

  source.connect(filter).connect(env).connect(soundBus);
  const offset = Math.random() * (noiseBuffer.duration - decay - 0.02);
  source.start(when, offset, decay + 0.01);
}

// 클릭 어택 + 노이즈 버스트 + 짧은 감쇠로 만드는 '타닥' 키 소리
function playKeySound(char) {
  if (!audioCtx || !noiseBuffer) return;
  const now = audioCtx.currentTime;
  const isSpace = char === ' ';
  const isEnter = char === '\n';

  const pitch = rand(0.95, 1.05); // 키마다 미세한 음높이 차이
  const level = SOUND_VOLUME * rand(0.92, 1) * (isEnter ? 1.2 : isSpace ? 1.08 : 1);
  const tone = isEnter ? 0.9 : isSpace ? 0.93 : 1; // 스페이스·엔터는 아주 조금만 낮게

  // 1) 클릭 어택: 키캡이 눌리는 순간의 밝고 짧은 '틱'
  noiseHit({ when: now, type: 'highpass', freq: 5000 * pitch, q: 0.8, gain: level * 3, decay: 0.005 });
  // 2) 타격 몸통: 플라스틱이 부딪히는 '탁'
  noiseHit({ when: now, type: 'bandpass', freq: 2600 * pitch * tone, q: 1.6, gain: level * 7, decay: isEnter ? 0.028 : 0.02 });
  // 3) 바닥에 닿는 두 번째 타격: '타닥'의 '닥'
  noiseHit({ when: now + rand(0.006, 0.01), type: 'bandpass', freq: 3400 * pitch * tone, q: 1.4, gain: level * 2.4, decay: 0.012 });
  // 4) 스페이스·엔터: 긴 키캡이 살짝 달그락
  if (isSpace || isEnter) {
    noiseHit({ when: now + rand(0.014, 0.02), type: 'bandpass', freq: 2200 * pitch, q: 2, gain: level * 1.8, decay: 0.012 });
  }
  // 5) 키가 올라오며 나는 작은 '틱'
  noiseHit({ when: now + rand(0.055, 0.075), type: 'bandpass', freq: 4000 * pitch, q: 1.5, gain: level * 0.4, decay: 0.008 });
}

function delayAfter(char) {
  let delay = TYPING_SPEED + Math.random() * TYPING_JITTER;
  if (char === '\n') delay += PAUSE_NEWLINE;
  else if (',.!?'.includes(char)) delay += PAUSE_PUNCTUATION;
  return delay;
}

function startTyping() {
  const chars = Array.from(MESSAGE); // 이모지 등 서로게이트 문자도 한 글자로
  let index = 0;

  clearTimeout(timer);
  textEl.textContent = '';
  hintEl.hidden = true;
  typing = true;

  function typeNext() {
    if (index >= chars.length) {
      typing = false;
      return;
    }
    const char = chars[index++];
    textEl.textContent += char;
    playKeySound(char);
    messageEl.scrollTop = messageEl.scrollHeight; // 넘치면 마지막 줄이 보이게
    timer = setTimeout(typeNext, delayAfter(char));
  }

  timer = setTimeout(typeNext, 400);
}

// 브라우저 자동재생 정책 때문에 첫 클릭/키 입력 후 시작.
// 다 쓴 뒤 다시 누르면 처음부터 다시 씁니다.
function handleStart() {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if (!typing) startTyping();
}

screenEl.addEventListener('click', handleStart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleStart();
  }
});
