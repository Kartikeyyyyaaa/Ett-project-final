# Demo only: old base with known CVEs — CI should block production promotion.
FROM python:3.6-slim-buster
RUN pip install --no-cache-dir flask==1.0
CMD ["python", "-c", "print('do not deploy')"]
