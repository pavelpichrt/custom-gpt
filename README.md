# Custom GPT

## Run locally

```bash
pip install -r requirements.txt
SECRET_TOKEN=XXX OPENAI_API_KEY=sk-YYY python app.py
```

App runs on localhost:80

## Build and run a container

```bash
docker build -t customgpt-service .
docker run -p 80:80 customgpt-service
```