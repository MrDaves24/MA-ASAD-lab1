FROM oven/bun:1

WORKDIR /app/frontend
COPY ./frontend /app/frontend

RUN bun install
RUN bun run build

FROM python:3.9-slim

WORKDIR /app/static/dist
COPY --from=0 /app/frontend/dist /app/static
COPY ./backend/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt

WORKDIR /app
COPY ./backend/server.py .

EXPOSE 8080
CMD ["python", "server.py"]
