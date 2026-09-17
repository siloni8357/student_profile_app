"""
Siloni V - Student Portfolio & Academic Dashboard
Launcher Script
Run with: python app.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    os.chdir(DIRECTORY)
    port = PORT
    httpd = None

    # Try port 3000, fallback to next available port if busy
    for p in range(PORT, PORT + 10):
        try:
            httpd = socketserver.TCPServer(("", p), Handler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print("Error: Could not bind to any port from 3000 to 3010.")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print("=" * 60)
    print("🎓 Siloni V - Student Portfolio & Academic Dashboard")
    print(f"🚀 Web Server active at: {url}")
    print("💡 Opening in your default browser...")
    print("🛑 Press Ctrl + C in this terminal to stop.")
    print("=" * 60)

    webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
        print("Server stopped cleanly.")

if __name__ == '__main__':
    start_server()
