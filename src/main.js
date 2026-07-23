import './style.css';

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------
   Start from intro on refresh,
   but allow project pages to link back to #projects
--------------------------------------- */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navigationEntry && navigationEntry.type === 'reload';

  if (isReload) {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }

    window.scrollTo(0, 0);
  } else if (window.location.hash) {
    const target = document.querySelector(window.location.hash);

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });

        ScrollTrigger.refresh();
      }, 100);
    }
  } else {
    window.scrollTo(0, 0);
  }

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);
});

/* ---------------------------------------
   Basic Three.js setup
--------------------------------------- */

const canvas = document.querySelector('#webgl-c');

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const geometry = new THREE.PlaneGeometry(2, 2);

/* ---------------------------------------
   Load C mask
--------------------------------------- */
const basePath = import.meta.env.BASE_URL;

const textureLoader = new THREE.TextureLoader();
const maskTexture = textureLoader.load(`${basePath}c-mask.png`);

maskTexture.minFilter = THREE.LinearFilter;
maskTexture.magFilter = THREE.LinearFilter;
maskTexture.wrapS = THREE.ClampToEdgeWrapping;
maskTexture.wrapT = THREE.ClampToEdgeWrapping;

/* ---------------------------------------
   Load video inside the C
--------------------------------------- */
const video = document.createElement('video');

video.src = `${basePath}portfolio-web.mp4`;
video.preload = 'auto';
video.muted = true;
video.defaultMuted = true;
video.loop = true;
video.autoplay = true;
video.playsInline = true;

// Extra compatibility for inline playback on mobile Safari
video.setAttribute('playsinline', '');

video.play().catch(() => {
  console.log('Video autoplay is waiting for interaction');
});

window.addEventListener(
  'pointerdown',
  () => {
    video.play().catch(() => {});
  },
  { once: true }
);

const videoTexture = new THREE.VideoTexture(video);

videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;
videoTexture.colorSpace = THREE.SRGBColorSpace;

/* ---------------------------------------
   Mouse trail texture
--------------------------------------- */

const trailCanvas = document.createElement('canvas');
const trailContext = trailCanvas.getContext('2d');

trailCanvas.width = 1024;
trailCanvas.height = 1024;

trailContext.fillStyle = 'black';
trailContext.fillRect(0, 0, trailCanvas.width, trailCanvas.height);

const trailTexture = new THREE.CanvasTexture(trailCanvas);
trailTexture.minFilter = THREE.LinearFilter;
trailTexture.magFilter = THREE.LinearFilter;

const pointer = {
  x: 0.5,
  y: 0.5,
  targetX: 0.5,
  targetY: 0.5,
  active: false,
};
const mouse = {
  x: 0.5,
  y: 0.5,
  targetX: 0.5,
  targetY: 0.5,
  strength: 0,
  targetStrength: 0,
};

window.addEventListener('pointermove', (event) => {
  const screenX = event.clientX / window.innerWidth;
  const screenY = event.clientY / window.innerHeight;

  // Pixel trail canvas: keep normal browser coordinates
  pointer.targetX = screenX;
  pointer.targetY = screenY;
  pointer.active = true;

  // Shader deformation: flip Y for WebGL UV coordinates
  mouse.targetX = screenX;
  mouse.targetY = 1.0 - screenY;
  mouse.targetStrength = 1;
});

window.addEventListener('pointerleave', () => {
  pointer.active = false;
  mouse.targetStrength = 0;
});


/* ---------------------------------------
   Shaders
--------------------------------------- */

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D uMask;
  uniform sampler2D uTrail;
  uniform sampler2D uVideo;

  uniform float uTime;
  uniform float uScale;
  uniform float uOpacity;
  uniform float uProgress;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform vec2 uResolution;

  varying vec2 vUv;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 screenUv = vUv;
    vec2 uv = screenUv;

    float aspect = uResolution.x / uResolution.y;

    /*
      Keep the square C mask from stretching on widescreen.
    */
    if (aspect > 1.0) {
      uv.x = (screenUv.x - 0.5) * aspect + 0.5;
    } else {
      uv.y = (screenUv.y - 0.5) / aspect + 0.5;
    }

    /*
      Mouse trail.
    */
    vec2 trailUv = screenUv;
    float rawTrail = texture2D(uTrail, trailUv).r;
float trail = smoothstep(0.08, 0.45, rawTrail);

/*
  Mouse effect only exists before scrolling.
  As soon as scroll starts, it fades out.
*/
float cursorFade = 1.0 - smoothstep(0.01, 0.08, uProgress);
trail *= cursorFade;
    /*
  Pixel trail distortion.
*/
vec2 distortionDirection = vec2(
  random(uv * 12.0) - 0.5,
  random(uv * 19.0) - 0.5
);

vec2 distortedUv = uv;

/*
  Keep the pixel/trail distortion.
*/
distortedUv += distortionDirection * trail * 0.09;

/*
  Add a subtle actual mouse push/pull on the C shape.
*/
vec2 mouseUv = uMouse;

if (aspect > 1.0) {
  mouseUv.x = (uMouse.x - 0.5) * aspect + 0.5;
} else {
  mouseUv.y = (uMouse.y - 0.5) / aspect + 0.5;
}

float mouseDistance = distance(uv, mouseUv);
float mouseInfluence = 1.0 - smoothstep(0.0, 0.24, mouseDistance);

/*
  Fade this effect out once scrolling starts.
*/
float hoverFade = 1.0 - smoothstep(0.01, 0.10, uProgress);

/*
  Push the C very slightly away from the cursor.
*/
vec2 mouseDirection = normalize(uv - mouseUv + vec2(0.0001));
distortedUv -= mouseDirection * mouseInfluence * uMouseStrength * hoverFade * 0.022;

/*
      Scroll zoom.
      This zooms into the body of the C.
    */
    vec2 zoomCenter = vec2(0.30, 0.45);
    float enterProgress = smoothstep(0.05, 0.92, uProgress);

    vec2 zoomOffset = distortedUv - zoomCenter;

    /*
      Subtle top/bottom stretch while entering.
    */
    float verticalDistance = abs(zoomOffset.y) * 2.0;
    float stretchY = 1.0 + enterProgress * 0.35 * smoothstep(0.08, 0.80, verticalDistance);
    float stretchX = 1.0 + enterProgress * 0.06;

    zoomOffset.x /= stretchX;
    zoomOffset.y /= stretchY;

    vec2 maskUv = zoomCenter + zoomOffset / uScale;

    /*
      C mask.
    */
    float mask = texture2D(uMask, maskUv).r;

    /*
      Soft edge.
    */
    float alpha = smoothstep(0.45, 0.55, mask) * uOpacity;

    /*
      Video inside the C.
    */
    vec2 videoUv = screenUv;
    vec3 videoColor = texture2D(uVideo, videoUv).rgb;

    /*
      Slight darkening so it feels more premium.
    */
    videoColor *= 0.82;

    /*
      Static grain over the video.
    */
    float grain = random(floor(uv * 650.0));

    vec3 color = videoColor;
    color += grain * 0.035;

    /*
      Mouse trail highlight.
    */
    color += trail * 0.02;

    gl_FragColor = vec4(color, alpha);
  }
`;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  uniforms: {
    uMask: { value: maskTexture },
    uTrail: { value: trailTexture },
    uVideo: { value: videoTexture },

    uTime: { value: 0 },
    uScale: { value: 1.1 },
    uOpacity: { value: 1 },
    uProgress: { value: 0 },
uMouse: { value: new THREE.Vector2(0.5, 0.5) },
uMouseStrength: { value: 0 },

uResolution: {
  value: new THREE.Vector2(window.innerWidth, window.innerHeight),
},
  },
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/* ---------------------------------------
   Scroll zoom
--------------------------------------- */

const introTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.2,
  },
});

introTimeline
  .to(
    material.uniforms.uProgress,
    {
      value: 1,
      ease: 'none',
    },
    0
  )
  .to(
    material.uniforms.uScale,
    {
      value: 14.5,
      ease: 'power2.inOut',
    },
    0
  )
  .to(
    material.uniforms.uOpacity,
    {
      value: 0,
      ease: 'none',
    },
    0.88
  );

  ScrollTrigger.create({
  trigger: '.projects',
  start: 'top top',
  onEnter: () => {
    gsap.set(canvas, {
      autoAlpha: 0,
    });
  },
  onLeaveBack: () => {
    gsap.set(canvas, {
      autoAlpha: 1,
    });
  },
});

/* ---------------------------------------
   Projects → About: parallax crossfade
--------------------------------------- */

gsap.set('.about', { position: 'relative', zIndex: 3, opacity: 0, y: 60 });
gsap.set('.contact', { position: 'relative', zIndex: 4 });

gsap.timeline({
  scrollTrigger: {
    trigger: '.about',
    start: 'top 90%',
    end: 'top 30%',
    scrub: 1,
  },
})
  .to('.projects', { opacity: 0.4, scale: 0.97, ease: 'none' }, 0)
  .to('.about', { opacity: 1, y: 0, ease: 'none' }, 0);

/* ---------------------------------------
   About → Contact: pin-and-reveal
--------------------------------------- */

const dwellVh = 60;

gsap.set('.contact', { marginTop: `${dwellVh}vh` });

ScrollTrigger.create({
  trigger: '.about',
  start: 'top top',
  end: `+=${100 + dwellVh}%`,
  pin: true,
  pinSpacing: false,
});

/* ---------------------------------------
   Resize
--------------------------------------- */

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height, false);
  material.uniforms.uResolution.value.set(width, height);

  ScrollTrigger.refresh();
}

window.addEventListener('resize', resize);
resize();

/* ---------------------------------------
   Mouse trail drawing
--------------------------------------- */

function updateTrailTexture() {
  const w = trailCanvas.width;
  const h = trailCanvas.height;

  pointer.x += (pointer.targetX - pointer.x) * 0.13;
  pointer.y += (pointer.targetY - pointer.y) * 0.13;

  /*
    Fade old trail.
  */
  trailContext.globalCompositeOperation = 'source-over';
  trailContext.fillStyle = 'rgba(0, 0, 0, 0.045)';
  trailContext.fillRect(0, 0, w, h);

  const progress = material.uniforms.uProgress.value;

  if (progress > 0.02) {
  trailContext.fillStyle = 'black';
  trailContext.fillRect(0, 0, w, h);
  trailTexture.needsUpdate = true;
  return;
}

if (pointer.active && progress < 0.02) {
    const x = pointer.x * w;
    const y = pointer.y * h;

    const radius = w * 0.05;
    const pixelSize = 12;

    for (let px = -radius; px < radius; px += pixelSize) {
      for (let py = -radius; py < radius; py += pixelSize) {
        const distance = Math.sqrt(px * px + py * py);

        if (distance < radius) {
          const edgeFade = 1 - distance / radius;
          const noise = Math.random();

          if (noise > 0.38) {
            const alpha = edgeFade * 0.22 * noise;

            trailContext.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            trailContext.fillRect(x + px, y + py, pixelSize, pixelSize);
          }
        }
      }
    }
  }

  trailTexture.needsUpdate = true;
}

/* ---------------------------------------
   Render loop
--------------------------------------- */

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  material.uniforms.uTime.value = elapsed;

mouse.x += (mouse.targetX - mouse.x) * 0.12;
mouse.y += (mouse.targetY - mouse.y) * 0.12;
mouse.strength += (mouse.targetStrength - mouse.strength) * 0.10;

material.uniforms.uMouse.value.set(mouse.x, mouse.y);
material.uniforms.uMouseStrength.value = mouse.strength;

updateTrailTexture();

renderer.render(scene, camera);
requestAnimationFrame(animate);
}

const aboutButton = document.querySelector('.about-easter-egg');
const aboutPanel = document.querySelector('.about-panel');
const aboutClose = document.querySelector('.about-panel-close');

if (aboutButton && aboutPanel && aboutClose) {
  function openAboutPanel() {
    aboutPanel.classList.add('is-open');
    aboutPanel.setAttribute('aria-hidden', 'false');
  }

  function closeAboutPanel() {
    aboutPanel.classList.remove('is-open');
    aboutPanel.setAttribute('aria-hidden', 'true');
  }

  function toggleAboutPanel() {
    if (aboutPanel.classList.contains('is-open')) {
      closeAboutPanel();
    } else {
      openAboutPanel();
    }
  }

  aboutButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAboutPanel();
  });

  aboutClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closeAboutPanel();
  });

  aboutPanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', () => {
    closeAboutPanel();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAboutPanel();
    }
  });
}

const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  ScrollTrigger.create({
    trigger: '.contact',
    start: 'top 80px',
    end: 'bottom top',
    onEnter: () => siteHeader.classList.add('on-dark'),
    onEnterBack: () => siteHeader.classList.add('on-dark'),
    onLeave: () => siteHeader.classList.remove('on-dark'),
    onLeaveBack: () => siteHeader.classList.remove('on-dark'),
  });
}

requestAnimationFrame(() => {
  document.body.classList.remove('is-loading');
});

const scrollCue = document.querySelector('.scroll-cue');

if (scrollCue) {
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: '20% top',
    onLeave: () => scrollCue.classList.add('is-hidden'),
    onEnterBack: () => scrollCue.classList.remove('is-hidden'),
  });
}

animate();