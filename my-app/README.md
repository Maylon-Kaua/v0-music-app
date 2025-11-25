# SoundSpace - App de Música Colaborativo

Um aplicativo de música moderno e **100% independente**, sem necessidade de autenticação externa ou configuração de APIs. Inspirado no hang.fm, permite upload de músicas, efeitos de áudio espacial 8D/16D, equalizador profissional e reprodução em grupo.

## Características Principais

- **Sistema de Login Multi-Usuário**: Login simples sem necessidade de senha
- **Upload de Músicas**: Adicione músicas por arquivo ou URL
- **Importação de Playlists do Spotify**: Importe playlists públicas ou conecte sua conta para importar todas as suas playlists (opcional)
- **Efeitos Espaciais**: Efeitos 8D e 16D com Web Audio API
- **Equalizador de 10 Bandas**: Controle total sobre todas as frequências
- **Jam Sessions**: Salas colaborativas com códigos compartilháveis
- **Queue Colaborativa**: Gerencie filas de reprodução em grupo
- **Totalmente Exportável**: Funciona em qualquer servidor, não apenas Vercel

## Requisitos

- Node.js 18+ ou superior
- Navegador moderno com suporte a Web Audio API

## Instalação e Uso no Linux

### Método 1: Desenvolvimento Local

\`\`\`bash
# Clone ou baixe o projeto
cd soundspace

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
\`\`\`

### Método 2: Build para Produção

\`\`\`bash
# Gere os arquivos estáticos
npm run build

# Inicie o servidor de produção
npm start

# Ou use qualquer servidor estático
npx serve out
\`\`\`

### Método 3: Deploy em Servidor Próprio

\`\`\`bash
# Build para produção
npm run build

# Copie a pasta .next para seu servidor
scp -r .next user@seu-servidor:/var/www/soundspace/

# No servidor, instale dependências e inicie
npm ci --production
npm start
\`\`\`

## Deployment Fora da Vercel

### Usando Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

\`\`\`bash
docker build -t soundspace .
docker run -p 3000:3000 soundspace
\`\`\`

### Usando PM2 (Produção)

\`\`\`bash
npm install -g pm2

# Inicie a aplicação
pm2 start npm --name "soundspace" -- start

# Configure para iniciar no boot
pm2 startup
pm2 save
\`\`\`

### Usando Nginx como Proxy Reverso

\`\`\`nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Configuração Opcional

### Importação de Playlists do Spotify

O app funciona perfeitamente sem configurar o Spotify, mas você tem duas opções de integração:

#### Opção 1: Importar Playlists Públicas (Sem OAuth)
- Cole o link de qualquer playlist pública do Spotify
- Não precisa configurar nada
- Importa prévias de 30 segundos

#### Opção 2: Conectar Sua Conta (Com OAuth - Recomendado)
Conecte sua conta do Spotify para importar TODAS as suas playlists automaticamente:

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Em "Settings", adicione a Redirect URI:
   - Development: `http://localhost:3000/api/spotify/callback`
   - Production: `https://seu-dominio.com/api/spotify/callback`
4. Copie o Client ID e Client Secret
5. Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
\`\`\`

6. Reinicie o servidor
7. Clique em "Conectar Spotify" no app e autorize o acesso
8. Clique em "Importar Minhas Playlists" para baixar todas as suas playlists

**Nota**: Isso é totalmente opcional! O app funciona 100% sem essa configuração usando upload de arquivos locais.

## Como Usar

### 1. Login
- Escolha um nome de usuário
- Não precisa de senha ou registro

### 2. Adicionar Músicas

- **Upload Local**: Clique em "Selecionar Arquivos" e escolha arquivos MP3, WAV, OGG, etc.
- **URL**: Cole a URL de um arquivo de áudio online
- **Conectar Spotify** (recomendado): Autorize sua conta e importe todas as suas playlists automaticamente
- **Importar Playlist do Spotify**: Cole o link de uma playlist pública
  - Exemplo: `https://open.spotify.com/playlist/58iPlkOwQ0m2BIOV4dapLF`
  - Apenas as prévias de 30 segundos serão importadas (limitação da API do Spotify)

### 3. Efeitos de Áudio

- **8D Audio**: Som rotativo circular ao redor da cabeça
- **16D Audio**: Movimento multidirecional complexo
- Ajuste intensidade e velocidade para personalizar
- Requer fones de ouvido para melhor experiência

### 4. Equalizador

- 10 bandas de frequência (32Hz a 16kHz)
- Presets prontos: Rock, Pop, Jazz, Classical, Bass Boost, Vocal
- Ajuste cada banda entre -12dB e +12dB
- Alterações em tempo real

## Tecnologias Utilizadas

- **Next.js 16**: Framework React com App Router
- **Web Audio API**: Processamento de áudio em tempo real
- **Tailwind CSS v4**: Estilização moderna
- **shadcn/ui**: Componentes UI de alta qualidade
- **TypeScript**: Tipagem estática

## Estrutura do Projeto

\`\`\`
soundspace/
├── app/                    # Rotas do Next.js
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout global
├── components/            # Componentes React
│   ├── main-app.tsx      # App principal
│   ├── audio-player.tsx  # Player de áudio
│   ├── music-library.tsx # Biblioteca de músicas
│   ├── jam-session.tsx   # Sistema de jam
│   ├── equalizer-dialog.tsx  # Equalizador
│   └── audio-effects-dialog.tsx  # Efeitos espaciais
└── public/               # Arquivos estáticos
\`\`\`

## Limitações e Considerações

- **CORS**: URLs externas devem permitir CORS para funcionar
- **Armazenamento**: Músicas enviadas são armazenadas na memória do navegador
- **Jam Sessions**: Sistema de salas é local (sem backend), ideal para pequenos grupos
- **Performance**: Efeitos 8D/16D podem consumir CPU em dispositivos antigos

## Próximos Passos (Opcional)

Para tornar o app ainda mais robusto, você pode adicionar:

- Backend real para persistência de músicas (Supabase, PostgreSQL)
- WebSocket para sincronização real de jam sessions
- Sistema de autenticação opcional para salvar preferências
- Upload para cloud storage (S3, Cloudflare R2)
- PWA para funcionar offline

## Suporte

Este é um projeto open-source sem necessidade de configurações complexas. Funciona em qualquer ambiente Node.js e pode ser hospedado em qualquer servidor.

## Licença

MIT License - Use livremente!
