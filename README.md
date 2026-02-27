# Criador de DFTs (React + Vite)

Aplicacao web para gerar documentos `.docx` a partir de template Word e formulario dinamico.

## Funcionalidades

- Campos organizados por secao (Cabecalho Analista, Descricao, Passo a Passo, Analise)
- Dados automaticos enviados ao template: `{mesAtual}` e `{anoAtual}`
- Passo a Passo com loop de imagens
- Analise com blocos de texto e imagem, com ordenacao por arraste
- Validacao de obrigatoriedade
- Persistencia temporaria em `localStorage`
- Download automatico do documento final

## Executar localmente

```bash
npm install
npm run dev
```

## Variaveis no template Word

Dados automaticos:

- `{mesAtual}`
- `{anoAtual}`

Cabecalho Analista:

- `{nomeAnalista}`
- `{data}`
- `{nomeDFT}`
- `{celAnalista}`
- `{emailAnalista}`

Descricao:

- `{descricao}`
- `{perfilOperador}`
- `{loginOperador}`
- `{jornada}`
- `{tipoContrato}`
- `{cpfCliente}`
- `{casoSolar}`
- `{chamadoOperador}`

Passo a Passo:

```text
{#passoapasso}
{%image}
{/passoapasso}
```

Analise:

```text
{#analise}
{#hasText}{text}{/hasText}
{#hasImage}
{%image}
{/hasImage}
{/analise}
```

Importante:

- `{%image}` deve ficar sozinho no paragrafo.

## Estrutura

- `src/components`: componentes de formulario e preview
- `src/services`: geracao de `.docx` e armazenamento local
- `src/utils`: validacoes
- `src/config`: configuracao de campos e templates
