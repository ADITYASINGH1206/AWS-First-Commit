#!/usr/bin/env python3
"""CareSync Local Serverless API Runner.

Exposes the Lambda handler via a lightweight local HTTP server on port 3001,
mirroring AWS SAM Local's contract. Can run alongside or independent of Docker.
"""

import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.main import lambda_handler

PORT = int(os.environ.get("PORT", 3001))


class LambdaHttpHandler(BaseHTTPRequestHandler):
    """Translates incoming HTTP requests to AWS Lambda event payloads and returns responses."""

    def _set_headers(self, status_code: int, custom_headers: dict = None):
        self.send_response(status_code)
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Amz-Date, X-Api-Key"
        }
        if custom_headers:
            headers.update(custom_headers)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)
        self.wfile.write(b'{"message": "CORS preflight OK"}')

    def do_GET(self):
        query_str = ""
        path = self.path
        if "?" in self.path:
            path, query_str = self.path.split("?", 1)

        query_params = {}
        if query_str:
            for pair in query_str.split("&"):
                if "=" in pair:
                    k, v = pair.split("=", 1)
                    query_params[k] = v

        event = {
            "httpMethod": "GET",
            "path": path,
            "queryStringParameters": query_params,
            "headers": dict(self.headers),
            "body": ""
        }
        res = lambda_handler(event, None)
        self._set_headers(res.get("statusCode", 200), res.get("headers", {}))
        self.wfile.write(res.get("body", "{}").encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        event = {
            "httpMethod": "POST",
            "path": self.path,
            "headers": dict(self.headers),
            "body": post_data
        }
        res = lambda_handler(event, None)
        self._set_headers(res.get("statusCode", 200), res.get("headers", {}))
        self.wfile.write(res.get("body", "{}").encode("utf-8"))

    def log_message(self, format, *args):
        # Clean logging
        print(f"[CareSync Local API] {self.address_string()} - {format % args}")


def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, LambdaHttpHandler)
    print(f"🚀 CareSync Local AWS API running at http://localhost:{PORT}")
    print(f"👉 Lambda Handler: app/main.lambda_handler")
    print(f"👉 Endpoints: POST /process-note | GET/POST /adherence | GET /alerts")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping CareSync Local API server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
