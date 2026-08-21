import sys
import os
from pathlib import Path
from urllib.parse import urlparse

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from app import app

# Vercel WSGI Path Normalizer Middleware
class VercelPathMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # 1. Prefer original full URI from Vercel edge headers
        raw_uri = environ.get('RAW_URI') or environ.get('REQUEST_URI') or environ.get('HTTP_X_MATCHED_PATH')
        if raw_uri:
            parsed_path = urlparse(raw_uri).path
            if parsed_path:
                environ['PATH_INFO'] = parsed_path
                return self.wsgi_app(environ, start_response)

        # 2. Fallback to cleaning PATH_INFO
        path_info = environ.get('PATH_INFO', '')
        if path_info.startswith('/api/index.py'):
            environ['PATH_INFO'] = path_info[len('/api/index.py'):] or '/'
        elif path_info.startswith('/api/index'):
            environ['PATH_INFO'] = path_info[len('/api/index'):] or '/'
        elif path_info == '/api' or path_info == '/api/':
            environ['PATH_INFO'] = '/'

        return self.wsgi_app(environ, start_response)

app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
