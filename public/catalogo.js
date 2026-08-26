// Catalog: filters + navigation to /productos/<slug>. No modal.
document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');
      filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
      this.classList.add('active');
      productCards.forEach(function (card) {
        const category = card.getAttribute('data-category');
        const show = filter === 'all' || category === filter;
        card.style.display = show ? 'flex' : 'none';
      });
    });
  });
});
