export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-theme min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="auth-grid-overlay" aria-hidden="true" />
      <div className="auth-glow auth-glow-top" aria-hidden="true" />
      <div className="auth-glow auth-glow-bottom" aria-hidden="true" />
      <div className="auth-doodle-layer" aria-hidden="true">
        <div className="auth-doodle auth-doodle-top-left">
          <p className="auth-doodle-label">Team Chat</p>
          <p className="auth-doodle-text">Morning sync in 5 min</p>
        </div>
        <div className="auth-doodle auth-doodle-top-right">
          <p className="auth-doodle-label">Design</p>
          <p className="auth-doodle-text">Mockups approved</p>
        </div>
        <div className="auth-doodle auth-doodle-bottom-left">
          <p className="auth-doodle-label">Ayesha</p>
          <p className="auth-doodle-text">Typing...</p>
        </div>
        <div className="auth-doodle auth-doodle-bottom-right">
          <p className="auth-doodle-label">Project Hub</p>
          <p className="auth-doodle-text">Files synced</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        <section className="auth-card-wrap">
          <div className="auth-card">
            <p className="auth-kicker">ChatApp Secure Access</p>
            <h1 className="auth-title">{title}</h1>
            {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}

            {children}

            {footer ? <div className="mt-6 text-sm text-center text-gray-600">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
