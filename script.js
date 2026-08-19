// Header krijgt achtergrond zodra je scrollt
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobiel menu openen/sluiten
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
});
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
  })
);

// Scroll-reveal animaties
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Logo-marquee: dupliceer de rij zodat hij naadloos doorloopt.
// Werkt met willekeurig hoeveel logo's; de snelheid schaalt mee met de breedte.
const logoRow = document.querySelector('.logo-marquee .logo-row');
if (logoRow && logoRow.children.length) {
  const originals = Array.from(logoRow.children);

  const appendSet = () =>
    originals.forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute('data-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((img) => (img.alt = ''));
      logoRow.appendChild(clone);
    });

  const build = () => {
    logoRow.querySelectorAll('[data-clone]').forEach((el) => el.remove());
    // Klasse eerst: pas met nowrap meten we de echte striplengte in plaats van
    // de containerbreedte waar de rij anders overheen wrapt.
    logoRow.classList.add('is-marquee');

    // Eén set moet samen met zijn kopie breder zijn dan het scherm, anders
    // ontstaat er een gat als de strip halverwege terugspringt.
    const oneSet = logoRow.scrollWidth;
    const perHalf = oneSet > 0 ? Math.max(1, Math.ceil(window.innerWidth / oneSet)) : 2;

    // De animatie schuift precies -50%, dus de tweede helft is een exacte kopie.
    for (let i = 1; i < perHalf * 2; i++) appendSet();

    // ~45px per seconde: rustig, maar duidelijk in beweging.
    const halfWidth = logoRow.scrollWidth / 2;
    logoRow.style.setProperty('--marquee-duration', `${Math.max(18, Math.round(halfWidth / 45))}s`);
  };

  // Pas opbouwen als de logo's echt geladen zijn, anders meten we breedte 0
  // en wordt de animatie veel te snel.
  const images = originals.flatMap((el) => Array.from(el.querySelectorAll('img')));
  const ready = images.map(
    (img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          })
  );

  Promise.all(ready).then(build);
  // Vangnet: als er iets misgaat met de load-events, alsnog opbouwen.
  window.addEventListener('load', () => setTimeout(build, 100));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 250);
  });
}

// Jaartal in de footer
document.getElementById('year').textContent = new Date().getFullYear();
