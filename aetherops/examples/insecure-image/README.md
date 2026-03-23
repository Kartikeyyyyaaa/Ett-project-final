This folder exists for the **Security Gate** presentation moment. The Dockerfile uses an outdated base image so Trivy (see `.github/workflows/security-gate.yml`) reports vulnerabilities and the workflow exits with failure, blocking a naive “deploy everything” path.

Do not run this image in production.
