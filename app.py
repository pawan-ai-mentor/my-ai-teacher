import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# यहाँ सुधार किया गया है ताकि Render इसे पहचान सके
from google import generativeai as genai 

app = Flask(__name__)
CORS(app)

# --- 1. CONFIGURATION ---
# Render के Environment Variables से API Key उठाना
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# मॉडल का नाम (Render पर gemini-1.5-flash सबसे स्टेबल चलता है)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- 2. SIMULATED STUDENT DATA ---
def get_student_data(user_id):
    if user_id == "student_revolution":
        return {
            "name": "Arjun",
            "knowledge_level": 1,
            "learning_style": "Analogy",
            "current_topic": "Electricity (Class 10)",
            "historical_trend": "Struggles with abstract definitions; responds well to real-world context."
        }
    elif user_id == "student_advanced":
        return {
            "name": "Priya",
            "knowledge_level": 3,
            "learning_style": "Logic",
            "current_topic": "Linked Lists (B.Tech DSA)",
            "historical_trend": "Excels at complex math; quickly adopts coding paradigms."
        }
    return None

# --- 3. THE REVOLUTIONARY MASTER PROMPT GENERATOR ---
def create_master_prompt(student_data, user_question):
    style = student_data["learning_style"]
    level = student_data["knowledge_level"]
    topic = student_data["current_topic"]
    trend = student_data["historical_trend"]

    system_persona = f"""
    You are 'Vyaktigat Shikshak,' the first true Cognitive Mentor for a new era of learning.
    ***NON-NEGOTIABLE RULES (The Revolution)***
    1. Abolish Institutions: NEVER use words like 'syllabus,' 'exam,' 'lecture,' or 'class.' Frame learning as a continuous life journey.
    2. Experimentation Focus: Immediately after explaining a concept, pivot to a practical action, a real-world observation, or a digital simulation.
    ***DYNAMIC TUNING (Personalization)***
    - Pace/Depth: Level {level}. 
    - Learning Style: {style}.
    - Historical Context: {trend}.
    ***LANGUAGE ADAPTATION***
    - Respond in a mix of Hindi and English (Hinglish).
    """
    return f"{system_persona}\n\nStudent's Query on {topic}: {user_question}"

# --- 4. API ENDPOINTS ---
@app.route('/')
def health_check():
    return "Vyaktigat Shikshak Backend is Live!"

@app.route('/ask_ai', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        user_id = data.get('user_id')
        user_question = data.get('question')

        student_data = get_student_data(user_id)
        if not student_data:
            return jsonify({"response": "Error: Student profile not found."}), 404

        master_prompt = create_master_prompt(student_data, user_question)
        
        # यहाँ जनरेशन का तरीका बदला गया है ताकि एरर न आए
        response = model.generate_content(master_prompt)
        return jsonify({"response": response.text})
        
    except Exception as e:
        return jsonify({"response": f"AI Error: {str(e)}"}), 500

if __name__ == '__main__':
    # Render के लिए पोर्ट सेटिंग
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)



    
