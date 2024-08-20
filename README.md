## Instação

1. Baixe o código fonte do projeto em:

```bash
git@github.com:projeto-integrador-tads/node-backend.git
```

2. Baixe as dependências com:

```bash
npm install
```

3. Configure o arquivo `.env` com as variáveis de ambiente:

```bash
DATABASE_URL = "SEU_ENDEREÇO_MYSQL"
GOOGLE_MAPS_API_KEY = "SUA_API_DO_GOOGLE_MAPS"
MAIL_SERVICE_USER = "SEU_USUÁRIO_DO_SERVIÇO_DE_EMAIL"
MAIL_SERIVCE_PASS = "SUA_SENHA"
MAIL_SERVICE_HOST = "HOST_DO_SERVIÇO_DE_EMAIL"
```

Há uma estrutura pronta no arquivo `.env.example` na pasta raiz do projeto.

4. Execute o projeto com:

```bash
npm run dev
```

O projeto iniciará na porta `3000`
