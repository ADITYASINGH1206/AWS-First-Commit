/**
 * CareSync Local Serverless API Runner in TypeScript.
 * 
 * Exposes the Lambda handler via native Node.js HTTP server on port 3001,
 * mirroring AWS SAM Local's contract.
 */

import http from 'node:http';
import { lambdaHandler } from './main.js';
import type { LambdaEvent } from './types.js';

const PORT = Number(process.env.PORT || 3001);

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = urlObj.pathname;
  const queryStringParameters: Record<string, string> = {};
  urlObj.searchParams.forEach((val, key) => {
    queryStringParameters[key] = val;
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key',
    });
    res.end(JSON.stringify({ message: 'CORS preflight OK' }));
    return;
  }

  // Read request body
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    const event: LambdaEvent = {
      httpMethod: req.method || 'GET',
      path,
      headers: req.headers as Record<string, string>,
      queryStringParameters,
      body: bodyStr,
    };

    try {
      const response = await lambdaHandler(event);
      res.writeHead(response.statusCode, response.headers);
      res.end(response.body);
    } catch (err: any) {
      console.error('[CareSync Local API Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', details: err?.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CareSync TypeScript Serverless API running at http://localhost:${PORT}`);
  console.log(`👉 Lambda Handler: dist/main.lambdaHandler (Node.js 20+)`);
  console.log(`👉 Endpoints: POST /process-note | GET/POST /adherence | GET /alerts | POST /notify`);
});
