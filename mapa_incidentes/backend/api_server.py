"""
Backend API para o Mapa de Incidentes
Recebe dados do agente e disponibiliza para o website com atualizações em tempo real
"""

from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import queue
import threading

# Configurar Flask para servir arquivos estáticos do website
app = Flask(__name__,
            static_folder='../',
            static_url_path='')
CORS(app)

# Caminho para armazenar os dados
DATA_FILE = os.path.join(os.path.dirname(__file__), 'incidents_data.json')

# Dados em memória (cache)
current_incidents = None

# Lista de clientes conectados via SSE
clients = []
clients_lock = threading.Lock()


def load_incidents():
    """Carrega incidentes do arquivo"""
    global current_incidents
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            current_incidents = json.load(f)
    return current_incidents


def save_incidents(data):
    """Salva incidentes no arquivo"""
    global current_incidents
    current_incidents = data
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def notify_clients(event_type='update'):
    """Notifica todos os clientes conectados via SSE"""
    with clients_lock:
        dead_clients = []
        for client_queue in clients:
            try:
                client_queue.put({
                    'event': event_type,
                    'timestamp': datetime.now().isoformat()
                })
            except:
                dead_clients.append(client_queue)

        # Remover clientes desconectados
        for dead_client in dead_clients:
            clients.remove(dead_client)


@app.route('/')
def serve_index():
    """Serve o index.html do website"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos (JS, CSS)"""
    return send_from_directory(app.static_folder, path)


@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    """
    Endpoint GET para o website obter os dados dos incidentes
    """
    data = load_incidents()

    if data is None:
        return jsonify({
            'status': 'success',
            'data': [],
            'message': 'Nenhum incidente registrado'
        }), 200

    return jsonify({
        'status': 'success',
        'data': data.get('incidents', []),
        'metadata': data.get('metadata', {}),
        'timestamp': data.get('timestamp')
    }), 200


@app.route('/api/incidents', methods=['POST'])
def update_incidents():
    """
    Endpoint POST para o agente enviar dados dos incidentes
    Notifica automaticamente todos os clientes conectados via SSE
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Dados JSON não fornecidos'
            }), 400

        # Validar estrutura básica
        if 'incidents' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Campo "incidents" é obrigatório'
            }), 400

        # Adicionar timestamp
        data['timestamp'] = datetime.now().isoformat()

        # Salvar dados
        save_incidents(data)

        # Notificar todos os clientes conectados
        notify_clients('update')

        print(f"✅ {len(data['incidents'])} incidentes recebidos - Clientes notificados: {len(clients)}")

        return jsonify({
            'status': 'success',
            'message': f'{len(data["incidents"])} incidentes recebidos e armazenados',
            'timestamp': data['timestamp'],
            'clients_notified': len(clients)
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao processar dados: {str(e)}'
        }), 500


@app.route('/api/stream')
def stream():
    """
    Endpoint SSE (Server-Sent Events) para notificações em tempo real
    Clientes se conectam aqui e recebem notificações quando há novos dados
    """
    def event_stream():
        client_queue = queue.Queue()

        with clients_lock:
            clients.append(client_queue)

        try:
            # Enviar evento inicial de conexão
            yield f"data: {json.dumps({'event': 'connected', 'timestamp': datetime.now().isoformat()})}\n\n"

            while True:
                # Aguardar por eventos
                event = client_queue.get()
                yield f"data: {json.dumps(event)}\n\n"

        except GeneratorExit:
            with clients_lock:
                if client_queue in clients:
                    clients.remove(client_queue)

    return Response(event_stream(), mimetype='text/event-stream')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o servidor está funcionando"""
    return jsonify({
        'status': 'healthy',
        'service': 'Mapa de Incidentes API',
        'timestamp': datetime.now().isoformat(),
        'connected_clients': len(clients)
    }), 200


@app.route('/api/clear', methods=['POST'])
def clear_incidents():
    """Endpoint para limpar todos os incidentes"""
    try:
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)

        global current_incidents
        current_incidents = None

        # Notificar clientes sobre limpeza
        notify_clients('clear')

        return jsonify({
            'status': 'success',
            'message': 'Todos os incidentes foram removidos',
            'clients_notified': len(clients)
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao limpar dados: {str(e)}'
        }), 500


if __name__ == '__main__':
    print("=" * 70)
    print("🚀 Backend API do Mapa de Incidentes iniciado!")
    print("=" * 70)
    print(f"📍 Servidor rodando em: http://localhost:5000")
    print(f"🌐 Website disponível em: http://localhost:5000")
    print(f"📊 Endpoint GET (Website): http://localhost:5000/api/incidents")
    print(f"📤 Endpoint POST (Agente): http://localhost:5000/api/incidents")
    print(f"📡 SSE Stream: http://localhost:5000/api/stream")
    print(f"💚 Health Check: http://localhost:5000/api/health")
    print("=" * 70)
    print("✨ Atualizações em tempo real ATIVADAS via SSE")
    print("🔗 Compartilhe o link: http://localhost:5000")
    print("=" * 70)

    # Carregar dados existentes
    load_incidents()

    # Iniciar servidor (use threaded=True para SSE)
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
