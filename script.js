const pages = document.querySelectorAll('.page');
const links = document.querySelectorAll('.nav-link');
const menu = document.getElementById('navLinks');

function showPage(pageId) {
  pages.forEach((page) => page.classList.remove('active'));
  const target = document.getElementById(pageId) || document.getElementById('home');
  target.classList.add('active');

  links.forEach((link) => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  menu.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(runAnimations, 200);
}

links.forEach((link) => {
  link.addEventListener('click', function (e) {
    const page = this.dataset.page;
    if (page) {
      e.preventDefault();
      history.pushState(null, '', '#' + page);
      showPage(page);
    }
  });
});

window.addEventListener('load', () => {
  const initial = location.hash.replace('#', '') || 'home';
  showPage(initial);
});

window.addEventListener('popstate', () => {
  const page = location.hash.replace('#', '') || 'home';
  showPage(page);
});

document.getElementById('menuToggle').addEventListener('click', () => {
  menu.classList.toggle('open');
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
});

const heroText =
  'Driving enterprise transformation through Artificial Intelligence, Lean Six Sigma, Agile execution, Power Platform automation and data-driven operational excellence.';

let typeIndex = 0;
const typingTarget = document.getElementById('typingText');

function typeWriter() {
  if (!typingTarget) return;
  if (typeIndex < heroText.length) {
    typingTarget.innerHTML += heroText.charAt(typeIndex);
    typeIndex++;
    setTimeout(typeWriter, 28);
  }
}

typeWriter();

function animateCounter(el) {
  if (el.dataset.done === 'true') return;

  const target = Number(el.dataset.count);
  if (!target) return;

  let current = 0;
  const increment = Math.ceil(target / 55);

  const timer = setInterval(() => {
    current += increment;

    if (current >= target) {
      current = target;
      clearInterval(timer);
      el.dataset.done = 'true';
    }

    el.innerText = current + (target === 37 || target === 94 || target === 95 || target === 85 ? '%' : '+');
  }, 24);
}

function animateBars() {
  document.querySelectorAll('.fill').forEach((fill) => {
    const width = fill.dataset.width;
    if (width) {
      fill.style.width = width;
    }
  });
}

function runAnimations() {
  document.querySelectorAll('[data-count]').forEach(animateCounter);
  animateBars();
}

function sendMessage(event) {
  event.preventDefault();

  const name = encodeURIComponent(document.getElementById('name').value);
  const email = encodeURIComponent(document.getElementById('email').value);
  const message = encodeURIComponent(document.getElementById('message').value);

  const subject = encodeURIComponent('Website Enquiry from ' + decodeURIComponent(name));
  const body = encodeURIComponent(
    'Name: ' + decodeURIComponent(name) + '\n' +
    'Email: ' + decodeURIComponent(email) + '\n\n' +
    decodeURIComponent(message)
  );

  window.location.href = 'mailto:ardeahsyah@gmail.com?subject=' + subject + '&body=' + body;
}
