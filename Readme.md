# Removedor de Blocos

Jogo 3D desenvolvido com **three.js** para o **Tema 5 – Removedor de Blocos**, a partir do exemplo oficial [`webgl_interactive_cubes_ortho`](https://threejs.org/examples/webgl_interactive_cubes_ortho.html).

O jogador deve clicar **somente nos blocos da cor pedida** no topo da tela. Acertar dá pontos (com combo); errar tira pontos e segundos do relógio. A cada poucos segundos o jogo pausa e oferece **cartas de melhoria** no estilo roguelike.

## Equipe

| Integrante | Responsável por | Arquivos |
|---|---|---|
| **Bruno** | Câmera, loop principal e blocos personalizados com cores aleatórias | `js/main.js`, `js/blocks.js` |
| **Gabriela** | Regras do jogo: modos, próxima cor, pontuação, combo, fim de jogo e melhorias roguelike | `js/game.js` (e `js/cards.js`, as cartas) |
| **Derick** | Interface: menu, escolha de modo, HUD, cartas na tela, tela final e estilos | `js/ui.js`, `css/style.css`, `index.html` |
| **Danilo** | Tempo limite e ranking com os melhores resultados | `js/ranking.js`, `js/timer.js` |
| **Marcos William** | Ambiente 3D: fundo, luzes, plataforma e estruturas | `js/environment.js` |

## Requisitos do trabalho

| Requisito | Como foi atendido |
|---|---|
| Melhorar o ambiente 3D (blocos personalizados, fundo e estruturas) | Blocos arredondados com cores e escalas variadas, fundo com estrelas, plataforma, grade, pilares e anéis |
| Sistema de pontuação | Pontos por acerto com combo e multiplicador por modo, penalidade por erro e bônus de tempo ao vencer |
| Escolha do modo ao iniciar | Menu com Easy, Medium e Hard |
| Blocos de cores aleatórias e próxima cor a remover | Cores sorteadas ao iniciar; a cor pedida é sorteada entre as que ainda existem |
| Ranking | Top 10 salvo no `localStorage`, ordenado por pontos e, no empate, por menor tempo |
| Tempo limite | Cronômetro regressivo; o jogo termina quando chega a zero |

## Como rodar

Os módulos ES precisam de um servidor local, então **não funciona com duplo clique** no `index.html`.

- **VS Code:** instale a extensão **Live Server** e clique em "Go Live".
- **Terminal:** na pasta do projeto, rode `python -m http.server 8000` e abra http://localhost:8000.
- **GitHub Pages:** em *Settings > Pages*, escolha a branch `main` e a pasta `/ (root)`.

É necessário ter internet, pois o three.js é carregado pelo CDN jsDelivr.

## Como jogar

1. Digite seu nome e escolha o modo.
2. Veja no topo qual cor deve ser removida e clique nos blocos dessa cor.
3. Passe o mouse sobre os blocos para destacá-los e clique para remover.
4. A cada acerto uma nova cor é sorteada. Remova todos os blocos antes que o tempo acabe.
5. Ao final, seu resultado entra no ranking se estiver entre os 10 melhores.

## Modos de jogo

| Modo | Blocos | Cores | Tempo | Penalidade por erro | Multiplicador |
|---|---|---|---|---|---|
| Easy | 30 | 4 | 100 s | −3 s | ×1 |
| Medium | 45 | 6 | 90 s | −5 s | ×1,5 |
| Hard | 60 | 8 | 90 s | −8 s | ×2 |

Para mudar a dificuldade, edite `MODES` em `js/game.js`.

## Pontuação

- **Acerto:** `(100 + 10 × combo) × multiplicador do modo`, com o combo contando até 10.
- **Erro:** perde 50 pontos, perde os segundos da penalidade do modo e o combo volta a zero.
- **Vitória:** bônus de `segundos restantes × 10 × multiplicador do modo`.

## Melhorias roguelike

Em tempo aleatório (entre 12 e 22 segundos de jogo) o jogo pausa e oferece **2 cartas** sorteadas. O jogador escolhe uma e a partida continua. As melhorias ativas aparecem no HUD com seu nível.

| Carta | Efeito | Acúmulo máximo |
|---|---|---|
| 💥 Golpe duplo | Cada acerto quebra +1 bloco da cor pedida | 3 |
| 🧨 Explosão | Acertos também quebram vizinhos da mesma cor | 2 |
| 🐌 Câmera lenta | O relógio corre 30% mais devagar | 3 |
| ⏳ Ampulheta | +2 s a cada acerto | 3 |
| 🛡️ Escudo | Bloqueia o próximo erro | 3 |
| 👁️ Raio-X | Blocos de outras cores ficam translúcidos | 1 |
| 🔥 Combo | +50% de pontos em cada acerto | 3 |
| 🕒 Tempo extra | +10 segundos na hora | sem limite |

Para criar ou ajustar melhorias, edite `UPGRADES` em `js/cards.js` e o efeito correspondente em `js/game.js`.

## Estrutura do projeto

```
removedor-de-blocos/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── main.js          câmera, loop e ligação entre os módulos
    ├── environment.js   fundo, luzes, plataforma e estruturas
    ├── blocks.js        criação dos blocos e efeito Raio-X
    ├── game.js          regras, modos, pontuação e melhorias
    ├── cards.js         lista de melhorias e sorteio das cartas
    ├── ui.js            menu, HUD, cartas e tela final
    ├── timer.js         cronômetro regressivo
    └── ranking.js       ranking salvo no localStorage
```

## Tecnologias

- JavaScript (módulos ES)
- [three.js](https://threejs.org/) r170
- HTML5 e CSS3
