const canvas = document.querySelector("#system-canvas");
const context = canvas.getContext("2d");

let width = 0;
let height = 0;
let nodes = [];
let animationFrame = 0;

const palette = ["#164b3d", "#0f766e", "#b54d36", "#244c79", "#c08a2d"];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(22, Math.floor(width / 44));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: width * (0.52 + Math.random() * 0.48),
    y: Math.random() * height,
    radius: 2 + Math.random() * 3.5,
    speed: 0.18 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    color: palette[index % palette.length],
  }));
}

function draw() {
  context.clearRect(0, 0, width, height);
  context.lineWidth = 1;

  nodes.forEach((node, index) => {
    node.y += node.speed;
    node.x += Math.sin(animationFrame / 80 + node.phase) * 0.18;

    if (node.y > height + 20) {
      node.y = -20;
      node.x = width * (0.52 + Math.random() * 0.48);
    }

    for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
      const nextNode = nodes[nextIndex];
      const distance = Math.hypot(node.x - nextNode.x, node.y - nextNode.y);

      if (distance < 155) {
        context.strokeStyle = `rgba(23, 33, 29, ${0.07 * (1 - distance / 155)})`;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(nextNode.x, nextNode.y);
        context.stroke();
      }
    }

    context.fillStyle = node.color;
    context.globalAlpha = 0.48;
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  });

  animationFrame += 1;
  requestAnimationFrame(draw);
}

resizeCanvas();
draw();

window.addEventListener("resize", resizeCanvas);

const navLinks = Array.from(document.querySelectorAll("[data-nav-section]"));
const trackedSections = navLinks
  .map((link) => document.getElementById(link.dataset.navSection))
  .filter(Boolean);
let suppressScrollActiveUntil = 0;

function setActiveSection(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.navSection === sectionId;
    link.className = isActive ? "is-active" : "";
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveSection() {
  if (Date.now() < suppressScrollActiveUntil) {
    return;
  }

  const headerOffset = 120;
  const currentSection = trackedSections.reduce((current, section) => {
    const top = section.getBoundingClientRect().top - headerOffset;
    return top <= 0 ? section : current;
  }, trackedSections[0]);

  if (currentSection) {
    setActiveSection(currentSection.id);
  }
}

function setActiveSectionFromHash() {
  const hashId = window.location.hash.slice(1);
  if (trackedSections.some((section) => section.id === hashId)) {
    suppressScrollActiveUntil = Date.now() + 900;
    setActiveSection(hashId);
    return true;
  }

  return false;
}

if (trackedSections.length > 0) {
  if (!setActiveSectionFromHash()) {
    updateActiveSection();
  } else {
    window.setTimeout(setActiveSectionFromHash, 250);
  }
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("hashchange", () => {
    setActiveSectionFromHash();
    window.setTimeout(setActiveSectionFromHash, 250);
  });
}
