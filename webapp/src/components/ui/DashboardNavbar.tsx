function DashboardNavbar() {
  const navItems = [
    { label: "Dashboard", active: true },
    { label: "Courses", active: false },
    { label: "Schedule", active: false },
    { label: "Analytics", active: false },
    { label: "Explore", active: false },
  ];

  return (
    <nav aria-label="Main navigation">
      <div>
        <div>
          <span>AcademicFlow</span>

          <div aria-hidden="true" />

          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  {...(item.active ? { "aria-current": "page" as const } : {})}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div>
            <span>Fall 2024 · W3</span>
            <span>Fall 2024 · Week 3/12</span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Semester progress"
          >

            <div />
            <span>25%</span>
          </div>

          <button type="button" aria-label="User profile">

            <div>
              <div>Dr. Alan Turing</div>
              <div>a.turing@flow.edu</div>
            </div>

            <span aria-hidden="true">AT</span>
          </button>

          <button
            type="button"
            aria-expanded="false"
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-nav-menu">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                {...(item.active ? { "aria-current": "page" as const } : {})}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default DashboardNavbar;