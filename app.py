from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

openai.api_type = "azure"
openai.api_base = "https://nc-openai-poc.openai.azure.com/"
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("OPENAI_API_KEY")
SECRET_TOKEN = os.getenv("SECRET_TOKEN")
expected_auth_header = f"Bearer {SECRET_TOKEN}"


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/check-token", methods=["POST"])
def check_token():
    auth_header = request.headers.get("Authorization")
    return jsonify({"response": auth_header and auth_header == expected_auth_header})


@app.route("/chat", methods=["POST"])
def chat():
    # Check for the Authorization header
    auth_header = request.headers.get("Authorization")

    # Validate the secret token
    if not auth_header or auth_header != expected_auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        data = request.json
        messages = data.get("messages")

        openai_response = openai.ChatCompletion.create(
            # model="gpt-3.5-turbo",
            engine="nc-openai-test-gpt-35-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
        )

        # Extract the chatbot's response
        chat_response = openai_response["choices"][0]["message"]["content"]

        # Return the response
        return jsonify({"response": chat_response})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
