# 🌐 Webroot Repository - Guia de Acesso e Troubleshooting

## 📋 Índice
1. [Como Aceder ao Website](#como-aceder-ao-website)
2. [Erros Comuns e Soluções](#erros-comuns-e-soluções)
3. [Verificação do Servidor](#verificação-do-servidor)
4. [Limpeza de Cache](#limpeza-de-cache)
5. [Testes de Diagnóstico](#testes-de-diagnóstico)

---

## 🚀 Como Aceder ao Website

### **Passo 1: Navegar para a pasta webroot**

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
```

### **Passo 2: Iniciar o Servidor HTTP**

#### Opção A: Python (Recomendado)
```bash
python -m http.server 8001
```

#### Opção B: Node.js
```bash
npx http-server -p 8001
```

#### Opção C: PHP
```bash
php -S localhost:8001
```

### **Passo 3: Abrir no Browser**

Acede a: **http://localhost:8001**

### **Passo 4: Verificar que Está a Funcionar**

Deves ver:
- ✅ Header com "Reports Repository"
- ✅ Logo Hoopie no canto superior direito
- ✅ Barra de pesquisa
- ✅ Cards com relatórios (se existirem)
- ✅ Tema escuro (verde + cyan)

---

## ❌ Erros Comuns e Soluções

### **1. ERR_EMPTY_RESPONSE**

**Sintoma:**
```
This page isn't working
localhost didn't send any data.
ERR_EMPTY_RESPONSE
```

**Causas Possíveis:**
- ✗ Múltiplos servidores a correr na mesma porta
- ✗ Servidor travado ou crashado
- ✗ Porta bloqueada por firewall

**Soluções:**

#### Solução 1: Matar Processos Antigos
```bash
# Windows
netstat -ano | findstr ":8001"
taskkill /F /PID [PID_NUMBER]

# Linux/Mac
lsof -ti :8001 | xargs kill -9
```

#### Solução 2: Usar Porta Alternativa
```bash
python -m http.server 8002
# Acede a http://localhost:8002
```

#### Solução 3: Reiniciar do Zero
```bash
# 1. Matar todos os processos Python
taskkill /F /IM python.exe

# 2. Esperar 5 segundos

# 3. Iniciar servidor novamente
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
python -m http.server 8001
```

---

### **2. ERR_CONNECTION_REFUSED**

**Sintoma:**
```
This site can't be reached
localhost refused to connect.
ERR_CONNECTION_REFUSED
```

**Causa:**
- ✗ Servidor não está a correr

**Solução:**
```bash
# Verificar se o servidor está ativo
netstat -ano | findstr ":8001"

# Se não aparecer nada, iniciar o servidor
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
python -m http.server 8001
```

---

### **3. Failed to Fetch / CORS Error**

**Sintoma (na DevTools Console):**
```
Error loading registry: TypeError: Failed to fetch
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Causa:**
- ✗ Abriste `index.html` diretamente (via `file://`) em vez de usar servidor HTTP

**Solução:**
- **NUNCA** abrir `index.html` diretamente do explorador de ficheiros
- **SEMPRE** usar servidor HTTP: `http://localhost:8001`

---

### **4. Página em Branco / Loading Infinito**

**Sintoma:**
- Página mostra "Loading reports..." eternamente
- Spinner a rodar sem parar

**Causas:**
- ✗ `registry.json` não existe ou está corrompido
- ✗ Cache do browser desatualizada
- ✗ JavaScript com erros

**Soluções:**

#### Solução 1: Verificar registry.json
```bash
# Verificar se o ficheiro existe
ls -la C:\Users\pedraguiar\Documents\population_agent_v3\webroot\data\registry.json

# Verificar se o JSON é válido
cat C:\Users\pedraguiar\Documents\population_agent_v3\webroot\data\registry.json | python -m json.tool
```

Se der erro, o JSON está corrompido. Formato correto:
```json
{
  "entries": []
}
```

#### Solução 2: Limpar Cache (Ver secção [Limpeza de Cache](#limpeza-de-cache))

#### Solução 3: Verificar Erros JavaScript
1. Abrir DevTools (`F12`)
2. Ir para **Console tab**
3. Procurar erros (linhas vermelhas)
4. Verificar se `script.js` carregou corretamente na **Network tab**

---

### **5. HTTP 304 Not Modified (Cache Antiga)**

**Sintoma:**
- Fizeste alterações mas a página não atualiza
- Network tab mostra HTTP 304

**Solução:**
Ver secção [Limpeza de Cache](#limpeza-de-cache)

---

### **6. Cards Não Aparecem / "No reports found"**

**Sintoma:**
- Página carrega mas não mostra nenhum card
- Mensagem: "No reports found"

**Causas:**
- ✗ `registry.json` está vazio ou só tem `{"entries": []}`
- ✗ Filtro de pesquisa aplicado

**Soluções:**

#### Solução 1: Verificar Conteúdo do Registry
```bash
cat C:\Users\pedraguiar\Documents\population_agent_v3\webroot\data\registry.json
```

Se estiver vazio, precisa gerar reports com AGENTE_D.

#### Solução 2: Limpar Filtro de Pesquisa
- Apagar texto da barra de pesquisa
- Verificar se o dropdown "Sort by" funciona

---

## 🧹 Limpeza de Cache

### **Método 1: Hard Refresh (Recomendado)**

Recarregar página ignorando cache:

| Browser | Windows/Linux | Mac |
|---------|---------------|-----|
| Chrome  | `Ctrl + Shift + R` ou `Ctrl + F5` | `Cmd + Shift + R` |
| Firefox | `Ctrl + Shift + R` ou `Ctrl + F5` | `Cmd + Shift + R` |
| Edge    | `Ctrl + Shift + R` ou `Ctrl + F5` | `Cmd + Shift + R` |
| Safari  | - | `Cmd + Option + E` |

### **Método 2: Limpar Cache no DevTools**

1. Abrir DevTools (`F12`)
2. Ir para **Network tab**
3. **Right-click** em qualquer request
4. Selecionar **"Clear browser cache"**
5. Recarregar página (`F5`)

### **Método 3: Modo Incógnito/Privado**

Abre uma janela privada:

| Browser | Windows/Linux | Mac |
|---------|---------------|-----|
| Chrome  | `Ctrl + Shift + N` | `Cmd + Shift + N` |
| Firefox | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| Edge    | `Ctrl + Shift + N` | `Cmd + Shift + N` |
| Safari  | - | `Cmd + Shift + N` |

Depois acede a `http://localhost:8001` na janela privada.

### **Método 4: Limpar Todos os Dados do Site**

1. Abrir DevTools (`F12`)
2. Ir para **Application tab** (Chrome/Edge) ou **Storage tab** (Firefox)
3. Expandir **Local Storage**
4. **Right-click** em `http://localhost:8001`
5. Selecionar **"Clear"**
6. Repetir para **Session Storage** e **Cache Storage**
7. Recarregar página

---

## 🔍 Verificação do Servidor

### **Verificar se o Servidor Está Ativo**

#### Windows:
```bash
netstat -ano | findstr ":8001"
```

**Output esperado:**
```
TCP    0.0.0.0:8001           0.0.0.0:0              LISTENING       12345
```

Se não aparecer nada → Servidor não está a correr.

#### Linux/Mac:
```bash
lsof -i :8001
```

### **Verificar Resposta HTTP**

```bash
curl -I http://localhost:8001/
```

**Output esperado:**
```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.12.7
Content-type: text/html
Content-Length: 4189
```

Se der erro ou timeout → Servidor não está a responder.

### **Verificar Logs do Servidor**

Olhar para a janela do terminal onde o servidor está a correr.

**Logs normais:**
```
Serving HTTP on :: port 8001 (http://[::]:8001/) ...
::1 - - [04/Dec/2025 17:36:13] "GET / HTTP/1.1" 200 -
::1 - - [04/Dec/2025 17:36:13] "GET /assets/style.css HTTP/1.1" 200 -
::1 - - [04/Dec/2025 17:36:13] "GET /assets/script.js HTTP/1.1" 200 -
::1 - - [04/Dec/2025 17:36:13] "GET /data/registry.json?_=... HTTP/1.1" 200 -
```

**Logs de erro:**
```
::1 - - [04/Dec/2025 17:36:13] "GET /data/registry.json HTTP/1.1" 404 -
```
→ Ficheiro não encontrado (404)

---

## 🩺 Testes de Diagnóstico

### **Teste 1: Verificar Estrutura de Pastas**

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
dir /b
```

**Output esperado:**
```
assets
backend
data
index.html
maps
README.md
reports
```

### **Teste 2: Verificar Ficheiros Essenciais**

```bash
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
dir index.html
dir assets\script.js
dir assets\style.css
dir data\registry.json
```

Todos devem existir e ter tamanho > 0 bytes.

### **Teste 3: Testar Fetch Manual**

Abre DevTools Console (`F12`) e executa:

```javascript
fetch('data/registry.json?_=' + Date.now(), { cache: 'no-store' })
  .then(r => r.json())
  .then(data => console.log('✅ Registry loaded:', data))
  .catch(err => console.error('❌ Fetch failed:', err));
```

**Output esperado:**
```
✅ Registry loaded: {entries: Array(17)}
```

Se der erro → Problema no servidor ou caminho errado.

### **Teste 4: Verificar JavaScript Console**

1. Abrir DevTools (`F12`)
2. Ir para **Console tab**
3. Recarregar página (`F5`)

**Mensagens esperadas (sem erros):**
```javascript
// Sem mensagens de erro vermelhas
// Opcionalmente, pode ver mensagens de debug do script
```

### **Teste 5: Verificar Network Tab**

1. Abrir DevTools (`F12`)
2. Ir para **Network tab**
3. Recarregar página (`F5`)

**Requests esperados (todos com status 200):**
```
Name                         Status  Type        Size
--------------------------------------------------
index.html                   200     document    4.2 KB
style.css                    200     stylesheet  11 KB
Hoopie-Logo_RGB_1-03.png     200     png         623 KB
script.js                    200     script      11 KB
registry.json?_=...          200     json        ~5 KB
```

Se algum tiver status **404** → Ficheiro não encontrado.
Se algum tiver status **0** ou **(failed)** → Servidor não responde.

---

## 🔥 Troubleshooting Avançado

### **Problema: Múltiplos Servidores em Conflito**

**Sintoma:** `ERR_EMPTY_RESPONSE` mesmo com servidor ativo.

**Diagnóstico:**
```bash
netstat -ano | findstr ":8001"
```

Se aparecerem **múltiplas linhas** com PIDs diferentes → Conflito.

**Solução:**
```bash
# 1. Listar todos os processos
netstat -ano | findstr ":8001"

# 2. Matar TODOS os processos
taskkill /F /PID [PID1]
taskkill /F /PID [PID2]
# ... repetir para todos

# 3. Esperar 5 segundos

# 4. Iniciar servidor limpo
cd C:\Users\pedraguiar\Documents\population_agent_v3\webroot
python -m http.server 8001
```

### **Problema: Firewall a Bloquear Porta**

**Sintoma:** Servidor inicia mas browser não conecta.

**Solução Windows:**
```bash
# Permitir Python no firewall
netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow program="C:\Python312\python.exe" enable=yes
```

### **Problema: Auto-refresh Não Funciona**

**Sintoma:** Página não atualiza sozinha após 30 segundos.

**Causa:** JavaScript `setInterval` desativado.

**Diagnóstico:**
```javascript
// Abrir Console (F12) e executar:
console.log('Interval:', window.RepositoryDebug);
```

**Solução:** Hard refresh da página.

---

## 📞 Ajuda Adicional

### **Informações Úteis para Debug**

Se precisares de ajuda, recolhe estas informações:

1. **URL acedido:**
   ```
   http://localhost:8001
   ```

2. **Output do netstat:**
   ```bash
   netstat -ano | findstr ":8001"
   ```

3. **Logs do servidor** (últimas 20 linhas do terminal)

4. **Erros da DevTools Console** (screenshot ou copy/paste)

5. **Network tab requests** (screenshot mostrando status codes)

6. **Versão do Python:**
   ```bash
   python --version
   ```

7. **Conteúdo do registry.json** (primeiras 50 linhas):
   ```bash
   head -50 data/registry.json
   ```

---

## ✅ Checklist Rápida

Antes de reportar problema, verifica:

- [ ] Servidor está a correr (`netstat -ano | findstr ":8001"`)
- [ ] Acedi via `http://localhost:8001` (não `file://`)
- [ ] Fiz hard refresh (`Ctrl + Shift + R`)
- [ ] Verifiquei DevTools Console (F12) - sem erros vermelhos
- [ ] `registry.json` existe e é válido JSON
- [ ] `index.html` existe na pasta webroot
- [ ] Não há múltiplos servidores na porta 8001

---

**Última Atualização:** 2025-12-04
**Versão:** 1.0
