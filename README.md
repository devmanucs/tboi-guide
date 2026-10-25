# Basement Oracle

Aplicativo desktop local para consultar collectibles de The Binding of Isaac: Rebirth, Afterbirth e Afterbirth+ e acompanhar uma run manual.

## Desenvolvimento

Requer Node.js 22 ou superior e pnpm.

```powershell
pnpm install
pnpm dev
```

Comandos disponíveis: `pnpm typecheck`, `pnpm build` e `pnpm build:data`. `pnpm dev:web` abre só a interface num navegador comum (porta 5199), com uma API falsa que salva a run no `localStorage` — útil para mexer no visual sem o Electron.

## Escopo atual

- **Run ao vivo (modo rápido):** escolha o personagem, digite o nome do item que aparece no Switch (em inglês ou português, com erros de digitação) e ele é equipado na ficha do personagem — ativo, trinket e passivos/familiares. Corações, moedas, bombas, chaves e andar ficam no mesmo card.
- **Pesquisa rápida:** `Ctrl+K` (ou `/`) em qualquer tela; `Enter` adiciona à run, `Ctrl+Enter` abre no catálogo.
- **Catálogo** com filtros por tipo (passivos, ativos, familiares, trinkets, na run) e ordenação.
- Efeitos sonoros sintetizados na hora (Web Audio, nenhum áudio do jogo); `Ctrl+M` liga/desliga.
- Outros atalhos: `Ctrl+1` / `Ctrl+2` trocam de tela, `Ctrl+F` foca o filtro do catálogo.
- Run persistida em SQLite no diretório de dados do aplicativo.
- Interfaces iniciais para provider de estado e detector de itens (base para um futuro modo com captura via SysDVR); reconhecimento visual não está ativo.

O catálogo contém collectibles (incluindo familiares e Booster Packs, que vêm na versão do Switch) e trinkets, com IDs cruzados pelo nome com `items.xml`; os poucos que faltam no XML têm o ID conferido na wiki (`knownIds` em `scripts/build-dataset.ts`). Trinkets usam `id = 10000 + ID do jogo` internamente, já que os números colidem com os collectibles. Pools e modificadores de atributos ficam vazios quando a fonte importada não os confirma. As imagens de itens e personagens são carregadas dos links da wiki comunitária e usam um fallback textual quando indisponíveis; o conteúdo e as buscas permanecem locais.

## Origem dos dados

`data/source-items.js` deriva do catálogo comunitário [The Finding of Isaac](https://github.com/MehYam/thefindingofisaac), que declara que seus dados foram coletados da wiki comunitária. `data/source-items.xml` deriva de [Ranclanclank/isaac](https://github.com/Ranclanclank/isaac). `scripts/build-dataset.ts` filtra apenas base, Afterbirth e Afterbirth+, remove a marcação HTML das descrições e mantém itens com ID cruzado pelo nome.

As descrições e imagens têm suas próprias fontes e direitos. Verifique os termos aplicáveis antes de distribuir o catálogo ou assets publicamente.

## Tradução pt-BR

`data/afterbirth-plus/items.pt-BR.json` contém nomes, descrições e tags em português brasileiro para todo o catálogo. O inglês original continua disponível para busca e identificação dos nomes usados no jogo.

As traduções dos 409 collectibles originais foram geradas localmente com o modelo inglês → português brasileiro `translate-en_pb-1_9` do Argos Translate / OPUS-MT. O modelo é atribuído a Jörg Tiedemann e Santhosh Thottingal e declara licença CC-BY 4.0. O texto gerado por máquina pode precisar de revisão da comunidade, especialmente em nomes próprios e termos específicos da franquia. As traduções dos familiares, trinkets e itens dos Booster Packs (sem `localizedTags`) foram escritas à mão.
