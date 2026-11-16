#!/usr/bin/env python3
"""
FlexUI Python Schematic Analysis & Code Formatting Microservice
Provides AST parsing, schematic token categorization, and code linting.
"""

import sys
import json
import re
import ast
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5002

class CodeAnalyzer:
    @staticmethod
    def analyze_python(code: str):
        try:
            tree = ast.parse(code)
            functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            return {
                "valid": True,
                "functions": functions,
                "classes": classes,
                "node_count": len(list(ast.walk(tree)))
            }
        except SyntaxError as e:
            return {
                "valid": False,
                "error": str(e),
                "lineno": e.lineno
            }

    @staticmethod
    def extract_schematic_tokens(code: str, language: str):
        lines = code.split('\n')
        token_stats = {
            "total_lines": len(lines),
            "characters": len(code),
            "keyword_count": len(re.findall(r'\b(import|export|function|const|let|class|return|if|else)\b', code)),
            "string_count": len(re.findall(r'["\'](.*?)["\']', code)),
            "tag_count": len(re.findall(r'<[a-zA-Z0-9_-]+', code)),
        }
        return token_stats

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self._set_headers(200)
            res = {
                "service": "FlexUI Python Microservice",
                "status": "healthy",
                "version": "1.0.0",
                "python_version": sys.version
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/analyze':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                code = data.get('code', '')
                lang = data.get('language', 'typescript')

                schematic = CodeAnalyzer.extract_schematic_tokens(code, lang)
                py_analysis = None
                if lang == 'python':
                    py_analysis = CodeAnalyzer.analyze_python(code)

                self._set_headers(200)
                result = {
                    "language": lang,
                    "schematic": schematic,
                    "python_ast": py_analysis,
                    "status": "success"
                }
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"FlexUI Python Microservice listening on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
