import './style.css';

// --- CUSTOM CURSOR ---
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// --- FOOTER HUBBLE ULTRA DEEP FIELD CANVAS ---
const canvas = document.getElementById('footerStars');
const ctx = canvas.getContext('2d', { alpha: false });
let galaxies = [];
let stars = [];
let lensingEvents = [];
let comets = [];
let footerWidth, footerHeight;
let dpr = window.devicePixelRatio || 1;
let lastCometTime = 0;

class Galaxy {
    constructor(type) {
        this.type = type; // elliptical, spiral, edge-on, irregular
        this.init();
    }

    init() {
        // Denser toward the center
        const r = Math.pow(Math.random(), 0.7) * (Math.max(footerWidth, footerHeight) / 1.5);
        const theta = Math.random() * Math.PI * 2;
        this.x = footerWidth/2 + r * Math.cos(theta);
        this.y = footerHeight/2 + r * Math.sin(theta);
        
        this.size = 1 + Math.random() * 5;
        if (this.type === 'spiral') this.size *= 1.4;
        
        this.angle = Math.random() * Math.PI * 2;
        this.driftX = (Math.random() - 0.5) * 0.02;
        this.driftY = (Math.random() - 0.5) * 0.02;
        
        this.cycle = Math.random() * 1000;
        this.cycleSpeed = 0.0005 + Math.random() * 0.0015;
        this.baseAlpha = 0.2 + Math.random() * 0.6;

        // Color mapping
        switch(this.type) {
            case 'elliptical': this.color = '#FFE4B8'; break;
            case 'spiral': this.color = '#D8ECFF'; break;
            case 'edge-on': this.color = '#F8F4EE'; break;
            case 'irregular': this.color = '#FF8C50'; break;
        }
    }

    update() {
        this.x += this.driftX;
        this.y += this.driftY;
        this.cycle += this.cycleSpeed;
        this.currentAlpha = this.baseAlpha * (0.8 + Math.sin(this.cycle) * 0.2);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.currentAlpha;
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(0.4, this.color + '66');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;

        if (this.type === 'elliptical') {
            ctx.scale(1.2, 0.8);
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'spiral') {
            // Core
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Faint Disk
            ctx.globalAlpha *= 0.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'edge-on') {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 3, this.size * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'irregular') {
            ctx.beginPath();
            ctx.moveTo(-this.size, -this.size * 0.3);
            ctx.lineTo(this.size * 0.4, -this.size * 0.8);
            ctx.lineTo(this.size, this.size * 0.2);
            ctx.lineTo(-this.size * 0.2, this.size * 0.6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

class LensingEvent {
    constructor() {
        this.x = Math.random() * footerWidth;
        this.y = Math.random() * footerHeight;
        this.radius = 0;
        this.maxRadius = 100 + Math.random() * 200;
        this.life = 1.0;
        this.speed = 0.5 + Math.random() * 1.0;
    }
    update() {
        this.radius += this.speed;
        this.life -= 0.005;
    }
    draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Comet {
    constructor() {
        const side = Math.random() > 0.5;
        if(side) {
            this.x = -100;
            this.y = Math.random() * footerHeight * 0.5;
            this.vx = 0.4 + Math.random() * 0.3;
            this.vy = 0.2 + Math.random() * 0.2;
        } else {
            this.x = footerWidth + 100;
            this.y = Math.random() * footerHeight * 0.5;
            this.vx = -(0.4 + Math.random() * 0.3);
            this.vy = 0.2 + Math.random() * 0.2;
        }
        this.angle = Math.atan2(this.vy, this.vx);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI); // Tail points away from direction

        // 1. Dust Tail (Curved, pale yellow-white)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(40, 10, 80, 20, 120, 5);
        ctx.bezierCurveTo(80, 30, 40, 15, 0, 0);
        const dustGrad = ctx.createLinearGradient(0, 0, 120, 0);
        dustGrad.addColorStop(0, 'rgba(255, 250, 230, 0.3)');
        dustGrad.addColorStop(1, 'rgba(255, 250, 230, 0)');
        ctx.fillStyle = dustGrad;
        ctx.fill();

        // 2. Ion Tail (Straight, thin, blue-white)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(150, 0);
        const ionGrad = ctx.createLinearGradient(0, 0, 150, 0);
        ionGrad.addColorStop(0, 'rgba(177, 197, 255, 0.4)');
        ionGrad.addColorStop(1, 'rgba(177, 197, 255, 0)');
        ctx.strokeStyle = ionGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Coma (Soft blue-white halo)
        const comaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        comaGrad.addColorStop(0, 'rgba(177, 197, 255, 0.6)');
        comaGrad.addColorStop(1, 'rgba(177, 197, 255, 0)');
        ctx.fillStyle = comaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // 4. Nucleus (Small white core)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    isOffscreen() {
        return this.x < -200 || this.x > footerWidth + 200 || this.y > footerHeight + 200;
    }
}

class TwinklingStar {
    constructor() {
        this.x = Math.random() * footerWidth;
        this.y = Math.random() * footerHeight;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseColor = Math.random() > 0.5 ? '#D8ECFF' : '#FFE4B8';
        this.alpha = Math.random();
        this.alphaSpeed = (Math.random() * 0.02) + 0.005;
        this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.alpha += this.alphaSpeed * this.direction;
        if (this.alpha >= 1) {
            this.alpha = 1;
            this.direction = -1;
        } else if (this.alpha <= 0.1) {
            this.alpha = 0.1;
            this.direction = 1;
            this.x = Math.random() * footerWidth;
            this.y = Math.random() * footerHeight;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = this.alpha * 0.4;
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = this.baseColor;
        ctx.fill();
        
        ctx.restore();
    }
}

function initHubbleField() {
    const rect = canvas.parentNode.getBoundingClientRect();
    footerWidth = rect.width * dpr;
    footerHeight = rect.height * dpr;
    canvas.width = footerWidth;
    canvas.height = footerHeight;
    ctx.scale(dpr, dpr);
    footerWidth /= dpr;
    footerHeight /= dpr;
    
    galaxies = [];
    // Elliptical (160)
    for(let i=0; i<160; i++) galaxies.push(new Galaxy('elliptical'));
    // Spiral (110)
    for(let i=0; i<110; i++) galaxies.push(new Galaxy('spiral'));
    // Edge-on (80)
    for(let i=0; i<80; i++) galaxies.push(new Galaxy('edge-on'));
    // Irregular (70)
    for(let i=0; i<70; i++) galaxies.push(new Galaxy('irregular'));

    galaxies.sort((a, b) => a.size - b.size);

    stars = [];
    for(let i=0; i<200; i++) {
        stars.push(new TwinklingStar());
    }
}

let frame = 0;
function renderHubble(timestamp) {
    frame++;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, footerWidth, footerHeight);

    galaxies.forEach(g => {
        g.update();
        g.draw();
    });

    // Lensing Logic
    if (frame % 3000 === 0 || (frame === 100)) { 
        lensingEvents.push(new LensingEvent());
    }
    lensingEvents = lensingEvents.filter(e => e.life > 0);
    lensingEvents.forEach(e => {
        e.update();
        e.draw();
    });

    // Comet Logic
    const currentTime = timestamp || 0;
    if (currentTime - lastCometTime > (8 + Math.random() * 12) * 1000) {
        comets.push(new Comet());
        lastCometTime = currentTime;
    }
    comets = comets.filter(c => !c.isOffscreen());
    comets.forEach(c => {
        c.update();
        c.draw();
    });

    // Draw twinkling stars
    stars.forEach(s => {
        s.update();
        s.draw();
    });

    requestAnimationFrame(renderHubble);
}

window.addEventListener('resize', initHubbleField);
initHubbleField();
renderHubble();

// --- MAGNETIC BUTTONS ---
document.querySelectorAll('.magnetic-wrap').forEach(wrap => {
    wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        wrap.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
    });
    wrap.addEventListener('mouseleave', () => {
        wrap.style.transform = `translate(0, 0)`;
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
    });
});

// --- TILT EFFECT ---
document.querySelectorAll('.tilt-card').forEach(card => {
    const inner = card.querySelector('.tilt-inner');
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 10;
        const rotateY = (rect.width / 2 - x) / 10;
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        inner.style.transform = `rotateX(0) rotateY(0)`;
    });
});

// --- INTERSECTION OBSERVER (REVEAL) ---
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if (entry.target.classList.contains('scramble-text')) {
                scrambleText(entry.target);
            }
            if (entry.target.querySelector('.counter')) {
                startCounters(entry.target);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-up, .scramble-text').forEach(el => observer.observe(el));

// --- TEXT SCRAMBLE ---
function scrambleText(el) {
    const originalText = el.getAttribute('data-text') || el.innerText;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()';
    let iteration = 0;
    const interval = setInterval(() => {
        el.innerText = originalText.split('').map((char, index) => {
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iteration >= originalText.length) clearInterval(interval);
        iteration += 1 / 3;
    }, 30);
}

// --- COUNTERS ---
function startCounters(container) {
    container.querySelectorAll('.counter').forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentVal = (progress * target).toFixed(target % 1 === 0 ? 0 : 1);
            counter.innerText = currentVal;
            if (progress < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    });
}

// --- PARALLAX ---
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    document.querySelectorAll('.parallax-bg').forEach(bg => {
        const speed = bg.getAttribute('data-speed');
        bg.style.transform = `translateY(${scroll * speed}px)`;
    });

    // Horizontal progress
    const hContainer = document.querySelector('.horizontal-container');
    const progress = document.getElementById('scroll-progress');
    if (hContainer && progress) {
        const rect = hContainer.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const scrollPct = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            progress.style.width = `${scrollPct * 100}%`;
            hContainer.scrollLeft = (scrollPct * (hContainer.scrollWidth - hContainer.clientWidth));
        }
    }
});

// --- DRAGGABLE ORRERY ---
const orrery = document.getElementById('orrery');
const readout = document.getElementById('vector-readout');
let isDown = false;
let startX, startY;

orrery.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - orrery.offsetLeft;
    startY = e.pageY - orrery.offsetTop;
});

orrery.addEventListener('mouseleave', () => isDown = false);
orrery.addEventListener('mouseup', () => isDown = false);

orrery.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - orrery.offsetLeft;
    const y = e.pageY - orrery.offsetTop;
    const moveX = (x - startX) * 0.5;
    const moveY = (y - startY) * 0.5;
    const img = orrery.querySelector('img');
    img.style.transform = `translate(${-10 + moveX / 10}%, ${-10 + moveY / 10}%) scale(1.1)`;
    
    // Update HUD readout
    const fakeX = (284.22 + moveX / 5).toFixed(2);
    const fakeY = (119.04 + moveY / 5).toFixed(2);
    readout.innerText = `X: ${fakeX} // Y: ${fakeY}`;
});

// --- MOBILE MENU TOGGLE ---
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu() {
    if (!mobileMenu) return;
    const isExpanded = mobileMenu.classList.contains('opacity-100');
    if (isExpanded) {
        mobileMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        mobileMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-8');
        if (menuIcon) menuIcon.innerText = 'menu';
    } else {
        mobileMenu.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-8');
        mobileMenu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
        if (menuIcon) menuIcon.innerText = 'close';
    }
}

if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

// --- TOAST NOTIFICATIONS ---
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'stellaris-toast';
    toast.innerHTML = `<span style="color: #b1c5ff;">></span> ${message}`;
    toastContainer.appendChild(toast);
    
    // Trigger reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3000);
}

// Action Buttons
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = btn.getAttribute('data-action') || 'ACTION REGISTERED';
        showToast(msg);
    });
});

// Contact Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('COMMUNIQUE TRANSMITTED');
        contactForm.reset();
    });
}
