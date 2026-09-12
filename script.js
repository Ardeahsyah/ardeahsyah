const pages = document.querySelectorAll('.page');
const links = document.querySelectorAll('.nav-link');
const menu = document.getElementById('navLinks');


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.remove('active');
  });

  const target =
    document.getElementById(pageId) ||
    document.getElementById('profile');

  target.classList.add('active');

  links.forEach((link) => {
    link.classList.toggle(
      'active',
      link.dataset.page === pageId
    );
  });

  menu.classList.remove('open');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


links.forEach((link) => {
  link.addEventListener('click', function (e) {

    const page = this.dataset.page;

    if (page) {
      e.preventDefault();

      history.pushState(
        null,
        '',
        '#' + page
      );

      showPage(page);
    }

  });
});


window.addEventListener('load', () => {

  const initial =
    location.hash.replace('#', '') ||
    'profile';

  showPage(initial);

});


window.addEventListener('popstate', () => {

  const page =
    location.hash.replace('#', '') ||
    'profile';

  showPage(page);

});


/* =========================================================
   MOBILE MENU
========================================================= */

document
  .getElementById('menuToggle')
  .addEventListener('click', () => {

    menu.classList.toggle('open');

  });


/* =========================================================
   THEME TOGGLE
========================================================= */

document
  .getElementById('themeToggle')
  .addEventListener('click', () => {

    document.body.classList.toggle('light');

  });


/* =========================================================
   EXECUTIVE PROFILE TYPING EFFECT
========================================================= */

const heroText = `Enterprise Process Excellence Leader with a proven track record of driving large-scale transformation, operational excellence and performance improvement across complex, multi-business environments spanning financial services, e-commerce, manufacturing and aviation. Proven ability to translate business strategy into measurable improvements in productivity, cost efficiency, service quality, customer experience, operational resilience and governance.

Experienced in leading enterprise process transformation, operating model and workflow redesign, Lean Six Sigma, digitalisation, automation, AI and data-driven performance management. Proven ability to establish transformation governance, lead cross-functional and regional initiatives, strengthen KPI and performance management, and partner with senior leadership to deliver sustainable business outcomes.

Combines strategic transformation leadership with deep hands-on expertise in process improvement and structured problem solving, with a track record of eliminating waste, reducing process variation, improving turnaround time, strengthening quality and controls, and building continuous improvement capabilities. Brings a customer-centric and data-driven approach to transforming complex operations, with the ability to translate improvement opportunities into scalable solutions that enhance stakeholder value and organisational performance.`;

let typeIndex = 0;

const typingTarget =
  document.getElementById('typingText');


function typeWriter() {

  if (!typingTarget) return;

  if (typeIndex < heroText.length) {

    typingTarget.textContent +=
      heroText.charAt(typeIndex);

    typeIndex++;

    setTimeout(typeWriter, 8);

  }

}


typeWriter();


/* =========================================================
   CONTACT FORM
========================================================= */

function sendMessage(event) {

  event.preventDefault();

  const name =
    document.getElementById('name').value;

  const email =
    document.getElementById('email').value;

  const message =
    document.getElementById('message').value;


  const subject = encodeURIComponent(
    'Website Enquiry from ' + name
  );


  const body = encodeURIComponent(
    `Name: ${name}
Email: ${email}

Message:
${message}`
  );


  window.location.href =
    'mailto:ardeahsyah@gmail.com' +
    '?subject=' + subject +
    '&body=' + body;

}
