# Multi-Platform Chatbot - TODO

## Fase 1: Arquitetura e Schema
- [x] Definir arquitetura técnica completa
- [x] Criar migrations do banco de dados
- [x] Implementar schema com Drizzle ORM

## Fase 2: Backend - Webhooks e Processamento
- [x] Implementar handler de webhooks WhatsApp (Evolution API)
- [x] Implementar handler de webhooks Instagram (Meta Graph API)
- [x] Criar serviço de validação de webhooks
- [ ] Implementar cliente Evolution API (envio de mensagens)
- [ ] Implementar cliente Meta Graph API (envio de mensagens)
- [x] Criar serviço de processamento de mensagens
- [x] Implementar lógica de chatbot com regras baseadas em palavras-chave
- [x] Integrar LLM para geração de sugestões de resposta
- [x] Implementar sistema de notificações (e-mail + in-app)
- [x] Criar tRPC procedures para gerenciamento de mensagens

## Fase 3: Frontend - Dashboard Principal
- [x] Criar layout do dashboard com sidebar
- [x] Implementar visão geral de conversas ativas
- [x] Implementar métricas de atendimento
- [x] Implementar status das integrações
- [x] Criar componente de lista de conversas com filtros
- [x] Implementar visualização de histórico de conversa (chat com bolhas)
- [x] Implementar exibição de sugestões LLM
- [x] Criar componente de envio de mensagens (manual)

## Fase 4: Frontend - Gerenciamento de Contatos
- [x] Criar página de gerenciamento de contatos
- [x] Implementar listagem de contatos com filtros
- [x] Exibir informações: nome, plataforma, última interação, status
- [ ] Implementar busca de contatos
- [ ] Criar visualização de histórico completo por contato

## Fase 5: Frontend - Painel de Configurações
- [x] Criar página de configurações
- [x] Implementar formulário de credenciais Evolution API (WhatsApp)
- [x] Implementar formulário de credenciais Meta Graph API (Instagram)
- [x] Criar gerenciador de regras de chatbot
- [x] Implementar interface para criar/editar/deletar regras
- [x] Criar configurador de limites de notificação
- [x] Implementar toggle de notificações por e-mail

## Fase 6: Automação de Chatbot
- [x] Implementar processamento de regras de chatbot
- [ ] Implementar envio automático de respostas
- [ ] Criar interface para visualizar respostas automáticas enviadas
- [ ] Implementar histórico de automações

## Fase 7: Integração com LLM
- [x] Implementar chamadas à API de LLM (Manus Forge)
- [x] Criar prompts otimizados para sugestões de resposta
- [ ] Implementar cache de sugestões
- [x] Criar interface para revisar e enviar sugestões

## Fase 8: Notificações
- [x] Implementar envio de e-mails via Manus Notification API
- [ ] Implementar notificações in-app em tempo real
- [x] Criar sistema de logs de notificações
- [x] Implementar configuração de threshold de mensagens não respondidas

## Fase 9: Testes e Ajustes
- [ ] Testar webhooks WhatsApp
- [ ] Testar webhooks Instagram
- [ ] Testar envio de mensagens
- [ ] Testar automação de chatbot
- [ ] Testar sugestões de LLM
- [ ] Testar notificações
- [ ] Testar fluxo completo end-to-end

## Fase 10: Documentação e Deploy
- [ ] Criar guia de configuração Evolution API
- [ ] Criar guia de configuração Meta Graph API
- [ ] Criar guia de setup de webhooks
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de uso da plataforma
- [ ] Preparar para deploy em produção

