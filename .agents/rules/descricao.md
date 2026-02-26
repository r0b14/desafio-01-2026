---
trigger: always_on
description: "Descrição geral e regras contextuais do projeto KeyCore Tech Challenge"
---

# Antigravity – Regras Gerais e Descrição do Projeto

Este documento funciona como a fonte da verdade para o contexto geral do projeto. Qualquer nova funcionalidade, script ou documentação deve estar alinhada aos princípios descritos aqui.

## 1. O Problema e a Solução

**O Problema Real:** Conversas diárias, especialmente em grupos (como o WhatsApp), contêm sinais comportamentais implícitos. Padrões emocionais, combinados com intenções e recorrência, formam os traços comportamentais das pessoas.
**A Solução:** O objetivo principal do sistema é capturar esse fluxo conversacional e transformá-lo em **inteligência estruturada**, em tempo quase real, traduzindo mensagens abertas em perfis qualitativos de usuários.

## 2. Requisitos de Ouro (O Desafio)

O sistema _obrigatoriamente_ deve ser capaz de:

1. Criar ou conectar-se a um grupo no WhatsApp.
2. Capturar todas as mensagens enviadas nesse grupo com identificação dos seus autores.
3. Armazenar o volume bruto de conversas de forma estruturada.
4. Analisar sistematicamente cada nova mensagem na fila utilizando IA (ChatGPT API/OpenAI).
5. Identificar **emoções predominantes** (ex: Alegria, Frustração) e o score de confiança associado.
6. Detectar **intenções comportamentais** expressadas pelo envio (ex: Liderança, Suporte, Análise crítica).
7. Gerar e atualizar automaticamente um **perfil comportamental por usuário**.
8. Inferir e manter um quadro de **pelo menos 7 skills (habilidades) rastreáveis** por participante, recalibrando seus scores (`delta`) em cada nova participação produtiva.

## 3. Diretrizes de Desenvolvimento e Restrições

- **Foco Core (Backend/Pipeline):** O maior valor da entrega está na robustez da ingestão via evento, na qualidade do prompt que extrai os dados do texto, e em como processamos as skills de forma transacional. Construções de UI avançadas e autenticação intrínseca de complexo multitenancy são secundários.
- **Agilidade Arquitetural:** Entregue primeiro os motores cruciais funcionando perfeitamente ponta a ponta. Priorize escalabilidade no processamento assíncrono sobre rebuscamento extremo de design logo no princípio.
- **Segurança (Zero-Trust):** Jamais adicione tokens, chaves `API_KEY` (OpenAI, Evolution API, Supabase) puras no repositório GitHub. Utilize abordagens de `.env` que contêm no máximo um `.env.example`.
- **Idioma:** Exclusivamente em português brasileiro (pt-BR) nas regras de resposta da interface, de commits e documentações.

## 4. Stack Tecnológico Base

A arquitetura de código, scripts base e utilitários que gerarmos devem alinhar-se à stack escolhida:

- **Canal/Origem:** Evolution API (processado proativamente via webhooks).
- **Backend API/Workers:** Node.js com TypeScript integrados visando consistência em payloads JSON tipados.
- **Ingestão/Armazenamento:** Supabase (Banco lógico para tabelas relacionais de processamento de fluxos contínuos).
- **Inteligência e Processamento NLP:** Modelos da família ChatGPT (sugerido `gpt-4o-mini`) focados em extrações rígidas em **JSON Mode** ou recursos de **Structured Outputs**.
- **Publicação:** Plataformas focadas em ecossistema Node, tais como Railway, Render ou Vercel.

## 5. Diferenciais Almejados Ativamente (Best Practices)

Nosso código deve prever ou construir desde já espaço para:

- **Resiliência:** A chamada para a LLM (que tem latência maior) jamais deve prender e engasgar a thread de aceitação do endpoint do webhook disparado pela Evolution API. Recebemos, confirmamos inserção com 200/OK no banco, enfileiramos ou rodamos um loop e só aí entra a inferência na IA.
- **Qualidade do AI Agent:** Prompts com versionamento semântico no banco e limitação fina das calibrações de skills (com o IA retornando pequenos deltas flutuantes como `+0.05` em Liderança).
- **Métricas:** Deixar claro em logs quando houve timeouts de rede ou falhas sistêmicas por conta de JSON corrompidos.

## 6. Papel de Assistência do Antigravity / IA Local

Toda vez que uma nova rota, tabela (SQL) ou serviço HTTP for montado pelo código:

1. Certificar que adere ao manifesto de ingestão passiva → IA processa de forma secundária → Transação soma os novos valores da pessoa sem sobrescrever destrutivamente o histórico dela.
2. Certificar que respeita estritamente o modelo de persistência do Supabase, o modelo de `messages`, `intentions`, `user_skills` e as inferências associadas às foreign keys do usuário.
