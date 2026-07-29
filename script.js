let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const total = slides.length;

const modelNames = [
    { name: '911 Turbo 991', year: '2014' },
    { name: '911 930 Turbo', year: '1975' },
    { name: '930 911 Turbo 3.3', year: '1982' }
];

const modelNameEl = document.querySelector('.model-name');
const modelIndexEl = document.querySelector('.model-index');

function updateCaption() {
    if (!modelNameEl || !modelIndexEl) return;
    modelNameEl.textContent = modelNames[currentSlide].name;
    modelIndexEl.textContent = `0${currentSlide + 1} / 0${total}`;
}

function setInitialClasses() {
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'next', 'prev');
        if (i === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.add('next'); // остальные ждут справа
        }
    });
    updateCaption();
}

function changeSlide(direction) {
    const prevIndex = currentSlide;
    currentSlide = (currentSlide + direction + total) % total;

    if (direction === 1) {
        // нажали "вправо" -> текущая уезжает влево, новая заезжает справа
        slides[prevIndex].classList.remove('active');
        slides[prevIndex].classList.add('prev');

        slides[currentSlide].classList.remove('next', 'prev');
        slides[currentSlide].style.transition = 'none';
        slides[currentSlide].classList.add('next');
        void slides[currentSlide].offsetWidth; // форсируем reflow
        slides[currentSlide].style.transition = '';
        slides[currentSlide].classList.remove('next');
        slides[currentSlide].classList.add('active');
    } else {
        // нажали "влево" -> текущая уезжает вправо, новая заезжает слева
        slides[prevIndex].classList.remove('active');
        slides[prevIndex].classList.add('next');

        slides[currentSlide].classList.remove('next', 'prev');
        slides[currentSlide].style.transition = 'none';
        slides[currentSlide].classList.add('prev');
        void slides[currentSlide].offsetWidth;
        slides[currentSlide].style.transition = '';
        slides[currentSlide].classList.remove('prev');
        slides[currentSlide].classList.add('active');
    }

    updateCaption();
}

setInitialClasses();

/* -------------------------------------------------------------
   Scroll effect: as the user scrolls from the hero (.slider)
   down toward the "about" section, the active 3D model drifts
   toward the second section (shifts down/sideways, shrinks a
   little and fades) while slowly rotating on its axis.
   Fully driven by scroll position, no external libraries.
-------------------------------------------------------------- */

const track = document.querySelector('.slider-track');
const heroSection = document.querySelector('.slider');
const BASE_THETA = 90; // matches the initial camera-orbit value in the HTML
const MAX_ROTATION = 70; // degrees added over the course of the scroll
const MAX_SHIFT_Y_VH = 35; // how far (in vh) the car drifts down toward section 2
const MAX_SHIFT_X_VW = 12; // slight horizontal drift
const MIN_SCALE = 0.62;

let ticking = false;

function updateScrollEffect() {
    ticking = false;

    const heroHeight = heroSection.offsetHeight || window.innerHeight;
    // progress: 0 at top of page, 1 once scrolled one full hero-height down
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

    // eased progress for a slightly smoother, non-linear feel
    const eased = progress * progress * (3 - 2 * progress); // smoothstep

    const shiftY = eased * MAX_SHIFT_Y_VH;
    const shiftX = eased * MAX_SHIFT_X_VW;
    const scale = 1 - eased * (1 - MIN_SCALE);
    const opacity = 1 - eased * 0.55;

    if (track) {
        track.style.transform =
            `translate3d(${shiftX}vw, ${shiftY}vh, 0) scale(${scale})`;
        track.style.opacity = opacity;
        // let clicks pass through to the about section once mostly faded
        track.style.pointerEvents = eased > 0.8 ? 'none' : 'auto';
    }

    const activeSlide = slides[currentSlide];
    if (activeSlide) {
        const theta = BASE_THETA + eased * MAX_ROTATION;
        activeSlide.cameraOrbit = `${theta}deg 90deg 105%`;
    }

    // fade the scroll hint out quickly since it's only relevant at the very top
    const hint = document.querySelector('.scroll-hint');
    if (hint) {
        hint.style.opacity = Math.max(0, 0.6 - progress * 2);
    }
}

function onScroll() {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffect);
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
updateScrollEffect();