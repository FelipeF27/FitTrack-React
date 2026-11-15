# FitTrack

Aplicativo acadêmico de organização de treinos desenvolvido com React Native, TypeScript e Expo SDK 58. O projeto foi atualizado do SDK 54 para funcionar no Expo Go do iPhone.

## Executar no celular

Pré-requisito: Node.js 22.13 ou mais recente da linha 22 e Expo Go compatível com SDK 58.

```powershell
npm install
npx expo start --clear
```

Conecte o computador e o celular à mesma rede Wi-Fi. No iPhone, leia o QR Code pela Câmera e abra no Expo Go. No Android, leia pelo Expo Go. Mantenha o terminal aberto. Para encerrar, use Ctrl + C.

Se a rede bloquear a conexão:

```powershell
npx expo start --tunnel
```

Depois de instalar novas bibliotecas, reinicie o servidor Expo e leia o novo QR Code. A prévia no navegador pode ser aberta com `npm run web`.

## As sete telas

1. **Login:** valida e-mail e senha e permite mostrar/ocultar a senha.
2. **Cadastro:** nome, e-mail, senha e confirmação; rejeita contas duplicadas no aparelho.
3. **Home:** resumo real, calendário da semana, contadores e último treino concluído.
4. **Meus treinos:** lista, busca, edição, exclusão com confirmação e início de sessão.
5. **Novo treino:** formulário de nome, grupo muscular, exercícios, séries, repetições e observações; também edita fichas existentes.
6. **Exercícios:** catálogo de API, busca, filtro muscular, imagens, instruções e criação de ficha a partir de um exercício.
7. **Histórico:** sessões concluídas com data, hora e os exercícios realizados.

Durante uma sessão, marque os exercícios depois de terminar as séries. O botão de conclusão é liberado quando todos estiverem marcados. A tela mostra o tempo decorrido; uma sessão em andamento não é recuperada após fechar o aplicativo. As sessões concluídas são persistidas.

## Requisitos do trabalho

- Quatro telas além de Login, Cadastro e Home: Treinos, Novo treino, Exercícios e Histórico.
- Formulário: cadastro de treino, além do cadastro de conta.
- Lista: FlatList em Treinos, Exercícios e Histórico.
- API: requisição HTTP real à API REST pública do GitHub para consultar Free Exercise DB.
- Componentes reutilizáveis: Field, Button, Screen, Badge, Empty e Dialog.
- Hooks: useState nos formulários; useEffect na consulta, restauração e cronômetro; useRef no foco dos campos, controle de gravação e tempo inicial.
- Navegação: React Navigation com Stack e abas inferiores.

## API e comportamento sem conexão

Endpoint utilizado:

```text
GET https://api.github.com/repos/yuhonas/free-exercise-db/contents/dist/exercises.json
Accept: application/vnd.github.raw+json
```

O catálogo [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) é de domínio público. A [API de conteúdo do GitHub](https://docs.github.com/en/rest/repos/contents#get-repository-content) permite leitura sem chave de repositórios públicos, com limite para consultas anônimas. Os nomes em português ficam em `src/data/exerciseNames.pt-BR.json`, associados ao identificador de cada exercício. A busca aceita o nome em português e o original. As instruções de execução são exibidas no inglês da fonte.

A consulta tem carregamento, tratamento de erro, limite de 15 segundos e botão para tentar novamente. A última consulta bem-sucedida fica em cache. Se a API falhar, o aplicativo identifica que está mostrando os dados salvos. Sem uma primeira consulta bem-sucedida, informa a indisponibilidade; não usa exercícios fictícios como resposta da API.

## Armazenamento e contas

Os treinos e as sessões são gravados com AsyncStorage, separados pelo identificador de cada conta. O histórico contém uma cópia dos exercícios concluídos: editar ou excluir uma ficha não altera conquistas anteriores. A interface só confirma uma alteração após a gravação terminar.

No iOS/Android, SecureStore guarda a sessão e o registro local da conta com um resumo SHA-256 com salt, sem senha em texto puro. Na prévia web, os registros ficam no armazenamento do navegador. Este é um protótipo acadêmico de login local: não existe servidor de autenticação, sincronização entre aparelhos ou recuperação de senha por e-mail. Uma aplicação de produção precisaria de autenticação e autorização no servidor. Use dados de teste na apresentação.

## Roteiro para apresentar

1. Criar uma conta e mostrar a validação da confirmação de senha.
2. Na Home, criar um treino com dois exercícios.
3. Demonstrar a validação de séries (1 a 20) e repetições (1 a 100).
4. Salvar, buscar e editar o treino.
5. Abrir Exercícios com internet; buscar e filtrar o catálogo.
6. Abrir um exercício e criar uma nova ficha com ele.
7. Em Treinos, começar uma sessão, marcar os exercícios e concluir.
8. Mostrar a conquista no Histórico e os contadores atualizados na Home.
9. Reabrir o app para comprovar persistência; sair e entrar novamente.

## Organização

```text
src/
  components/  # Interface reutilizável e execução de sessão
  contexts/    # Conta, sessão e operações dos treinos
  global/      # Cores do aplicativo
  hooks/       # Consulta do catálogo com ciclo de vida
  navigation/  # Rotas e abas
  pages/       # As sete telas
  services/    # API e armazenamento
  types/       # Modelos TypeScript
  utils/       # Validações, datas e estatísticas
tests/         # Testes das regras e da integração HTTP/cache
```

## Verificar

```powershell
npm run typecheck
npm test
npx expo-doctor
npx expo export --platform ios --output-dir .expo/validation-ios
```
