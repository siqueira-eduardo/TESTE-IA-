# Agenda App — Calendário e Eventos

Aplicação web de calendário para cadastrar, consultar, editar e excluir eventos, com visualizações mensal, semanal e diária.

## Funcionalidades identificadas no código

- Visualização mensal, semanal e diária.
- Navegação entre períodos e retorno à data atual.
- Cadastro, edição e exclusão de eventos.
- Busca por título e descrição.
- Painel de análise dos eventos.
- Interface para sincronização com Google Sheets.
- Persistência local dos eventos no navegador por meio de `localStorage`.
- Verificação periódica de eventos próximos e tentativa de notificação do navegador.

## Tecnologias identificadas

- React
- TypeScript
- Vite
- Tailwind CSS
- date-fns
- lucide-react
- Recharts
- Google Gemini SDK listado nas dependências
- Firebase listado nas dependências

> A presença de uma dependência no projeto não significa, por si só, que ela esteja integrada a todas as funcionalidades. A sincronização com Google Sheets depende da configuração e autorização da conta Google.

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

O Vite inicia o ambiente de desenvolvimento na porta 3000, conforme configuração do projeto.

Para verificar os tipos TypeScript:

```bash
npm run lint
```

Para gerar a versão de produção:

```bash
npm run build
```

## Armazenamento e privacidade

- Os eventos são armazenados no `localStorage` do navegador.
- Os dados ficam vinculados ao navegador e dispositivo utilizados; não há evidência, no hook de eventos revisado, de sincronização automática desses registros com um banco remoto.
- Limpar os dados do navegador pode remover os eventos armazenados localmente.
- Evite inserir informações pessoais sensíveis em ambientes compartilhados.

## Estado do projeto

Projeto experimental. A documentação foi elaborada a partir da estrutura de código disponível no repositório. Antes de considerar a aplicação pronta para produção, é necessário testar os fluxos de eventos, notificações, análise e integração com Google Sheets.

---
Projeto de estudo em React e TypeScript.
