export default function NotFound() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000814',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
                <p>Page Not Found</p>
                <a href="/" style={{ color: '#4169e1', textDecoration: 'none', fontWeight: 'bold' }}>Back Home</a>
            </div>
        </div>
    );
}
