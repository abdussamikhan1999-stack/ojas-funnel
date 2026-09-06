#!/usr/bin/env python3
"""Local preview server that mimics this project's vercel.json.

`python -m http.server` serves files literally, so the site's extensionless
links (href="about", href="quiz") 404 locally even though they work in
production. This adds the two rewrites vercel.json turns on:

    cleanUrls: true       /about  -> about.html
    trailingSlash: false  /about/ -> /about

Usage:  python3 preview.py [port]      (default 8777, binds all interfaces)
"""
import sys, os, functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            if os.path.exists(index):
                return index
        if not os.path.exists(local):
            candidate = local.rstrip("/") + ".html"
            if os.path.exists(candidate):
                return candidate
        return local

    def send_head(self):
        # trailingSlash:false — redirect /about/ to /about before serving.
        raw = self.path.split("?", 1)[0]
        if len(raw) > 1 and raw.endswith("/"):
            target = raw.rstrip("/")
            if os.path.exists(os.path.join(ROOT, target.lstrip("/") + ".html")):
                self.send_response(308)
                self.send_header("Location", target)
                self.end_headers()
                return None
        return super().send_head()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
    handler = functools.partial(CleanURLHandler, directory=ROOT)
    with ThreadingHTTPServer(("0.0.0.0", port), handler) as httpd:
        print("Ojas preview on http://127.0.0.1:%d/  (clean URLs on)" % port)
        httpd.serve_forever()
