
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

# --- 1. CONFIGURATION ---
# Note: The 'genai.Client()' automatically looks for the GEMINI_API_KEY environment variable.
client = genai.Client()
model_name = 'gemini-2.5-flash' 
app = Flask(__name__)
CORS(app) # Crucial for connecting Frontend (React) and Backend (Flask)

# --- 2. SIMULATED STUDENT DATA (REPLACES FIREBASE) ---
def get_student_data(user_id):
    """Simulates fetching long-term student profile from a database."""
    if user_id == "student_revolution":
        return {
            "name": "Arjun",
            "knowledge_level": 1,         # Starting level
            "learning_style": "Analogy",  # Preferred style
            "current_topic": "Electricity (Class 10)",
            "historical_trend": "Struggles with abstract definitions; responds well to real-world context."
        }
    elif user_id == "student_advanced":
        return {
            "name": "Priya",
            "knowledge_level": 3,         # Advanced level
            "learning_style": "Logic",    # Logic/Theoretical style
            "current_topic": "Linked Lists (B.Tech DSA)",
            "historical_trend": "Excels at complex math; quickly adopts coding paradigms."
        }
    return None

# --- 3. THE REVOLUTIONARY MASTER PROMPT GENERATOR ---
def create_master_prompt(student_data, user_question):
    """Generates the highly personalized and anti-institutional prompt."""
    
    style = student_data["learning_style"]
    level = student_data["knowledge_level"]
    topic = student_data["current_topic"]
    trend = student_data["historical_trend"]

    # AI Identity: Cognitive Mentor, not a traditional teacher
    system_persona = f"""
    You are 'Vyaktigat Shikshak,' the first true Cognitive Mentor for a new era of learning.
    
    ***NON-NEGOTIABLE RULES (The Revolution)***
    1.  **Abolish Institutions:** NEVER use words like 'syllabus,' 'exam,' 'lecture,' or 'class.' Frame learning as a continuous life journey.
    2.  **Experimentation Focus:** Immediately after explaining a concept, pivot to a **practical action**, a **real-world observation**, or a **digital simulation** the student can perform.
    
    ***DYNAMIC TUNING (Personalization)***
    - **Pace/Depth:** The student's current knowledge level is {level}. Adjust complexity accordingly.
    - **Learning Style:** Always teach using the '{style}' approach.
    - **Historical Context:** Note that the student's historical trend is: '{trend}'. Use this to manage your tone (e.g., be more encouraging if they struggle).
    
    ***SUBJECT ADAPTATION***
    - If the topic is B.Tech/Coding, provide **clean, commented Python/C++ code snippets** as examples.
    - If the topic is Science, focus on **natural phenomena and engineering applications.**
    
    ***LANGUAGE ADAPTATION (Mix Hindi/English Support)***
    - The student may ask questions in Hindi, English, or a mix (Hinglish). Respond in the same blended language they use, ensuring clarity.
    """

    final_prompt = f"{system_persona}\n\nStudent's Query on {topic}: {user_question}"
    return final_prompt

# --- 4. API ENDPOINT ---
@app.route('/ask_ai', methods=['POST'])
def ask_ai():
    data = request.json
    user_id = data.get('user_id')
    user_question = data.get('question')

    student_data = get_student_data(user_id)
    if not student_data:
        return jsonify({"response": "Error: Student profile not found in database."}), 404

    master_prompt = create_master_prompt(student_data, user_question)
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=master_prompt
        )
        return jsonify({"response": response.text})
        
    except Exception as e:
        return jsonify({"response": f"AI Error: {e}"}), 500

if __name__ == '__main__':
    # Flask server को 5000 पोर्ट पर चलाता है
    app.run(debug=True)