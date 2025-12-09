# # api_server.py
# # Flask Backend API for Web Repository
# # Receives notifications from ADK agent and broadcasts updates via SSE

# from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# import json
# import os
# from datetime import datetime
# from queue import Queue
# import threading
# import time

# app = Flask(__name__)
# CORS(app)  # Enable CORS for local development

# # Path to registry.json
# REGISTRY_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'registry.json')

# # SSE message queue for broadcasting to all connected clients
# message_queues = []
# message_queues_lock = threading.Lock()


# def read_registry():
#     """Read the current registry.json file"""
#     try:
#         if os.path.exists(REGISTRY_PATH):
#             with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
#                 return json.load(f)
#         else:
#             return {"entries": []}
#     except Exception as e:
#         print(f"❌ Error reading registry: {e}")
#         return {"entries": []}


# def write_registry(data):
#     """Write updated data to registry.json"""
#     try:
#         with open(REGISTRY_PATH, 'w', encoding='utf-8') as f:
#             json.dump(data, f, indent=2, ensure_ascii=False)
#         return True
#     except Exception as e:
#         print(f"❌ Error writing registry: {e}")
#         return False


# def broadcast_sse_message(event_type, data):
#     """Broadcast a message to all connected SSE clients"""
#     with message_queues_lock:
#         for queue in message_queues:
#             try:
#                 queue.put({
#                     "event": event_type,
#                     "data": data
#                 })
#             except:
#                 pass


# @app.route('/api/add_report', methods=['POST'])
# def add_report():
#     """
#     Endpoint to receive new report notifications from ADK agent

#     Expected JSON payload:
#     {
#         "ppt_filename": "report_202501.pptx",
#         "map_filename": "map_202501.html",
#         "title": "Veoneer Report - January 2025",
#         "summary": "Complete analysis...",
#         "timestamp": "2025-01-15T14:30:00Z"
#     }
#     """
#     try:
#         # Parse request data
#         data = request.get_json()

#         if not data:
#             return jsonify({
#                 "status": "error",
#                 "message": "No JSON data provided"
#             }), 400

#         # Validate required fields
#         required_fields = ['ppt_filename', 'map_filename', 'title', 'summary']
#         for field in required_fields:
#             if field not in data:
#                 return jsonify({
#                     "status": "error",
#                     "message": f"Missing required field: {field}"
#                 }), 400

#         # Create new entry
#         new_entry = {
#             "title": data['title'],
#             "summary": data['summary'],
#             "timestamp": data.get('timestamp', datetime.utcnow().isoformat() + 'Z'),
#             "ppt_path": f"reports/{data['ppt_filename']}",
#             "map_path": f"maps/{data['map_filename']}"
#         }

#         # Read current registry
#         registry = read_registry()

#         # Add new entry at the beginning (most recent first)
#         registry['entries'].insert(0, new_entry)

#         # Write updated registry
#         if not write_registry(registry):
#             return jsonify({
#                 "status": "error",
#                 "message": "Failed to update registry file"
#             }), 500

#         print(f"✅ New report registered: {new_entry['title']}")

#         # Broadcast update to all connected SSE clients
#         broadcast_sse_message("new_report", new_entry)

#         return jsonify({
#             "status": "success",
#             "message": "Report successfully registered",
#             "entry": new_entry
#         }), 200

#     except Exception as e:
#         print(f"❌ Error in add_report: {e}")
#         return jsonify({
#             "status": "error",
#             "message": f"Internal server error: {str(e)}"
#         }), 500


# @app.route('/api/stream')
# def stream():
#     """
#     Server-Sent Events (SSE) endpoint for real-time updates
#     Clients connect here to receive live notifications when new reports are added
#     """
#     def event_stream():
#         # Create a queue for this client
#         queue = Queue()

#         # Register this client's queue
#         with message_queues_lock:
#             message_queues.append(queue)

#         try:
#             # Send initial connection message
#             yield f"data: {json.dumps({'event': 'connected', 'message': 'SSE connection established'})}\n\n"

#             # Keep connection alive and send messages
#             while True:
#                 try:
#                     # Get message from queue (blocking, with timeout)
#                     message = queue.get(timeout=30)

#                     # Format SSE message
#                     event_data = json.dumps(message['data'])
#                     yield f"event: {message['event']}\ndata: {event_data}\n\n"

#                 except:
#                     # Timeout - send keepalive comment
#                     yield ": keepalive\n\n"

#         except GeneratorExit:
#             # Client disconnected
#             pass
#         finally:
#             # Unregister this client's queue
#             with message_queues_lock:
#                 if queue in message_queues:
#                     message_queues.remove(queue)

#     return Response(event_stream(), mimetype='text/event-stream')


# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         "status": "healthy",
#         "timestamp": datetime.utcnow().isoformat() + 'Z',
#         "connected_clients": len(message_queues)
#     }), 200


# @app.route('/api/registry', methods=['GET'])
# def get_registry():
#     """Get current registry contents"""
#     registry = read_registry()
#     return jsonify(registry), 200

 
# if __name__ == '__main__':
#     print("=" * 60)
#     print("🚀 Flask Backend API Server")
#     print("=" * 60)
#     print(f"Registry path: {REGISTRY_PATH}")
#     print(f"Endpoints:")
#     print(f"  - POST /api/add_report    (Receive notifications from ADK)")
#     print(f"  - GET  /api/stream        (SSE for real-time updates)")
#     print(f"  - GET  /api/health        (Health check)")
#     print(f"  - GET  /api/registry      (Get current registry)")
#     print("=" * 60)
#     print("Starting server on http://localhost:6000")
#     print("=" * 60)

#     app.run(
#         host='localhost',
#         port=6000,
#         debug=True,
#         threaded=True
#     )
