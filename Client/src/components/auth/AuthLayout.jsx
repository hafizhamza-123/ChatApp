export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-theme min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="auth-grid-overlay" aria-hidden="true" />
      <div className="auth-glow auth-glow-top" aria-hidden="true" />
      <div className="auth-glow auth-glow-bottom" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-6 items-stretch">
        <section className="hidden lg:flex auth-mockup-panel">
          <div className="auth-mockup-window">
            <div className="auth-mockup-head">
              <span className="auth-dot auth-dot-red" />
              <span className="auth-dot auth-dot-yellow" />
              <span className="auth-dot auth-dot-green" />
              <p>chatapp workspace</p>
            </div>

            <div className="auth-mockup-body">
              <div className="auth-sidebar-preview">
                <div className="auth-sidebar-item">
                  <span className="auth-avatar" />
                  <div>
                    <p>Product Team</p>
                    <small>Design review at 2:30 PM</small>
                  </div>
                </div>
                <div className="auth-sidebar-item muted">
                  <span className="auth-avatar" />
                  <div>
                    <p>Engineering</p>
                    <small>3 unread messages</small>
                  </div>
                </div>
                <div className="auth-sidebar-item muted">
                  <span className="auth-avatar" />
                  <div>
                    <p>Client Updates</p>
                    <small>Draft approved</small>
                  </div>
                </div>
              </div>

              <div className="auth-chat-preview">
                <div className="auth-msg auth-msg-in">
                  Morning! Shipping the latest UI pass today.
                </div>
                <div className="auth-msg auth-msg-out">
                  Great. I am adding final API checks now.
                </div>
                <div className="auth-msg auth-msg-in">
                  Perfect. Lets sync in 10 minutes.
                </div>
              </div>
            </div>
          </div>
        </section>

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
