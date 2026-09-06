document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const noProducts = document.getElementById('no-products');
  const countSpan = document.getElementById('product-count');
  const isHomepage = document.body.dataset.page === 'home';

  // Filter Dropdown Elements
  const brandSelect = document.getElementById('filter-brand');
  const feelSelect = document.getElementById('filter-feel');
  const typeSelect = document.getElementById('filter-type');
  const resetBtn = document.getElementById('filter-reset-btn');

  let products = [];

  // Map brands to their graphic assets
  const brandLogos = {
    'Stearns & Foster': 'img/brands/stearnsfoster.svg',
    'Stearns and Foster': 'img/brands/stearnsfoster.svg',
    'Tempur-Pedic': 'img/brands/tempur-pedic.svg',
    'Tempurpedic': 'img/brands/tempur-pedic.svg',
    'Sealy': 'img/brands/sealy.svg',
    'Heritage Sleep USA': 'img/brands/heritagesleep.png',
    'Heritage Sleep': 'img/brands/heritagesleep.png',
    'Heritage': 'img/brands/heritagesleep.png'
  };

  // Select the appropriate brand logo based on product details
  function getProductLogo(p) {
    if (!p.brand) return null;
    const brandClean = p.brand.trim().toLowerCase();

    // MLILY logic: Essentials gets mlily.png, all other models get mlily-white.png
    if (brandClean.includes('mlily')) {
      const isEssentials = (p.title && p.title.toLowerCase().includes('essentials')) || 
                           (p.id && p.id.toLowerCase().includes('essentials'));
      return isEssentials ? 'img/brands/mlily.png' : 'img/brands/mlily-white.png';
    }

    if (brandLogos[p.brand]) return brandLogos[p.brand];

    if (brandClean.includes('stearns')) return 'img/brands/stearnsfoster.svg';
    if (brandClean.includes('tempur')) return 'img/brands/tempur-pedic.svg';
    if (brandClean.includes('sealy')) return 'img/brands/sealy.svg';
    if (brandClean.includes('heritage')) return 'img/brands/heritagesleep.png';

    return null;
  }

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

    if (countSpan) {
      countSpan.textContent = items.length;
    }

    if (!items.length) {
      grid.innerHTML = '';
      if (noProducts) noProducts.classList.remove('d-none');
      return;
    }

    if (noProducts) noProducts.classList.add('d-none');

    const colClass = isHomepage 
      ? 'col-12 col-md-6 col-lg-4' 
      : 'col-12 col-md-6 col-lg-4 col-xl-3';

    grid.innerHTML = items.map(p => {
      const tagHtml = p.tag 
        ? `<span class="product-tag ${p.tag.toLowerCase() === 'cooling' ? 'tag-accent' : ''}">${p.tag}</span>` 
        : '';

      const logoSrc = getProductLogo(p);
      const logoBadgeHtml = logoSrc 
        ? `<div class="product-brand-badge"><img src="${logoSrc}" alt="${p.brand} logo" class="brand-badge-img"></div>` 
        : '';

      return `
        <div class="${colClass}">
          <div class="product-card">
            ${tagHtml}
            <div class="product-img-wrap">
              <img src="${p.image}" alt="${p.brand} ${p.title}" class="product-img" loading="lazy">
              ${logoBadgeHtml}
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

  // Combined Multi-Select Filter Logic
  function applyFilters() {
    if (!brandSelect || !feelSelect || !typeSelect) return;

    const selectedBrand = brandSelect.value;
    const selectedFeel = feelSelect.value;
    const selectedType = typeSelect.value;

    const isFiltered = selectedBrand !== 'all' || selectedFeel !== 'all' || selectedType !== 'all';

    if (resetBtn) {
      if (isFiltered) {
        resetBtn.classList.remove('d-none');
      } else {
        resetBtn.classList.add('d-none');
      }
    }

    const filtered = products.filter(p => {
      const matchesBrand = selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
      const matchesFeel = selectedFeel === 'all' || (p.feel && p.feel.toLowerCase() === selectedFeel.toLowerCase());
      const matchesType = selectedType === 'all' || (p.type && p.type.toLowerCase() === selectedType.toLowerCase());

      return matchesBrand && matchesFeel && matchesType;
    });

    renderProducts(filtered);
  }

  // Event Listeners for Filters
  if (brandSelect) brandSelect.addEventListener('change', applyFilters);
  if (feelSelect) feelSelect.addEventListener('change', applyFilters);
  if (typeSelect) typeSelect.addEventListener('change', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      brandSelect.value = 'all';
      feelSelect.value = 'all';
      typeSelect.value = 'all';
      applyFilters();
    });
  }
});