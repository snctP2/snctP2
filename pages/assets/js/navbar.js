const navbar = document.getElementById("nav-bar");
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
  const shouldBeScrolled = window.scrollY > 10;
  navbar.classList.toggle("scrolled", shouldBeScrolled);
  ticking = false;
}

window.addEventListener("scroll", () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
});
