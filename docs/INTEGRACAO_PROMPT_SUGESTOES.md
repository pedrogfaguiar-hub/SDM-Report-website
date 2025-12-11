# Sugestões de Integração do Mapa de Incidentes no Workflow do Agente

## 📋 Visão Geral

Este documento contém sugestões de alterações no prompt do agente de população de PowerPoint para integrar automaticamente a geração do mapa de incidentes interativo.

## 🔧 Passo 1: Registrar a Ferramenta no Agente

### Arquivo: `agent.py`

Adicionar o import da nova ferramenta:

```python
from tool.send_map_data_tool import send_map_data
```

Registrar a ferramenta no agente (linha 46):

```python
root_agent = Agent(
    name="PowerPoint_Population_Agent",
    model="gemini-2.5-pro",
    description=(
        "PowerPoint presentation population specialist. Opens existing presentation and "
        "places specific content while preserving the original structure and design. "
        "CRITICAL: Cannot create or generate content - only uses data explicitly provided in set of instructions. "
        "Handles text, images, charts, tables, and placeholders using tools from "
        "PowerPoint MCP Server v2.1 and others."
    ),
    instruction=prompt_populationD.instructions,
    tools=[
        powerpoint_mcp_toolset,
        upload_to_gcs_tool,
        send_report_email,
        send_map_data  # NOVA FERRAMENTA
    ],
)
```

## 📝 Passo 2: Alterações Sugeridas no Prompt

### Arquivo: `prompt_populationD.py`

**IMPORTANTE:** Adicionar uma nova seção ANTES de "## OPERATION FLOW" (antes da linha 211), logo após a seção de label reference:

```python
## 🗺️ PASSO INICIAL - MAPA DE INCIDENTES INTERATIVO

**CRÍTICO: Esta etapa deve ser executada ANTES de qualquer outra operação (antes do STEP 0).**

Antes de começar a trabalhar no PowerPoint, envie os dados de incidentes para o backend do mapa interativo:

### Enviar Dados para o Mapa Interativo

Use a ferramenta `send_map_data` para enviar os dados de incidentes P1 e P2 para o backend do mapa:

`send_map_data(json_data=<JSON completo carregado no início>, api_url="http://localhost:5000/api/incidents")`

**Importante:**
- Execute esta etapa IMEDIATAMENTE após carregar o JSON, antes de abrir o PowerPoint
- Envie o JSON completo original (incluindo reporting_period, data, Overview, etc.)
- A ferramenta irá extrair automaticamente os incidentes P1 e P2 de todos os meses
- Certifique-se de que o backend do mapa está rodando antes de executar
- Se o envio falhar, apenas registre o erro e continue com o processo do PowerPoint

**Exemplo de uso:**
```python
send_map_data(
    json_data={
        "reporting_period": {...},
        "data": {
            "Overview": {
                "2025-09": {
                    "incident": {
                        "overview_by_priority": {
                            "P1": [...],
                            "P2": [...]
                        }
                    }
                }
            }
        }
    }
)
```

**Resultado esperado:**
- Se bem-sucedido: "✅ X incidentes enviados com sucesso para o mapa"
- Se falhar: Registrar erro e continuar com o PowerPoint normalmente

Após enviar os dados do mapa, prossiga com o STEP 0 (abrir PowerPoint).
```

### Localização Exata no Prompt

Inserir após a linha 209 (após a seção de Label reference e ANTES de "## OPERATION FLOW"):

```python
I5 – Total number of cancelled incidents  # <- LINHA 209 EXISTENTE

## 🗺️ PASSO INICIAL - MAPA DE INCIDENTES INTERATIVO  # <- ADICIONAR AQUI
**CRÍTICO: Esta etapa deve ser executada ANTES de qualquer outra operação...**
[restante do conteúdo sugerido acima]

## OPERATION FLOW (EFFICIENT SLIDE-BY-SLIDE PROCESS)  # <- LINHA 211 EXISTENTE
```

## 🚀 Passo 3: Iniciar o Backend

Antes de executar o agente, certifique-se de que o backend está rodando:

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\AGENTE_D\tool\mapa_incidentes\backend

# Instalar dependências (primeira vez)
pip install -r requirements.txt

# Iniciar o servidor
python api_server.py
```

O servidor iniciará em: `http://localhost:5000`

## 📊 Passo 4: Acessar o Mapa

Após o agente enviar os dados, abra o mapa em um navegador:

```
C:\Users\pedraguiar\Documents\population_agent_v3\AGENTE_D\tool\mapa_incidentes\index.html
```

Ou, se estiver usando um servidor web local:
```
http://localhost:PORT/mapa_incidentes/index.html
```

## 🔄 Fluxo Completo (NOVO)

```
1. Agente carrega e interpreta o JSON
2. 🗺️ Agente envia dados para API do mapa  ← NOVA ETAPA (PRIMEIRO PASSO)
3. Agente abre PowerPoint e processa slides
4. Agente popula todos os slides com dados
5. Agente salva apresentação
6. Agente faz upload para GCS
7. Agente envia email com anexo
8. Agente gera relatório final
9. Usuário abre mapa no navegador para visualizar incidentes (disponível desde o passo 2)
```

**Vantagens desta ordem:**
- ✅ Mapa está disponível DURANTE a população do PowerPoint
- ✅ Usuário pode monitorar incidentes em tempo real enquanto o agente trabalha
- ✅ Se houver erro no mapa, não afeta o processo principal do PowerPoint
- ✅ Mapa já está pronto quando o relatório é enviado

## 📁 Estrutura de Arquivos

```
AGENTE_D/
├── tool/
│   ├── send_map_data_tool.py          # Nova ferramenta Python
│   └── mapa_incidentes/
│       ├── index.html                  # Website do mapa
│       ├── app.js                      # Lógica JavaScript
│       ├── styles.css                  # Estilos
│       └── backend/
│           ├── api_server.py          # Backend API
│           ├── requirements.txt       # Dependências
│           └── incidents_data.json    # Dados armazenados
├── agent.py                            # Registrar ferramenta aqui
└── prompt_populationD.py               # Adicionar instruções aqui
```

## ✅ Checklist de Integração

- [ ] Instalar dependências do backend: `pip install -r backend/requirements.txt`
- [ ] Adicionar import de `send_map_data` em `agent.py`
- [ ] Registrar ferramenta no array `tools` do agente
- [ ] Adicionar seção "MAPA DE INCIDENTES INTERATIVO" no prompt
- [ ] Iniciar backend antes de executar o agente: `python api_server.py`
- [ ] Testar envio manual com o script de exemplo em `send_map_data_tool.py`
- [ ] Executar agente e verificar se os dados são enviados
- [ ] Abrir `index.html` e verificar se os pins aparecem no mapa

## 🧪 Teste Manual

Para testar a ferramenta sem o agente:

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\AGENTE_D\tool

# Iniciar backend (terminal 1)
python mapa_incidentes\backend\api_server.py

# Testar envio (terminal 2)
python send_map_data_tool.py
```

## 🔍 Endpoints da API

- **GET** `/api/incidents` - Website busca dados (automático a cada 30s)
- **POST** `/api/incidents` - Agente envia dados
- **POST** `/api/clear` - Limpa todos os incidentes
- **GET** `/api/health` - Verifica status do servidor

## 📝 Notas Importantes

1. **O backend deve estar rodando** antes de executar o agente
2. **O website atualiza automaticamente** a cada 30 segundos
3. **Botão "Recarregar da API"** força atualização imediata
4. **Upload manual de JSON** ainda funciona para testes
5. **Cores dos pins** seguem prioridade: P1 (laranja) > P2 (amarelo) > Sem incidentes (azul)

## 🎨 Personalização

### Alterar URL da API

Em `app.js` (linha 31):
```javascript
const API_URL = 'http://localhost:5000/api/incidents';
```

Em `send_map_data_tool.py` (linha 12):
```python
def send_map_data(json_data: Dict[str, Any], api_url: str = "http://localhost:5000/api/incidents")
```

### Alterar Intervalo de Auto-Refresh

Em `app.js` (linha 51):
```javascript
setInterval(loadIncidentsFromAPI, 30000); // 30 segundos = 30000ms
```

## 🐛 Troubleshooting

**Erro: "Não foi possível conectar ao backend"**
- Verificar se o backend está rodando: `python api_server.py`
- Verificar se a porta 5000 está disponível

**Pins não aparecem no mapa**
- Abrir console do navegador (F12) e verificar erros
- Verificar se dados foram enviados corretamente: `http://localhost:5000/api/incidents`
- Clicar em "Recarregar da API" no website

**Erro 404 ao acessar API**
- Verificar se a URL está correta em `app.js`
- Verificar se o backend está na porta correta

## 🎯 Resultado Final

Após a integração completa:
1. **Antes do PowerPoint:** Agente envia dados para o mapa (PRIMEIRA AÇÃO)
2. **Mapa disponível:** Usuário já pode visualizar incidentes enquanto o agente trabalha
3. Agente processa dados e popula PowerPoint automaticamente
4. Agente envia email com relatório
5. Usuário tem AMBOS disponíveis: relatório PowerPoint + mapa interativo atualizado
6. Mapa continua atualizando automaticamente a cada 30 segundos

---

**Autor:** Claude Code
**Data:** 2025-01-17
**Versão:** 1.0
