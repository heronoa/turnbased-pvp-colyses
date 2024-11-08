# Servidor de Jogo PvP

Este repositório contém o código para o servidor de um jogo PvP (Player vs Player) desenvolvido usando o framework [Colyseus.js](https://colyseus.io/), WebSocket, Express, TypeScript e o paradigma de orientação a objetos.

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Sobre o Projeto

Este projeto implementa o servidor de um jogo multiplayer de batalha PvP baseado em turnos. Ele utiliza o Colyseus para a criação e gestão de salas de jogo em tempo real, permitindo que múltiplos jogadores entrem em partidas e disputem entre si. A comunicação entre cliente e servidor é feita por WebSocket, oferecendo baixa latência nas interações.

## Funcionalidades

- Criação e gerenciamento de salas de jogo.
- Suporte para múltiplos jogadores em tempo real.
- Sincronização de estados entre clientes.
- Sistema de matchmaking para encontrar oponentes.
- Implementação de lógica de jogo orientada a objetos.
- Backend em Express para APIs e configuração de rotas auxiliares.

## Estrutura do Projeto

O projeto segue uma estrutura modular, baseada em pastas:

- **prisma/**: Diretório responsável pela configuração e gerenciamento do Prisma ORM.

  - **repositories/**: Contém os repositórios para acessar e manipular dados no banco de dados.
    - **dto/**: Diretório para Data Transfer Objects (DTOs), que facilitam a transferência de dados entre diferentes camadas da aplicação.
    - **entities/**: Contém as classes e interfaces que representam as entidades do banco de dados.
      - **characters.repository.ts**: Repositório para manipulação de dados da entidade de personagens.
      - **game.repository.ts**: Repositório para manipulação de dados da entidade de jogo.
      - **player.repository.ts**: Repositório para manipulação de dados da entidade de jogador.
      - **prismaClient.ts**: Configuração e instância do cliente Prisma para conexão com o banco de dados.
      - **user.repository.ts**: Repositório para manipulação de dados da entidade de usuário.
  - **schema.prisma**: Arquivo de definição do esquema do banco de dados no Prisma.

- **src/**: Diretório principal do código-fonte da aplicação.
  - **controllers/**: Contém os controladores que gerenciam as requisições e respostas da aplicação.
  - **middlewares/**: Contém os middlewares que interceptam e processam as requisições antes de serem tratadas pelos controladores.
  - **rooms/**: Diretório para a lógica das salas de jogo (provavelmente utilizando o Colyseus para gerenciar sessões de jogo multiplayer).
  - **routes/**: Define as rotas da aplicação, mapeando URLs para os controladores.
  - **services/**: Contém os serviços que encapsulam a lógica de negócios da aplicação.
  - **utils/**: Contém utilitários e funções auxiliares usadas em várias partes da aplicação.
  - **app.config.ts**: Configuração principal da aplicação.
  - **index.ts**: Ponto de entrada da aplicação.

## Tecnologias Utilizadas

- **Colyseus.js** - Framework para desenvolvimento de jogos multiplayer.
- **WebSocket** - Protocolo de comunicação para envio e recebimento de dados em tempo real.
- **Express** - Framework de servidor web para gerenciar rotas de API.
- **TypeScript** - Linguagem de programação para tipagem estática e melhor manutenção do código.
- **Orientação a Objetos** - Paradigma de programação para modelagem do mundo do jogo com classes e objetos.

## Pré-requisitos

- Node.js (>=16.x) de preferência Node.js 21.2.0
- MongoDB (para armazenamento de dados do jogo)

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/turnbased-pvp-colyseus.git
   cd turnbased-pvp-colyseus
   ```

2. Instale as dependências:

```bash
   npm install
```

## Uso

1. **Configurar variáveis de ambiente**: Crie um arquivo `.env` na raiz do projeto e adicione as configurações necessárias para o banco de dados, porta do servidor e outras variáveis específicas do projeto (veja a seção [Configuração do Ambiente](#configuração-do-ambiente)).

2. **Iniciar o servidor**: Para rodar o servidor em modo de desenvolvimento, utilize o seguinte comando:

   ```bash
   npm run dev
   ```

   O servidor ficará disponível em na porta **2567**.

3. **Acessar o servidor**: Você pode usar ferramentas como Postman ou diretamente o front-end do jogo para interagir com as rotas e funcionalidades do servidor.

## Scripts Disponíveis

Os seguintes scripts estão disponíveis para facilitar o desenvolvimento e a execução do servidor:

- **`npm start`**: Executa o servidor em modo de desenvolvimento com reinicialização automática usando Nodemon.
- **`npm run build`**: Compila o código TypeScript para JavaScript, gerando a saída na pasta `dist`.
- **`node dist/src/index.js`**: Inicia o servidor a partir do código JavaScript compilado na pasta `dist`.

## Configuração do Ambiente

Para configurar o ambiente, crie os arquivos `.env`, `.env.production` e `.env.development` na raiz do projeto e adicione as seguintes variáveis de ambiente conforme necessário:

```env
SAMPLE=development ou production
DATABASE_URL=mongodb://localhost:27017/meu-banco # URL de conexão com o banco de dados MongoDBretryWrites=true&w=majority&appName=colyseus-turngame"
SECRET=sua-chave-secreta # Chave secreta para autenticação e segurança
```

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo LICENSE para mais informações.
