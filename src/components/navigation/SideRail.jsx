import { Link, NavLink } from 'react-router-dom';

function getItemClassName(item) {
  if (item.variant === 'anchor') {
    return item.isActive ? 'rail-nav-item active' : 'rail-nav-item';
  }

  return ({ isActive }) => (isActive ? 'rail-nav-item active' : 'rail-nav-item');
}

function renderRailItem(item) {
  const content = (
    <>
      <span className="rail-nav-icon" aria-hidden="true" />
      <span className="rail-nav-label">{item.label}</span>
    </>
  );

  if (item.variant === 'anchor') {
    return (
      <a key={item.key || item.label} className={getItemClassName(item)} href={item.href}>
        {content}
      </a>
    );
  }

  return (
    <NavLink key={item.key || item.label} to={item.to} end={item.end} className={getItemClassName(item)}>
      {content}
    </NavLink>
  );
}

export default function SideRail({ brandTo = '/', brandLabel = 'ExamSphere', items, footerLabel }) {
  return (
    <aside className="side-rail">
      <div className="rail-brand-wrap">
        <Link className="home-brand rail-brand" to={brandTo}>
          <span className="home-brand-mark"></span>
          <span className="rail-brand-text">{brandLabel}</span>
        </Link>
      </div>

      <nav className="rail-nav">{items.map(renderRailItem)}</nav>

      {footerLabel ? (
        <div className="rail-footer-note">
          <span className="rail-nav-icon" aria-hidden="true" />
          <span className="rail-nav-label">{footerLabel}</span>
        </div>
      ) : null}
    </aside>
  );
}
