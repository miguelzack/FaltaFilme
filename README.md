# FaltaFilme

Aplicativo mobile de cinema desenvolvido em React Native e Expo para a atividade **SA1 — Desenvolvimento de Aplicativo
Mobile Integrado a API**, do SENAI. O FaltaFilme reúne filmes em cartaz, permite consultar sessões e simula a compra de
ingressos.

## Proposta

O aplicativo procura facilitar a escolha de um filme e a organização da ida ao cinema: o usuário consulta o catálogo,
pesquisa filmes, escolhe uma sessão e assentos e acompanha os pedidos concluídos. Os dados dos filmes vêm da API do
TMDB; sessões, contas e compras são simuladas localmente para fins acadêmicos.

## Tecnologias

- **React Native** e **Expo SDK 58**, com JavaScript.
- **Expo Router** para navegação entre telas, com rotas definidas em `src/app`.
- **Styled Components** e Flexbox para estilos e organização dos layouts.
- **TMDB API** para catálogo, detalhes, elenco, classificação e imagens de filmes.
- **AsyncStorage** para contas, sessão, sessões simuladas, seleções e pedidos locais.
- **react-native-maps** para o mapa na tela Sobre nós, com opção de abrir o endereço no Google Maps.
- **react-native-svg** para ícones e elementos vetoriais da interface.

## Funcionalidades

- Abertura com verificação de sessão; acesso, cadastro, login e saída da conta.
- Home com destaques e seções de filmes em cartaz.
- Busca por título, gênero ou elenco e filtros por gênero, classificação, formato e horário.
- Detalhes do filme com sinopse, elenco e informações disponíveis no TMDB.
- Seleção de data, sessão, assentos e tipos de ingresso.
- Pagamento simulado e confirmação de compra.
- Histórico de compras da conta conectada.
- Página Sobre nós com endereço e mapa.

## Regras do cinema

- As sessões incluem os três dias seguintes e, até as 19h30, horários futuros do dia atual.
- A seleção de assentos usa seis fileiras de oito lugares.
- Ingresso inteiro custa **R$ 20,00** e meia-entrada **R$ 10,00**. É necessário selecionar um ingresso para cada
  assento.

## Integração com APIs e dados

O serviço em `src/services/movieService.js` faz requisições HTTP com `fetch`, autentica com o token de leitura do TMDB,
interpreta as respostas JSON e utiliza `async/await`.

| Recurso                                                      | Uso                                                                                   |
|--------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `GET /3/discover/movie`                                      | Filmes recentes ordenados por popularidade para a Home e a busca.                     |
| `GET /3/movie/{id}?append_to_response=credits,release_dates` | Detalhes, elenco e equipe, além das datas de lançamento e classificações disponíveis. |
| `https://image.tmdb.org/t/p/`                                | Imagens dos filmes, como pôsteres e fundos.                                           |

Home, busca e detalhes apresentam informações provenientes do TMDB; outras etapas também consultam detalhes do filme
selecionado. A interface trata carregamento, erros e ausência de resultados nos principais fluxos. Na busca, uma falha
ao carregar os detalhes de qualquer filme pode fazer a consulta inteira falhar, com opção de tentar novamente.

O mapa usa o provedor nativo da plataforma e depende de conexão. O endereço exibido é Rua Bento Branco de Andrade Filho,
379, Santo Amaro, São Paulo–SP, CEP 04757-000. No Android, a build precisa de uma chave do Maps SDK for Android.

## Listas e componentes

O requisito de uso de **FlatList ou outro recurso adequado para listas** está presente no projeto:

- `src/components/MovieSection/index.js`: `FlatList` horizontal para as seções de filmes da Home.
- `src/screens/SearchScreen/index.js`: `FlatList` para resultados e sugestões da busca.
- `src/screens/OrdersScreen/index.js`: `FlatList` para o histórico de compras.
- `src/components/FeaturedCarousel/index.js`: `ScrollView` horizontal com paginação para os destaques.

Componentes reutilizáveis incluem botões, campos, navegação inferior, cartões e seções de filmes. Telas e componentes
possuem pastas próprias e os estilos ficam, quando aplicável, em `styles.js`.

## Estrutura

```text
src/
  app/              Rotas e layout do Expo Router
  assets/icons/     Ícones SVG como componentes
  components/       Componentes reutilizáveis
  hooks/            Hooks compartilhados
  screens/          Telas e estilos
  services/         Autenticação, filmes, sessões, assentos e pedidos
  theme/            Cores e tipografia
assets/             Ícones e imagens de configuração do aplicativo
```

## Executar o projeto

### Pré-requisitos

- Node.js compatível com o Expo SDK 58, versão **22.13 ou superior**.
- npm e um dispositivo ou emulador compatível com o projeto.
- Conta no [TMDB](https://www.themoviedb.org/) e token de leitura da API.

### Configuração

1. Instale as dependências na raiz do projeto:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha o token de leitura v4 do TMDB e a chave do Google Maps para
   Android:

   ```dotenv
   EXPO_PUBLIC_TMDB_ACCESS_TOKEN=seu_token_de_leitura
   GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps
   ```

3. Inicie o servidor:

   ```bash
   npx expo start
   ```

4. Abra o aplicativo no dispositivo ou emulador. O projeto possui `expo-dev-client` e perfil de build de
   desenvolvimento; alterações em dependências ou configurações nativas podem exigir uma nova build. Para gerar uma
   build Android pelo EAS:

   ```bash
   npx eas-cli@latest build --platform android --profile development
   ```

A configuração `production` em `eas.json` gera APK Android. A existência de um perfil não significa que uma build já
tenha sido executada.

> Variáveis `EXPO_PUBLIC_` são incorporadas ao aplicativo e não são secretas para quem tiver acesso ao pacote. Não
> inclua credenciais no repositório.

### Verificações

```bash
npx expo lint
npx tsc --noEmit
```

## Referências

- [Documentação do TMDB](https://developer.themoviedb.org/docs)
- [Documentação do Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [react-native-maps](https://github.com/react-native-maps/react-native-maps)

