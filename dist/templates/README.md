Coloque seus templates `.docx` nesta pasta.

Arquivos esperados por padrao:

- `template-padrao.docx`
- `template-alternativo.docx`

Use no Word as variaveis abaixo.

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

Observacao:

- `{%image}` precisa estar sozinho no paragrafo.
