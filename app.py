from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Make sure to set these variables to your OpenAI API key and your secret token
openai.api_key=os.getenv('OPENAI_API_KEY')
SECRET_TOKEN=os.getenv('SECRET_TOKEN')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/chat", methods=["POST"])
def chat():
    # Check for the Authorization header
    auth_header = request.headers.get("Authorization")

    # Validate the secret token
    if not auth_header or auth_header != f"Bearer {SECRET_TOKEN}":
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Get messages from request
        data = request.json
        messages = data.get('messages')
        
        # Call chatGPT API using Chat Completions
        openai_response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',  # Specify the model you want to use
            messages=messages
        )
        
        # Extract the chatbot's response
        chat_response = openai_response['choices'][0]['message']['content']
        
        # Return the response
        return jsonify({'response': chat_response})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    # Running the app on port 80, make sure you have the necessary permissions
    # On many systems, you might need to run this with administrative privileges``
    app.run(host="0.0.0.0", port=80)
