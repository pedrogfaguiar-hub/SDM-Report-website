# 🗺️ Como Usar o Mapa de Incidentes

## 🚀 Início Rápido - Método Recomendado (Direto)

O mapa agora funciona através de **atualização direta de ficheiros**, sem necessidade de servidor Flask. O AGENTE_D atualiza automaticamente o ficheiro JSON e o mapa recarrega a cada 30 segundos.

### 1. Iniciar Servidor Web Simples

Abra um terminal e execute:

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\mapa_incidentes
python -m http.server 8000
```

### 2. Acessar o Mapa

Abra no navegador:
```
http://localhost:8000
```

### 3. Como Funciona

1. **Agente atualiza dados**: A tool `update_map_direct` escreve diretamente em `backend/incidents_data.json`
2. **Frontend auto-refresh**: O mapa recarrega os dados a cada 30 segundos automaticamente
3. **Sem servidor Flask**: Não precisa de API ou porta 5000

**Vantagens:**
- ✅ Mais simples (sem Flask)
- ✅ Mais rápido (I/O direto)
- ✅ Sem problemas de timeout HTTP
- ✅ Menos dependências

---

## 🔄 Método Alternativo - Com Flask API (Tempo Real via SSE)

Se precisar de atualizações em tempo real instantâneas (sem esperar 30s), pode usar o backend Flask.

### 1. Iniciar o Backend Flask

Abra um terminal e execute:

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\mapa_incidentes\backend
python api_server.py
```

Você verá:
```
======================================================================
🚀 Backend API do Mapa de Incidentes iniciado!
======================================================================
📍 Servidor rodando em: http://localhost:5000
🌐 Website disponível em: http://localhost:5000
📊 Endpoint GET (Website): http://localhost:5000/api/incidents
📤 Endpoint POST (Agente): http://localhost:5000/api/incidents
📡 SSE Stream: http://localhost:5000/api/stream
💚 Health Check: http://localhost:5000/api/health
======================================================================
✨ Atualizações em tempo real ATIVADAS via SSE
🔗 Compartilhe o link: http://localhost:5000
======================================================================
```

### 2. Acessar o Mapa

**No seu navegador:**
```
http://localhost:5000
```

**Para compartilhar com outros dispositivos na mesma rede:**
```
http://<seu-ip-local>:5000
```

Exemplos:
- `http://192.168.1.100:5000`
- `http://10.0.0.50:5000`

Para descobrir seu IP local:
```bash
# Windows
ipconfig

# Procure por "Endereço IPv4" na seção da sua conexão ativa
```

## ✨ Funcionalidades de Tempo Real

### Atualizações Automáticas

O mapa **atualiza INSTANTANEAMENTE** quando:

1. ✅ **Agente envia dados** via `send_map_data`
   - O mapa recarrega automaticamente
   - Pins são atualizados com novos incidentes
   - Sem necessidade de refresh manual

2. ✅ **Alguém limpa incidentes**
   - Todos os mapas abertos resetam
   - Pins voltam para estado "sem incidentes"

3. ✅ **Reconexão automática**
   - Se perder conexão, tenta reconectar a cada 5 segundos
   - Status de conexão visível no painel de informações

### Indicadores de Status

No painel de informações, você verá:

- 🟢 **Conectado - Atualizações em tempo real** → Tudo funcionando
- 🔄 **Atualizando mapa...** → Recebendo novos dados
- 🔌 **Conectando ao servidor...** → Estabelecendo conexão
- 🔴 **Desconectado - Tentando reconectar...** → Problema de conexão

## 🎯 Workflow Completo

### Fluxo do Agente

```
1. Usuário executa agente
2. Agente lê JSON e IMEDIATAMENTE envia para o mapa
   ↓
3. Backend recebe dados via POST /api/incidents
   ↓
4. Backend notifica TODOS os clientes conectados via SSE
   ↓
5. TODOS os navegadores abertos atualizam automaticamente
   ↓
6. Agente continua com PowerPoint normalmente
```

**Resultado:** O mapa está atualizado ANTES do PowerPoint ser gerado!

## 🌐 Acesso Remoto (Mesma Rede)

### Configuração

1. **Encontre seu IP local:**
   ```bash
   ipconfig
   ```

2. **Compartilhe o link:**
   ```
   http://<seu-ip>:5000
   ```

3. **Outros dispositivos:**
   - Qualquer pessoa na mesma rede Wi-Fi pode acessar
   - Funciona em celulares, tablets, outros computadores

### Exemplo de Uso

**Cenário:** Reunião com equipe

1. Você inicia o backend no seu computador
2. Compartilha: `http://192.168.1.100:5000`
3. Equipe abre em seus dispositivos
4. Você executa o agente
5. **TODOS veem as atualizações ao mesmo tempo**

## 🔧 Comandos Úteis

### Verificar se o servidor está rodando

```bash
curl http://localhost:5000/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "service": "Mapa de Incidentes API",
  "timestamp": "2025-01-17T15:30:00",
  "connected_clients": 2
}
```

### Enviar dados manualmente (teste)

```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{"incidents": [{"location": "Germany", "priority": "P1", "description": "Test"}]}'
```

### Limpar todos os incidentes

```bash
curl -X POST http://localhost:5000/api/clear
```

## 📊 Console do Navegador

Abra o DevTools (F12) → Console para ver logs em tempo real:

```
✅ Conectado ao SSE - Atualizações em tempo real ATIVAS
📡 Evento SSE recebido: {event: 'update', timestamp: '...'}
🔄 Novos dados disponíveis - Recarregando...
```

## 🎨 Personalização

### Alterar Porta

Em `api_server.py` (última linha):
```python
app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
#                           ^^^^
#                           Mudar aqui
```

Depois atualizar em `app.js`:
```javascript
const API_URL = 'http://localhost:5000/api/incidents';
const SSE_URL = 'http://localhost:5000/api/stream';
//                                ^^^^
//                                Mudar aqui também
```

### Desabilitar Reconexão Automática

Em `app.js`, remover o bloco `setTimeout` em `eventSource.onerror`:
```javascript
eventSource.onerror = function(error) {
    console.error('❌ Erro na conexão SSE:', error);
    updateSSEStatus('🔴 Desconectado', '#f44336');
    // Não reconectar automaticamente
};
```

## 🔍 Troubleshooting

### Mapa não atualiza automaticamente

1. Verificar console (F12) - ver erros SSE
2. Verificar se backend está rodando
3. Verificar firewall não está bloqueando porta 5000
4. Recarregar página (Ctrl+F5)

### "Desconectado - Tentando reconectar"

1. Backend pode ter caído - verificar terminal
2. Firewall bloqueando - desabilitar temporariamente
3. Porta em uso - mudar para outra porta

### Outros dispositivos não conseguem acessar

1. Verificar se estão na mesma rede Wi-Fi
2. Firewall do Windows pode estar bloqueando:
   ```
   Painel de Controle → Windows Defender Firewall
   → Permitir aplicativo através do firewall
   → Adicionar Python
   ```
3. Verificar IP está correto: `ipconfig`

### Backend trava ou para

- Reiniciar: `Ctrl+C` e executar `python api_server.py` novamente
- Verificar logs no terminal para erros

## 📈 Monitoramento

### Quantos clientes estão conectados?

```bash
curl http://localhost:5000/api/health
```

Olhar campo `connected_clients`.

### Logs do Backend

O backend imprime logs úteis:
```
✅ 5 incidentes recebidos - Clientes notificados: 3
```

Isso significa:
- 5 incidentes foram salvos
- 3 navegadores foram notificados e vão atualizar

## 🎯 Casos de Uso

### Uso 1: Monitoramento em Tempo Real

1. Abrir mapa em monitor secundário
2. Executar agente
3. Ver incidentes aparecendo instantaneamente
4. Continuar trabalhando enquanto PowerPoint é gerado

### Uso 2: Apresentação em Reunião

1. Projetar mapa na tela da sala
2. Executar agente durante reunião
3. Equipe vê incidentes aparecendo em tempo real
4. Discussão baseada em dados atualizados

### Uso 3: Dashboard de Incidentes

1. Deixar mapa aberto em tela dedicada
2. Agente roda periodicamente (cron/scheduler)
3. Mapa sempre atualizado sem intervenção manual
4. Equipe monitora incidentes continuamente

## 🔐 Segurança

### Aviso

Este sistema é para **uso em rede local** apenas.

**NÃO expor diretamente à internet** sem:
- Autenticação
- HTTPS
- Rate limiting
- Validação de dados robusta

### Para Produção

Considere:
- Reverse proxy (nginx)
- SSL/TLS certificates
- Autenticação JWT
- Containerização (Docker)
- Load balancer

## 📝 Resumo Rápido

### Método Direto (Recomendado)

**Iniciar servidor:**
```bash
cd mapa_incidentes
python -m http.server 8000
```

**Acessar:**
- Local: `http://localhost:8000`
- Rede: `http://<seu-ip>:8000`

**Funciona:**
- ✅ Atualização direta de ficheiros
- ✅ Auto-refresh a cada 30 segundos
- ✅ Sem dependências Flask
- ✅ Simples e rápido

### Método Flask (Opcional - Tempo Real)

**Iniciar servidor:**
```bash
cd backend
python api_server.py
```

**Acessar:**
- Local: `http://localhost:5000`
- Rede: `http://<seu-ip>:5000`

**Funciona:**
- ✅ Atualizações instantâneas via SSE
- ✅ Múltiplos clientes simultâneos
- ✅ Reconexão automática
- ✅ Compartilhável na rede local

---

**Desenvolvido por:** Claude Code
**Data:** 2025-12-02
**Versão:** 3.0 (Direct File Update + Optional SSE)
