from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Car Photo Generator Server is running"})

@app.route('/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        api_key = data.get('apiKey')

        # Validate input
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        if not api_key.startswith('sk-'):
            return jsonify({"error": "Invalid OpenAI API key format"}), 400

        print(f"Generating image with prompt: {prompt}")

        # Set the API key
        openai.api_key = api_key

        # Call OpenAI DALL-E API
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        image_url = response.data[0].url
        print(f"Image generated successfully: {image_url}")

        return jsonify({
            "success": True,
            "imageUrl": image_url,
            "prompt": prompt
        })

    except openai.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
