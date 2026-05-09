// src/app/api/docs/route.ts
export function GET() {
  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailorent — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0f0f0f; }
    .swagger-ui .topbar { background: #111; border-bottom: 1px solid #2a2a2a; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .topbar-wrapper img { content: none; }
    .swagger-ui .topbar-wrapper::after {
      content: 'Tailorent API';
      color: #c9a84c;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .swagger-ui { background: #111; }
    .swagger-ui .info .title { color: #fff; }
    .swagger-ui .info p, .swagger-ui .info li { color: #aaa; }
    .swagger-ui .scheme-container { background: #161616; box-shadow: none; border-bottom: 1px solid #2a2a2a; padding: 16px 24px; }
    .swagger-ui .opblock-tag { color: #fff; border-bottom: 1px solid #2a2a2a; }
    .swagger-ui .opblock { background: #161616; border: 1px solid #2a2a2a; box-shadow: none; }
    .swagger-ui .opblock .opblock-summary { border: none; }
    .swagger-ui .opblock.opblock-post   { border-left: 3px solid #49cc90; background: rgba(73,204,144,.05); }
    .swagger-ui .opblock.opblock-get    { border-left: 3px solid #61affe; background: rgba(97,175,254,.05); }
    .swagger-ui .opblock.opblock-put    { border-left: 3px solid #fca130; background: rgba(252,161,48,.05); }
    .swagger-ui .opblock.opblock-delete { border-left: 3px solid #f93e3e; background: rgba(249,62,62,.05); }
    .swagger-ui .opblock-summary-description, .swagger-ui .opblock-summary-path { color: #ddd; }
    .swagger-ui section.models { background: #161616; border: 1px solid #2a2a2a; }
    .swagger-ui section.models h4 { color: #fff; }
    .swagger-ui .model-title { color: #c9a84c; }
    .swagger-ui .model { color: #ccc; }
    .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
      background: #1f1f1f; border: 1px solid #333; color: #fff;
    }
    .swagger-ui .btn.execute { background: #c9a84c; border-color: #c9a84c; color: #111; }
    .swagger-ui .btn.execute:hover { background: #e0c278; }
    .swagger-ui .response-col_status { color: #c9a84c; }
    .swagger-ui .markdown p, .swagger-ui .markdown li { color: #aaa; }
    .swagger-ui .parameter__name { color: #ddd; }
    .swagger-ui .parameter__type { color: #aaa; }
    .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #999; border-bottom: 1px solid #2a2a2a; }
    .swagger-ui .response-col_description { color: #ccc; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/api/docs/openapi",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: "BaseLayout",
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      docExpansion: "list",
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
