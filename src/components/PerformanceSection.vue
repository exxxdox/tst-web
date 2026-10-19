<script setup>
import { nextTick, ref } from 'vue'
import SignalStrip from '@/components/SignalStrip.vue'
import { focusAfterRender } from '@/utils/focusAfterRender.js'

const bilibiliPlayerUrl =
  'https://player.bilibili.com/player.html?bvid=BV1yCXAYRECD&page=1&high_quality=1&danmaku=0'

const isPlaying = ref(false)
const player = ref(null)

async function play() {
  isPlaying.value = true
  // 按钮会被 iframe 替换，主动交接焦点，避免键盘位置回到文档开头。
  await focusAfterRender(nextTick, () => player.value)
}
</script>

<template>
  <!-- 由首页统一提供 section 语义与 #performance 锚点，这里只负责内容与版式 -->
  <div class="performance-page">
    <div class="performance container" aria-labelledby="performance-title">
      <div class="performance__copy">
        <p class="kicker">Live take / guitar cover</p>
        <h2 id="performance-title" class="section-title">My Favourite Things</h2>
        <p class="performance__meta">Jonathan Kreisberg · covered by TST</p>
        <SignalStrip input="Take 01" output="Video" />
      </div>

      <div class="stage-frame" aria-label="Performance video player">
        <div class="stage-frame__status" aria-hidden="true">
          <span><i></i> Input armed</span>
          <span>48 kHz / live take</span>
        </div>
        <button
          v-if="!isPlaying"
          class="performance-poster"
          type="button"
          aria-label="Play My Favourite Things performance"
          @click="play"
        >
          <!-- 封面图改用 WebP(1.75MB→80KB)，decoding=async 让解码不阻塞主线程 -->
          <img src="/anime-jazz-guitar-cover.webp" alt="" decoding="async" />
          <span class="performance-poster__copy">
            <span class="performance-poster__play" aria-hidden="true">▶</span>
            <span>
              <strong>Play live take</strong>
              <small>My Favourite Things · TST</small>
            </span>
          </span>
        </button>
        <iframe
          v-else
          ref="player"
          class="performance__player"
          :src="bilibiliPlayerUrl"
          title="My Favourite Things - Covered by TST"
          allowfullscreen
          scrolling="no"
          frameborder="0"
          sandbox="allow-same-origin allow-forms allow-scripts allow-popups"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-page {
  /* --page-pad 由 base.css 提供（含矮视口的压缩档），这里只做高度预算 */
  /* 视口减去导航、页脚、页面内边距后可用的内容高度 */
  --content-budget: calc(100vh - var(--nav-height) - var(--footer-height) - 2 * var(--page-pad));
  /* 单列时文案区(≈345px)与它到舞台的间隙(≈48px)要先从预算里扣掉 */
  --copy-reserve: 25rem;
  /* 状态条 + 上下内边距 + 边框：舞台外框比内层 854/480 内容盒多出的固定高度 */
  --stage-chrome: 3.75rem;
  /* 舞台宽度上限。舞台高度是由宽度按 854/480 反推出来的，只给宽度上限时，
     矮视口下反推出的高度会把整页撑出视口（1920×1080 溢 254px、1440×900 溢 436px）。
     所以这里同时按可用高度反推一个宽度上限，再和 --stage-max 取小。
     max(20rem,…) 是下限，防止极矮视口把舞台压成零宽。 */
  --stage-w: min(
    var(--stage-max),
    max(
      20rem,
      calc((var(--content-budget) - var(--copy-reserve) - var(--stage-chrome)) * 854 / 480)
    )
  );
  /* grid + align-content：大屏上内容远矮于视口时垂直居中，避免全部堆在顶部留一大片空白 */
  display: grid;
  align-content: center;
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
  padding-block: var(--page-pad);
}

.performance {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
}

.performance__copy {
  display: grid;
  gap: 0.85rem;
}

.performance__copy .section-title {
  text-wrap: balance;
}

.performance__meta {
  color: rgba(222, 255, 238, 0.82);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 750;
}

.stage-frame {
  width: min(100%, var(--stage-w));
  padding: clamp(0.55rem, 1.8vw, 1rem);
  overflow: hidden;
  /* 黑白灰主题：原深蓝面板改为半透明深灰，粒子背景可透出 */
  background: rgba(22, 22, 22, 0.72);
  border: 1px solid rgba(61, 255, 141, 0.22);
  border-radius: 10px;
  box-shadow:
    0 28px 70px rgba(0, 8, 20, 0.38),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
}

.stage-frame__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 0.25rem 0.7rem;
  color: rgba(178, 218, 204, 0.66);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage-frame__status span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.stage-frame__status i {
  width: 0.48rem;
  height: 0.48rem;
  background: var(--color-accent-warm);
  border-radius: 50%;
  box-shadow: 0 0 0.55rem rgba(255, 179, 71, 0.48);
}

.performance-poster {
  position: relative;
  display: grid;
  width: 100%;
  aspect-ratio: 854 / 480;
  place-items: center;
  overflow: hidden;
  padding: 0;
  color: var(--color-heading);
  background: linear-gradient(90deg, rgba(2, 13, 24, 0.92), rgba(2, 13, 24, 0.26)), #020d18;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.performance-poster::after {
  position: absolute;
  inset: 0;
  content: '';
  background: repeating-linear-gradient(
    180deg,
    transparent 0 5px,
    rgba(61, 255, 141, 0.035) 5px 6px
  );
  pointer-events: none;
}

.performance-poster img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.72;
  filter: saturate(0.72) contrast(1.2);
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.performance-poster__copy {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 1rem;
  padding: clamp(1.2rem, 4vw, 3rem);
  text-align: left;
}

.performance-poster__copy > span:last-child {
  display: grid;
  gap: 0.25rem;
}

.performance-poster__copy strong {
  font-size: clamp(1.15rem, 2.5vw, 1.75rem);
  font-weight: 850;
}

.performance-poster__copy small {
  color: rgba(178, 218, 204, 0.72);
  font-size: clamp(0.78rem, 1.4vw, 0.95rem);
  font-weight: 700;
}

.performance-poster__play {
  display: grid;
  width: clamp(3rem, 7vw, 4.6rem);
  aspect-ratio: 1;
  place-items: center;
  padding-left: 0.18em;
  /* 三角字符随按钮尺寸放大，避免大屏上按钮大、图标小 */
  font-size: clamp(1.25rem, 2.4vw, 2rem);
  color: #06111f;
  background: var(--color-accent);
  border: 1px solid rgba(222, 255, 238, 0.44);
  border-radius: 8px;
  box-shadow: 0 0 1.8rem rgba(61, 255, 141, 0.2);
}

.performance-poster:hover img {
  opacity: 0.82;
  transform: scale(1.025);
}

.performance__player {
  display: block;
  width: 100%;
  aspect-ratio: 854 / 480;
  overflow: hidden;
  background: #000;
  border: 0;
  border-radius: 6px;
}

@media (max-width: 540px) {
  .stage-frame__status span:last-child {
    display: none;
  }
}

/* 单列布局一直持续到桌面双列断点（1024px）；这段宽度内舞台都拉满整栏，
   避免平板宽度下 --stage-w 被高度预算压成 20rem。 */
@media (max-width: 1023px) {
  .stage-frame {
    width: 100%;
  }
}

/* 桌面双列：文案与舞台并排。
   单列时页面高度 = 文案 + 间隙 + 舞台 三段相加，而舞台高度由 854/480 从宽度反推，
   1440×900 会撑到 1330px（溢 436px）、1024×768 撑到 1115px（溢 347px）。
   改双列后高度取两列较高者，且 --copy-reserve 归零，舞台能吃到接近整屏的高度预算。
   断点取 1024px：再窄文案列放不下标题。 */
@media (min-width: 1024px) {
  .performance-page {
    --copy-reserve: 0px;
  }

  .performance {
    /* 舞台列同时受 60% 与 --stage-w 约束，两者取小，保证舞台不会比可用高度允许的更宽，
       也不会有列宽大过舞台、右侧留一段空档 */
    grid-template-columns: minmax(0, 1fr) minmax(0, min(60%, var(--stage-w)));
    align-items: center;
    column-gap: clamp(2rem, 3.5vw, 4rem);
  }

  /* 文案列在此布局下只有约 350~640px 宽，沿用 --fs-h1 的 112px 会让 "Favourite"
     单个词就超出列宽，所以标题按列宽单独收敛为侧栏尺寸。 */
  .performance__copy .section-title {
    font-size: clamp(2.25rem, 2.6vw, 3.75rem);
  }
}
</style>
