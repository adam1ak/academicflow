import { Link } from "react-router-dom"

function Header() {
    return (
        <header className="w-full">
            <Link
                to="/"
                aria-label="Go to homepage" 
                className="
                        font-mono font-medium text-base tracking-tight text-text-primary
                    "
            >
                AcademicFlow
            </Link>
        </header>
    )
}

export default Header