export function formatSemester(slug?: string): string {
    if (!slug) return ""
    const match = slug.match(/^([a-z]+)(\d{2,4})$/i)
    if (!match) return slug
    const name = match[1].toLowerCase().startsWith("fall") ? "Fall" : "Spring"
    const year = match[2].length === 2 ? `20${match[2]}` : match[2]
    return `${name} ${year}`
}
