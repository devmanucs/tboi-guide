# Basement Oracle

Aplicativo desktop local para consultar collectibles de The Binding of Isaac: Rebirth, Afterbirth e Afterbirth+ e acompanhar uma run manual.

## Desenvolvimento

Requer Node.js 22 ou superior e pnpm.

```powershell
pnpm install
pnpm dev
```

Comandos disponíveis: `pnpm typecheck`, `pnpm build` e `pnpm build:data`.

## Escopo atual

- Finder local por nome, ID, texto de efeito e tags.
- Tela Collection com filtros por item passivo/ativo.
- Run manual persistida em SQLite no diretório de dados do aplicativo.
- Interfaces iniciais para provider de estado e detector de itens; reconhecimento visual não está ativo.

O catálogo inicial contém apenas collectibles cujos nomes foram cruzados com IDs em `items.xml`. Pools e modificadores de atributos ficam vazios quando a fonte importada não os confirma. As imagens são carregadas dos links presentes na fonte e usam um fallback textual quando indisponíveis; o conteúdo e as buscas permanecem locais.

## Origem dos dados

`data/source-items.js` deriva do catálogo comunitário [The Finding of Isaac](https://github.com/MehYam/thefindingofisaac), que declara que seus dados foram coletados da wiki comunitária. `data/source-items.xml` deriva de [Ranclanclank/isaac](https://github.com/Ranclanclank/isaac). `scripts/build-dataset.ts` filtra apenas base, Afterbirth e Afterbirth+, remove a marcação HTML das descrições e mantém itens com ID cruzado pelo nome.

As descrições e imagens têm suas próprias fontes e direitos. Verifique os termos aplicáveis antes de distribuir o catálogo ou assets publicamente.

## Tradução pt-BR

`data/afterbirth-plus/items.pt-BR.json` contém nomes, descrições e tags em português brasileiro para o catálogo atual. O inglês original continua disponível para busca e identificação dos nomes usados no jogo.

As traduções foram geradas localmente com o modelo inglês → português brasileiro `translate-en_pb-1_9` do Argos Translate / OPUS-MT. O modelo é atribuído a Jörg Tiedemann e Santhosh Thottingal e declara licença CC-BY 4.0. O texto gerado por máquina pode precisar de revisão da comunidade, especialmente em nomes próprios e termos específicos da franquia.
