import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import '../style/Home.css'

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        <img src={product.image_url} alt={product.name} className="product-card__image" />
        {product.badge && (
          <span className={`product-card__badge ${product.badge.startsWith('-') ? 'badge--sale' : 'badge--fresh'}`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__unit">{product.unit}</p>
        <div className="product-card__footer">
          <span className="product-card__price">₹{product.price}</span>
          <button
            onClick={handleAdd}
            className={`btn-add-round ${added ? 'btn-add-round--added' : ''}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <span className="material-symbols-outlined">{added ? 'check' : 'add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ cat }) {
  return (
    <Link to={`/browse?category=${cat.slug}`} className="category-pill">
      <div className="category-pill__icon">
        <span className="material-symbols-outlined">{cat.icon}</span>
      </div>
      <span className="category-pill__name">{cat.name}</span>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.list({}).then(r => setProducts(r.data.results || r.data));
    productAPI.categories().then(r => setCategories(r.data));
  }, []);

  const flashSale = products.find(p => p.badge === 'FLASH SALE') || products[0];
  const deals = products.slice(1, 3);
  const fresh = products.slice(0, 4);

  return (
    <Layout>
      <div className="home">

        {/* ── Header greeting ── */}
        <header className="home__header">
          <div>
            <p className="home__greeting">Good morning 👋</p>
            <h1 className="home__title">What do you need today?</h1>
          </div>
          <button className="btn-icon" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        {/* ── Search ── */}
        <div className="search-bar" onClick={() => navigate('/browse')} role="button" tabIndex={0}>
          <span className="material-symbols-outlined search-bar__icon">search</span>
          <span className="search-bar__placeholder">Search fresh groceries…</span>
          <span className="material-symbols-outlined search-bar__mic">mic</span>
        </div>

        {/* ── Promo Banner ── */}
        {flashSale && (
          <div className="promo-banner">
            <img
              src={flashSale.image_url}
              alt={flashSale.name}
              className="promo-banner__bg"
            />
            <div className="promo-banner__overlay" />
            <div className="promo-banner__content">
              <span className="promo-banner__tag">⚡ Flash Sale</span>
              <h2 className="promo-banner__name">{flashSale.name}</h2>
              <p className="promo-banner__sub">{flashSale.unit}</p>
              <div className="promo-banner__cta-row">
                <span className="promo-banner__price">₹{flashSale.price}</span>
                <button
                  className="btn-primary"
                  onClick={() => addToCart(flashSale.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Categories</h2>
            <Link to="/browse" className="section__link">See all</Link>
          </div>
          <div className="categories-scroll">
            {categories.map(cat => (
              <CategoryPill key={cat.id} cat={cat} />
            ))}
          </div>
        </section>

        {/* ── Today's Deals ── */}
        {deals.length > 0 && (
          <section className="section">
            <div className="section__header">
              <h2 className="section__title">Today's Deals</h2>
              <Link to="/browse" className="section__link">See all</Link>
            </div>
            <div className="deals-list">
              {deals.map(p => (
                <div key={p.id} className="deal-card">
                  <img src={p.image_url} alt={p.name} className="deal-card__image" />
                  <div className="deal-card__body">
                    <h4 className="deal-card__name">{p.name}</h4>
                    <p className="deal-card__unit">{p.unit}</p>
                    {p.original_price && (
                      <span className="deal-card__original">₹{p.original_price}</span>
                    )}
                    <div className="deal-card__footer">
                      <span className="deal-card__price">₹{p.price}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="btn-add-outline"
                        aria-label={`Add ${p.name} to cart`}
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Fresh Arrivals ── */}
        <section className="section section--last">
          <div className="section__header">
            <h2 className="section__title">Fresh Arrivals</h2>
            <Link to="/browse" className="section__link">Explore More</Link>
          </div>
          <div className="product-grid">
            {fresh.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}