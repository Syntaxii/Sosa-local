"""
WSGI config for sosa_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/howto/deployment/wsgi/
"""

import os
import sys

from django.core.wsgi import get_wsgi_application

# Fix unable to find path
sys.path.append("D:\\Code\\SW-Eng\\spring19_sosa_master\\sosa_project")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sosa_project.settings')

application = get_wsgi_application()
