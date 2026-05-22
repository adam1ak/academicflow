import { useError } from "../context/ErrorContext"

function ErrorPopup() {
    const { error, cleanError } = useError()

    if (!error) return null

    return (
        <div style={{
            position: 'fixed', top: '20px', right: '20px',
            backgroundColor: '#ff4d4f', color: 'white',
            padding: '15px', borderRadius: '5px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000, display: 'flex', gap: '20px', alignItems: 'center'
        }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
            <button onClick={cleanError} style={{
                background: 'transparent', border: 'none', color: 'white',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
            }}>X</button>
        </div>
    )
}

export default ErrorPopup