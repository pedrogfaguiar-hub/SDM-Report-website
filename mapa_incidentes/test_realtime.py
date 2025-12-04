"""
Script de teste para validar atualizações em tempo real
Execute este script com o backend rodando para ver o SSE em ação
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://localhost:5000/api/incidents"
HEALTH_URL = "http://localhost:5000/api/health"

def test_connection():
    """Testa conexão com o backend"""
    print("\n" + "="*60)
    print("🔍 Testando conexão com o backend...")
    print("="*60)

    try:
        response = requests.get(HEALTH_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend está rodando!")
            print(f"   Status: {data['status']}")
            print(f"   Clientes conectados: {data['connected_clients']}")
            print(f"   Timestamp: {data['timestamp']}")
            return True
        else:
            print(f"❌ Backend retornou status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao backend")
        print("   Certifique-se de que está rodando: python api_server.py")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False


def send_test_data(incident_num):
    """Envia dados de teste para o backend"""
    test_data = {
        "incidents": [
            {
                "location": "Germany",
                "priority": "P1" if incident_num % 2 == 0 else "P2",
                "description": f"Teste #{incident_num} - Incidente automático",
                "incident_id": f"TEST{incident_num:04d}",
                "category": "Firewall"
            },
            {
                "location": "USA",
                "priority": "P2",
                "description": f"Teste #{incident_num} - Outro incidente",
                "incident_id": f"TEST{incident_num+1000:04d}",
                "category": "Access & Management"
            }
        ],
        "metadata": {
            "reporting_period": "2025-01-TEST",
            "generated_at": datetime.now().isoformat(),
            "test": True
        }
    }

    try:
        response = requests.post(
            API_URL,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Dados enviados com sucesso!")
            print(f"   Incidentes: {len(test_data['incidents'])}")
            print(f"   Clientes notificados: {result.get('clients_notified', 0)}")
            print(f"   Timestamp: {result['timestamp']}")
            return True
        else:
            print(f"❌ Erro ao enviar: Status {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro ao enviar dados: {e}")
        return False


def clear_data():
    """Limpa todos os incidentes"""
    print("\n🗑️ Limpando todos os incidentes...")

    try:
        response = requests.post(
            "http://localhost:5000/api/clear",
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Incidentes limpos!")
            print(f"   Clientes notificados: {result.get('clients_notified', 0)}")
            return True
        else:
            print(f"❌ Erro ao limpar: Status {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Erro ao limpar dados: {e}")
        return False


def run_test():
    """Executa teste completo"""
    print("\n" + "="*60)
    print("🚀 TESTE DE ATUALIZAÇÕES EM TEMPO REAL")
    print("="*60)
    print("\n📝 Instruções:")
    print("   1. Abra http://localhost:5000 no navegador")
    print("   2. Abra o DevTools (F12) → Console")
    print("   3. Pressione Enter para continuar...")
    input()

    # Testar conexão
    if not test_connection():
        print("\n⚠️ Certifique-se de que o backend está rodando primeiro!")
        return

    print("\n" + "="*60)
    print("📤 TESTE 1: Enviar dados (3 vezes)")
    print("="*60)
    print("Observe o mapa no navegador - deve atualizar automaticamente!")
    print()

    for i in range(1, 4):
        print(f"\n🔄 Enviando lote #{i}...")
        if send_test_data(i):
            print(f"⏳ Aguarde 3 segundos...")
            time.sleep(3)
        else:
            print("❌ Teste falhou")
            return

    print("\n" + "="*60)
    print("🗑️ TESTE 2: Limpar dados")
    print("="*60)
    print("O mapa deve resetar automaticamente!")
    print()

    time.sleep(2)
    clear_data()

    print("\n" + "="*60)
    print("✅ TESTE COMPLETO!")
    print("="*60)
    print("\n📊 Verifique no navegador:")
    print("   - Os pins devem ter aparecido automaticamente")
    print("   - O mapa deve ter resetado no final")
    print("   - No console deve ver mensagens SSE")
    print("\n🎉 Se tudo funcionou, o sistema está operacional!")


if __name__ == "__main__":
    try:
        run_test()
    except KeyboardInterrupt:
        print("\n\n⚠️ Teste interrompido pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
