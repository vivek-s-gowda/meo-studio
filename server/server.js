import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FlexUI Backend Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Scaffolding metadata & generation endpoint
app.post('/api/scaffold', (req, res) => {
  const { language = 'react', projectName = 'flex-ui-app', components = [] } = req.body;

  const responsePayload = {
    projectName,
    language,
    componentCount: components.length,
    scaffoldTimestamp: new Date().toISOString(),
    instructions: {
      step1: 'Unpack the downloaded zip archive',
      step2: 'cd ' + projectName,
      step3: 'npm install',
      step4: language === 'angular' ? 'npm start' : 'npm run dev',
    },
    meta: {
      generatedBy: 'FlexUI Visual Studio',
      supportedLanguages: ['react', 'vue', 'angular', 'html'],
    },
  };

  res.json(responsePayload);
});

// AI & Schematic formatting endpoint
app.post('/api/ai/format', (req, res) => {
  const { code = '', language = 'typescript' } = req.body;

  // Simple schematic AST formatting
  const lineCount = code.split('\n').length;
  const tokenMatches = {
    functions: (code.match(/\b(function|const\s+\w+\s*=\s*\()/g) || []).length,
    imports: (code.match(/\bimport\b/g) || []).length,
    tags: (code.match(/<[a-zA-Z0-9_-]+/g) || []).length,
  };

  res.json({
    formatted: code.trim(),
    analysis: {
      language,
      lineCount,
      tokenMatches,
      status: 'valid',
    },
  });
});

// Serve static frontend build if present
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FlexUI Node.js service running on http://localhost:${PORT}`);
});
