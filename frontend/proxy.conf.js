const TARGET = "http://localhost:8080";
const OPTS = { target: TARGET, secure: false, changeOrigin: true };

const PROXY_CONFIG = {
  "/auth": OPTS,
  "/auth/**": OPTS,
  "/solicitudes": OPTS,
  "/solicitudes/**": OPTS,
  "/sugerencias": OPTS,
  "/sugerencias/**": OPTS,
  "/usuarios": OPTS,
  "/usuarios/**": OPTS,
};

module.exports = PROXY_CONFIG;
