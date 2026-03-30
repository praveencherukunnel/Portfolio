const canvas = document.getElementById('dotsCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let dots = [];
// Configuration
const spacing = 15; // The distance between dots
const defaultRadius = .5;
const interactionRadius = 200; // Radius of mouse interaction
const pushAmount = 20; // How far to push dots away
const swirlAmount = 10; // Tangential force for circular movement
const easeAmount = 0.08; // How fast dots move to their target
const mouse = {
    x: -1000,
    y: -1000,
};
// Initialize canvas size
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDots();
}
class Dot {
    constructor(x, y) {
        this.originX = x;
        this.originY = y;
        this.x = x;
        this.y = y;
        this.opacity = 0.2;
        this.radius = defaultRadius;
    }
    update() {
        // Distance between mouse and original dot position
        const dx = mouse.x - this.originX;
        const dy = mouse.y - this.originY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let targetX = this.originX;
        let targetY = this.originY;
        let targetOpacity = 0.15;
        let targetRadius = defaultRadius;
        if (distance < interactionRadius) {
            // Apply forces when near mouse
            const force = (interactionRadius - distance) / interactionRadius; 
            const angle = Math.atan2(dy, dx);
            // Repulsion force (pushing outwards)
            const pushX = Math.cos(angle) * force * pushAmount;
            const pushY = Math.sin(angle) * force * pushAmount;
            // Swirl force (tangential/moving in a circle)
            const swirlX = Math.sin(angle) * force * swirlAmount;
            const swirlY = -Math.cos(angle) * force * swirlAmount;
            // Combine forces to get target position
            targetX = this.originX - pushX - swirlX;
            targetY = this.originY - pushY - swirlY;
            // Brighter and slightly larger when active
            targetOpacity = 0.15 + (force * 0.5); // Up to 1.0 opacity
            targetRadius = defaultRadius + (force * 1.5);
        }
        // Ease position to target (smooth interpolation)
        this.x += (targetX - this.x) * easeAmount;
        this.y += (targetY - this.y) * easeAmount;
        // Base idle movement (subtle breathing effect independent of mouse)
        const time = Date.now() * 0.001;
        const idleX = Math.sin(time + this.originY * 0.05) * 1.5;
        const idleY = Math.cos(time + this.originX * 0.05) * 1.5;
        
        // Ease opacity
        this.opacity += (targetOpacity - this.opacity) * easeAmount;
        this.radius += (targetRadius - this.radius) * easeAmount;
        // Apply idle shift if not severely interacting
        if (distance > interactionRadius) {
            this.x += idleX * 0.05;
            this.y += idleY * 0.05;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}
function initDots() {
    dots = [];
    // Creating extra grid outside screen to account for dot pushing
    for (let x = -spacing; x < width + spacing; x += spacing) {
        for (let y = -spacing; y < height + spacing; y += spacing) {
            dots.push(new Dot(x, y));
        }
    }
}
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].update();
        dots[i].draw();
    }
    requestAnimationFrame(animate);
}
// Event Listeners
window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});
// Reset mouse continuously when not moving if touching screen
window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});
// Setup
resize();
animate();
