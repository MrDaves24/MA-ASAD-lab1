FROM oven/bun:1 as bun

WORKDIR /app/frontend
COPY ./frontend /app/frontend

RUN bun install
RUN bun run build

FROM python:3.9-slim as server

WORKDIR /app/static/dist
COPY ./backend/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt

COPY --from=bun /app/frontend/dist /app/static

WORKDIR /app
COPY ./backend/server.py .

EXPOSE 8080
CMD ["python", "server.py"]
