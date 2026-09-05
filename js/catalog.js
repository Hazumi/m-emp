document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const noProducts = document.getElementById('no-products');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const isHomepage = document.body.dataset.page === 'home';
  let products = [];

  // Group items by brand and randomize brand order
  function shuffleBrandGroups(items) {
    const groups = items.reduce((acc, item) => {
      const brand = item.brand || 'Other';
      if (!acc[brand]) acc[brand] = [];
      acc[brand].push(item);
      return acc;
    }, {});

    const brands = Object.keys(groups);
    for (let i = brands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [brands[i], brands[j]] = [brands[j], brands[i]];
    }

    return brands.flatMap(brand => groups[brand]);
  }

  fetch('data/products.json')
    .then(res => {
      if (!res.ok) throw new Error('Network error loading products');
      return res.json();
    })
    .then(data => {
      // Keep brands grouped, but randomize which brand leads
      products = shuffleBrandGroups(data);

      if (isHomepage) {
        const featured = products.filter(p => p.featured);
        renderProducts(featured.length ? featured : products.slice(0, 3));

        // Re-scroll down to the anchor (e.g. #locations) after products finish loading
        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) {
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
          }
        }
      } else {
        renderProducts(products);
      }
    })
    .catch(err => {
      console.error('Failed to load products:', err);
      if (grid) {
        grid.innerHTML = `<div class="col-12 text-center text-slate-400 py-4">Unable to load inventory. Please call us at (910) 399-1552.</div>`;
      }
    });

  function renderProducts(items) {
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = '';
      if (noProducts) noProducts.classList.remove('d-none');
      return;
    }

    if (noProducts) noProducts.classList.add('d-none');

    // Homepage keeps 3-across (col-lg-4), Catalog page uses 4-across (col-xl-3)
    const colClass = isHomepage 
      ? 'col-12 col-md-6 col-lg-4' 
      : 'col-12 col-md-6 col-lg-4 col-xl-3';

    grid.innerHTML = items.map(p => {
      const tagHtml = p.tag 
        ? `<span class="product-tag ${p.tag.toLowerCase() === 'cooling' ? 'tag-accent' : ''}">${p.tag}</span>` 
        : '';

      return `
        <div class="${colClass}">
          <div class="product-card">
            ${tagHtml}
            <div class="product-img-wrap">
              <img src="${p.image}" alt="${p.brand} ${p.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-body">
              <span class="product-brand">${p.brand}</span>
              <h3 class="product-title">${p.title}</h3>
              
              <div class="product-specs mb-3">
                <span><i class="fas fa-layer-group"></i> ${p.type}</span>
                <span><i class="fas fa-adjust"></i> ${p.feel} Feel</span>
              </div>

              <div class="product-footer mt-auto">
                <div class="showroom-status">
                  <span class="pulse-dot"></span>
                  <span class="status-label">In Showroom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter Buttons
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        if (filterValue === 'all') {
          renderProducts(products);
        } else {
          const [key, val] = filterValue.split(':');
          const filtered = products.filter(p => p[key] && p[key].toLowerCase() === val.toLowerCase());
          renderProducts(filtered);
        }
      });
    });
  }
});