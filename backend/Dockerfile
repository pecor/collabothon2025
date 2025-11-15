FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for OpenShift compatibility
RUN useradd -m -u 1001 appuser && \
    chown -R 1001:0 /app && \
    chmod -R g=u /app

# Install Python dependencies
COPY --chown=1001:0 requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy entrypoint script
COPY --chown=1001:0 entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Copy project
COPY --chown=1001:0 . /app/

# Create directories for static files and media with proper permissions
RUN mkdir -p /app/staticfiles /app/media && \
    chown -R 1001:0 /app/staticfiles /app/media && \
    chmod -R g=u /app/staticfiles /app/media

# Switch to non-root user
USER 1001

# Expose port 8000 (backend API port)
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run gunicorn on port 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "config.wsgi:application"]
