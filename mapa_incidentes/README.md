# Mapa de Incidentes Global

Sistema de visualização de incidentes em mapa interativo usando Stadia Maps.

## Funcionalidades

- **Mapa Interativo**: Baseado em Leaflet.js com tiles do Stadia Maps
- **Pins com Cores Prioritárias**:
  - **P1** (Alta Prioridade): RGB(230,81,0) - Laranja/Vermelho
  - **P2** (Média Prioridade): RGB(255,234,0) - Amarelo
  - **Sem Incidentes**: RGB(2,136,209) - Azul
- **Priorização Inteligente**: Se uma localização tem múltiplos incidentes, a cor do pin segue a maior prioridade (P1 > P2 > Sem incidente)
- **Tooltips Informativos**: Clique nos pins para ver todos os incidentes da localização
- **Upload de JSON**: Carregue arquivos JSON com dados de incidentes

## Localizações Disponíveis

O mapa inclui as seguintes localizações:
- Germany (Alemanha)
- India (Índia)
- Japan (Japão)
- Romania (Romênia)
- Sweden (Suécia)
- USA (Estados Unidos)
- Korea (Coreia do Sul)
- France (França)
- China (China)
- Canada (Canadá)

## Como Usar

1. **Abrir o Site**: Abra o arquivo `index.html` em um navegador web moderno

2. **Carregar Incidentes**:
   - Clique no botão "Carregar JSON de Incidentes"
   - Selecione um arquivo JSON com o formato correto (veja exemplo abaixo)
   - Os pins serão atualizados automaticamente

3. **Visualizar Incidentes**:
   - Clique em qualquer pin para ver os incidentes dessa localização
   - A cor do pin indica a prioridade máxima dos incidentes

4. **Limpar Dados**:
   - Clique em "Limpar Incidentes" para resetar o mapa

## Formato do JSON

O arquivo JSON deve conter um array de objetos com a seguinte estrutura:

```json
[
    {
        "location": "Germany",
        "priority": "P1",
        "description": "Descrição do incidente"
    },
    {
        "location": "USA",
        "priority": "P2",
        "description": "Outro incidente"
    }
]
```

### Campos:
- **location** (obrigatório): Nome da localização (deve corresponder às localizações disponíveis)
- **priority** (obrigatório): "P1" ou "P2"
- **description** (opcional): Descrição detalhada do incidente

## Exemplo de Uso

Um arquivo de exemplo (`example_incidents.json`) está incluído no projeto. Use-o para testar o sistema:

```json
[
    {
        "location": "Germany",
        "priority": "P1",
        "description": "Falha crítica no servidor principal"
    },
    {
        "location": "USA",
        "priority": "P2",
        "description": "Alta latência nas conexões"
    }
]
```

## Lógica de Priorização

O sistema segue a seguinte lógica para determinar a cor do pin:

1. Se houver **qualquer incidente P1** na localização → Pin **Laranja/Vermelho**
2. Se **não houver P1** mas houver **P2** → Pin **Amarelo**
3. Se **não houver incidentes** → Pin **Azul**

## Tecnologias Utilizadas

- **Leaflet.js**: Biblioteca de mapas interativos
- **Stadia Maps**: Provedor de tiles de mapa
- **HTML5/CSS3/JavaScript**: Interface e lógica do site

## Estrutura de Arquivos

```
mapa_incidentes/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── app.js                  # Lógica JavaScript
├── example_incidents.json  # Exemplo de dados
└── README.md              # Esta documentação
```

## Notas

- O mapa requer conexão com a internet para carregar os tiles do Stadia Maps
- A API Key do Stadia Maps está configurada no arquivo `app.js`
- Suporta navegadores modernos (Chrome, Firefox, Edge, Safari)
