---
trigger: always_on
description: "Documento de Arquitetura e Implementação - Desafio KeyCore"
---

# Documento de Arquitetura e Implementação

## 1. Visão geral do sistema

**Objetivo do Projeto:** Construir um sistema automatizado capaz de capturar fluxo de conversas do WhatsApp, processá-las e traduzi-las em dados estruturados sobre perfil comportamental.
**Problema que resolve dentro do desafio da KeyCore:** Transformar mensagens de grupos em inteligência estruturada, extraindo emoções, intenções e até 7+ skills dinâmicas para gerar perfis de usuários.
**Stack principal:** Evolution API (integração WhatsApp) + ChatGPT API (análise por IA) + Supabase (banco de dados/persistência) + Node.js/TypeScript (backend/workers).

## 2. Escopo funcional

**O que o sistema faz ponta a ponta:**

- Conecta-se ao WhatsApp via Evolution API.
- Captura e recebe mensagens do grupo em tempo real por meio de webhooks.
- Armazena as mensagens e dados do autor no Supabase.
- Processa cada mensagem usando a IA (ChatGPT API) para inferir emoção predominante, listar intenções e calcular ajustes (deltas) nas skills do usuário.
- Atualiza dinamicamente o perfil e a pontuação nas skills (exigência de no mínimo 10 skills).
  **O que não está no escopo:** Construção de interfaces (UI) excessivamente complexas ou autenticação avançada de múltiplos tenants, priorizando a robustez do pipeline de dados e inteligência.
  **Requisitos atendidos do desafio (1–8 do README):** Captura de grupo, persistência no banco, análise de IA, identificação de emoção e intenção, atribuição de pelo menos 10 skills com perfis dinâmicos.

## 3. Arquitetura de alto nível

### 3.1 Diagrama (visão texto)

1. **Origem:** Usuário envia uma mensagem no grupo do WhatsApp.
2. **Gateway:** A Evolution API capta a mensagem e dispara um webhook.
3. **Ingestão:** O Backend/Webhook Handler recebe o evento e grava os dados brutos de imediato no Supabase.
4. **Enfileiramento:** Um pipeline (worker) seleciona as mensagens pendentes e as envia para análise na API da OpenAI.
5. **Processamento (IA):** O ChatGPT retorna um output estruturado (JSON) constando emoção primária, intenções comportamentais e atualizações de skills (skills delta).
6. **Agregação:** O sistema consolida o delta persistindo as tabelas derivadas e o histórico do usuário no Supabase.
7. **Consumo:** Uma API REST/Frontend expõe os dados agregados dos participantes do grupo.

### 3.2 Componentes

- **Evolution API:** Gateway local ou remoto para manuseio do canal WhatsApp.
- **Serviço de Ingestão:** Webhook ágil para rápida inserção (evita timeouts).
- **Worker de IA:** Consumidor assíncrono projetado para integrar a IA, lidando com retentativas, prompts e delays de API.
- **Supabase:** Gerenciador do banco de dados relacional (PostgreSQL) para persistência segura e acesso de alta performance.
- **API/Frontend/Dashboard:** (Opcional) Visualização simples e direta.

## 4. Modelagem de dados (Supabase)

### 4.1 Tabelas principais

- **`users`**: `id` (PK), `whatsapp_id` (Unique), `name`, `created_at`
- **`messages`**: `id` (PK), `user_id` (FK), `content`, `timestamp`, `raw_payload`, `status` (pending/processed/error)
- **`emotions`**: `id` (PK), `message_id` (FK), `primary_emotion`, `score`, `model_version`
- **`intentions`**: `id` (PK), `message_id` (FK), `intention_type`, `score`, `model_version`
- **`user_skills`**: `id` (PK), `user_id` (FK), `skill_name`, `score`, `updated_at`
- **`skill_history`** (opcional para tracking): `id` (PK), `user_id` (FK), `skill_name`, `delta`, `reason`, `message_id` (FK)

### 4.2 Relações e estratégias

- **1:N** entre `users` e `messages`.
- **1:1** ou **1:N** entre `messages` e inferências (emoções/intenções).
- **Índices importantes:** Necessários em `user_id` nas tabelas `messages` e `user_skills`, além do `message_id` e timestamp (`created_at`).

## 5. Integração com Evolution API

### 5.1 Fluxo de mensagens

- O servidor expõe uma rota (ex: `POST /webhooks/evolution`).
- O payload traz meta-informações importantes como sender ID e timestamps.
- Os campos úteis são mapeados para criação/identificação imediata do Usuário e persistência bruta da Mensagem.

### 5.2 Tratamento de erros

- Casos de Webhooks duplicados são mitigados por Constraints exclusivas (Unique id de mensagem nativo do zap).
- Utilização de estratégia Dead Letter Queue/Status de Reprocessamento no banco.

## 6. Integração com ChatGPT API

### 6.1 Objetivo da IA

- **Identificar:** 1 emoção primária por mensagem com score.
- **Classificar:** Intenções do usuário com base em padrões de linguagem.
- **Gerar Ajustes:** Emitir deltas quantitativos apontando quais e como as skills do autor mudaram.

### 6.2 Modelo & endpoint

- Utilizaremos os endpoints oficiais (`/v1/chat/completions`) com o recurso de **Structured Outputs**.
- Sugestão: `gpt-4o-mini` - ótimo custo, menor latência, atende completamente necessidades estruturais usando JSON Mode.

### 6.3 Contrato de entrada/saída

Entrada engloba contexto da mensagem associado ao histórico (em formato resumido) e um prompt delimitando o formato de resposta obrigatório:

```json
{
  "emotion": { "label": "alegria", "score": 0.92 },
  "intentions": [{ "label": "colaboracao", "score": 0.81 }],
  "skills_delta": [
    {
      "skill": "comunicacao_assertiva",
      "delta": 0.1,
      "reason": "Sugeriu uma solucao clara."
    }
  ]
}
```

### 6.4 Prompt engineering

O **Prompt Base** incluirá instruções estritas para pontuações, tipos de comportamentos desejáveis e o JSON Schema para guiar o response e inibir alucinações de formato.

## 7. Pipeline de processamento

### 7.1 Ingestão

- A mensagem recebida do webhook deve ser guardada apenas com dados fundamentais de forma síncrona, configurando seu status como `RAW` ou `PENDING`, retornando HTTP 200 rápido à Evolution.

### 7.2 Processamento assíncrono

- Um Worker puxa mensagens com o status `PENDING`, faz a requisição pro modelo (esperar rate-limits se preciso). Em caso de sucesso, seta a mensagem para `PROCESSED`.

### 7.3 Agregação de skills

- Após consolidar a reposta JSON, a pontuação existente em `user_skills` é somada com o campo `delta`. É importante normalizar o Score resultante (ex: Min: 0.0 e Max: 100.0).

## 8. API/Frontend

### 8.1 Endpoints principais

- `GET /api/users`: Retorna participantes gerais.
- `GET /api/users/:id`: Overview de skills do participante.
- `GET /api/messages`: Histórico atrelado com intenções/emoções para feed ou auditoria.

### 8.2 Visualização

- Tela simples e minimalista exibindo lista de participantes. Ao clicar em um nome, a interface revela suas habilidades top rate, emoções e radar.

## 9. Segurança e configuração

- Proteção de secrets em `.env` que jamais sobem pro Github (adicionado à raiz do `.gitignore`).
- Exemplo das chaves necessárias fornecidas em um arquivo `.env.example`.
- Garantir que a comunicação do webhook aconteça com validação básica no Payload/Token.

## 10. Deploy e execução

### 10.1 Ambiente de desenvolvimento

- Subida de projeto configurada para utilitários simples (ex. Node.js `npm run dev`), banco configurado no Supabase web e migrações SQL localizadas neste repo.

### 10.2 Ambiente de produção

- A ser hospedado na Vercel / Railway dependendo do framework, consumindo o banco de dados oficial configurado no Supabase.

## 11. Logs, monitoramento e métricas

- Todos os requests ao OpenAI ou erros de banco recebem loggers com context ID.
- Pode-se analisar custos na platadorma OpenAI de acordo com a distribuição de token da pipeline.

## 12. Decisões técnicas

- A escolha pelo **Evolution API**: É extremamente prática para testes e integrações locais/nuvem em WhatsApp sem atritos do Meta Cloud oficial para protótipos.
- **Supabase**: Dispensa a modelagem do backend complexo de CRUD imediato, acelerando do design da DB à consumação em aplicações client-side de forma reativa.
- **TypeScript + Node**: Velocidade, verificação de tipagem estática nos contratos JSON que transitam do GPT e ecossistema abundante.

## 13. Próximos passos / roadmap

- Iniciar a implementação das migrations e criação do SQL para estruturar a modelagem no Supabase.
- Construir a primeira integração testando Webhooks com Evolution API usando Ngrok localmente.
- Estruturar o boilerplate do Worker assíncrono e prompts iniciais.

## 14. Anexos

A incluir iterativamente:

- Prompts brutos validados na OpenAI;
- Scripts DDL em SQL das execuções do banco.
