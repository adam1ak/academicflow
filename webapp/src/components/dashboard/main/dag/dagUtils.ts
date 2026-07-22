import { SubjectDetailResponse } from "../../../../types/plan";

export function calculateLevels(displaySubjects: SubjectDetailResponse[]) {
  const levels: Record<number, number> = {};
  const subjectByName = new Map(displaySubjects.map((s) => [s.name, s]));
  const dependenciesRecord: Record<number, number[]> = {};
  
  displaySubjects.forEach((s) => {
    dependenciesRecord[s.id] = [];
  });

  displaySubjects.forEach((s) => {
    if (s.dependents) {
      s.dependents.forEach((depName) => {
        const childSubject = subjectByName.get(depName);
        if (childSubject) {
          dependenciesRecord[childSubject.id].push(s.id);
        }
      });
    }
  });

  const visiting = new Set<number>();

  function getSubjectColumn(id: number): number {
    if (levels[id] !== undefined) return levels[id];
    if (visiting.has(id)) {
      return 0;
    }

    visiting.add(id);
    const parentIds = dependenciesRecord[id] || [];
    if (parentIds.length === 0) {
      visiting.delete(id);
      levels[id] = 0;
      return 0;
    }
    const depsColumns = parentIds.map((parentId) => getSubjectColumn(parentId));
    levels[id] = Math.max(...depsColumns) + 1;
    visiting.delete(id);
    return levels[id];
  }

  displaySubjects.forEach((s) => getSubjectColumn(s.id));
  return { levels, subjectByName };
}

export function generateEdgePath(x1: number, y1: number, x2: number, y2: number, colDelta: number): string {
  if (colDelta > 1) {
    const cp1x = x1 + (x2 - x1) * 0.75;
    const cp1y = y1;
    const cp2x = x2 - 80;
    const cp2y = y2;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  } else {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  }
}
