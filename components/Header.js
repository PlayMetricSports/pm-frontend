export default function Header() {
  return (
    <header className="top-header">
      <div className="search-bar">
        <i className="fa-solid fa-search"></i>
        <input type="text" placeholder="Search bookings, clients, or inventory..." />
      </div>
      <div className="header-actions">
        <button className="icon-btn">
          <i className="fa-solid fa-bell"></i>
          <span className="badge">3</span>
        </button>
        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Admin User" />
          <div className="user-info">
            <span className="name">Rohan Mehta</span>
            <span className="role">Academy Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
}
