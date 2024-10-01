# Node Backend - Projeto Integrador

## Instalação

1. Clone o repositório:

```bash
git clone git@github.com:projeto-integrador-tads/node-backend.git
cd node-backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

- Copie o arquivo `.env.example` para `.env` e `.env.test`:

```bash
cp .env.example .env
cp .env.example .env.test
```

- Edite os arquivos `.env` e `.env.test` com as configurações apropriadas para cada ambiente.

4. Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

5. Para rodar o projeto em modo de desenvolvimento:

```
npm run dev
```

O servidor iniciará na porta 3000.

## Scripts disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload.
- `npm run lint`: Executa o linter para verificar o código.
- `npm test`: Executa os testes unitários.
- `npm run migrate:test`: Executa as migrações do banco de dados de teste.

## Ambiente de Testes

Para executar os testes, certifique-se de que o arquivo `.env.test` está configurado corretamente. Os testes utilizam um banco de dados separado para evitar conflitos com o ambiente de desenvolvimento.

## Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente. Certifique-se de configurá-las corretamente nos arquivos `.env` e `.env.test`:

```bash

NODE_ENV=development
DATABASE_URL=mysql://usuario:senha@localhost:3306/nome_do_banco
GOOGLE_MAPS_API_KEY=sua_chave_api_google_maps
MAIL_SERVICE_USER=seu_email@example.com
MAIL_SERVICE_PASS=sua_senha_email
MAIL_SERVICE_HOST=smtp.example.com
MAIL_SERVICE_PORT=587
JWT_SECRET=sua_senha_jwt
AWS_ACCESS_KEY_ID=sua_chave_acesso_aws
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
AWS_REGION=sua_regiao_aws
BUCKET_NAME=seu_nome_bucket_s3
```

Substitua os valores entre aspas pelas suas configurações reais.

## Estrutura do Projeto

O projeto segue uma estrutura modular:

- `src/`: Contém o código-fonte principal
  - `config/`: Configurações do aplicativo
  - `models/`: Modelos de dados e lógica de negócios
  - `services/`: Serviços externos (e-mail, AWS, etc.)
  - `utils/`: Funções utilitárias
  - `plugins/`: Plugins do Fastify
  - `events/`: Manipuladores de eventos
- `tests/`: Testes unitários e de integração
