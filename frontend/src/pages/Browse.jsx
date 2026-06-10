import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../api';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import '../style/Browse.css';

function BrowseProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="bp-card">
      <div className="bp-card__img-wrap">
        <img src={product.image_url} alt={product.name} className="bp-card__img" />
        {product.badge && (
          <span className={`bp-card__badge ${product.badge.startsWith('-') ? 'bp-badge--sale' : 'bp-badge--fresh'}`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="bp-card__body">
        <h3 className="bp-card__name">{product.name}</h3>
        <p className="bp-card__unit">{product.unit}</p>
        <div className="bp-card__footer">
          <span className="bp-card__price">₹{product.price}</span>
          <button
            onClick={handleAdd}
            className={`bp-btn-add ${added ? 'bp-btn-add--done' : ''}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <span className="material-symbols-outlined">{added ? 'check' : 'add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className="browse-empty">
      <span className="material-symbols-outlined browse-empty__icon">search_off</span>
      <p className="browse-empty__title">No results found</p>
      <p className="browse-empty__sub">
        {search ? `Nothing matched "${search}". Try a different keyword.` : 'No products in this category yet.'}
      </p>
    </div>
  );
}

export default function Browse() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();

  useEffect(() => {
    productAPI.categories().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    const cat = searchParams.get('category') || (activeFilter !== 'all' ? activeFilter : null);
    if (cat) params.category = cat;
    productAPI.list(params).then(r => {
      setProducts(r.data.results || r.data);
      setLoading(false);
    });
  }, [search, activeFilter, searchParams]);

  const filters = [{ key: 'all', label: 'All' }, ...categories.map(c => ({ key: c.slug, label: c.name }))];

  return (
    <Layout>
      <div className="browse">

        {/* ── Header ── */}
        <header className="browse__header">
          <h1 className="browse__title">Browse</h1>
          <p className="browse__sub">Fresh picks, every day</p>
        </header>

        {/* ── Search ── */}
        <div className="browse-search">
          <span className="material-symbols-outlined browse-search__icon">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for groceries…"
            className="browse-search__input"
          />
          {search && (
            <button className="browse-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* ── Filter chips ── */}
        <div className="browse-filters no-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`browse-chip ${activeFilter === f.key ? 'browse-chip--active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        <div className="browse-meta">
          {loading ? (
            <span className="browse-meta__loading">
              <span className="browse-meta__dot" />
              <span className="browse-meta__dot" />
              <span className="browse-meta__dot" />
            </span>
          ) : (
            <span className="browse-meta__count">
              {products.length} {products.length === 1 ? 'item' : 'items'} found
            </span>
          )}
        </div>

        {/* ── Product grid / skeleton / empty ── */}
        {loading ? (
          <div className="browse-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bp-skeleton">
                <div className="bp-skeleton__img" />
                <div className="bp-skeleton__body">
                  <div className="bp-skeleton__line bp-skeleton__line--long" />
                  <div className="bp-skeleton__line bp-skeleton__line--short" />
                  <div className="bp-skeleton__line bp-skeleton__line--med" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="browse-grid">
            {products.map(p => (
              <BrowseProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}