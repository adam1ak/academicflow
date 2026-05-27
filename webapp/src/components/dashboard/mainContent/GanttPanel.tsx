export function GanttPanel() {
  return (
    <section className="bg-green-900 shrink-0 min-w-0 overflow-hidden flex flex-col">
      <header>
        <h2>Semester Timeline</h2>
        <p>Weeks 1–12 · Fall 2024 · 17 credits</p>
      </header>
      <figure>
        <div id="gantt-body">
        </div>
        <figcaption>
          <ul>
            <li>Active</li>
            <li>Upcoming</li>
            <li>Assignment</li>
            <li>Exam</li>
          </ul>
          <p>Scroll horizontally to see all 12 weeks.</p>
        </figcaption>
      </figure>
    </section>
  );
}
