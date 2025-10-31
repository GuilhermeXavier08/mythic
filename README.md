# Plataforma de Jogos e Sociabilidade – Mythic

## Identificação do problema
Com a crescente popularização do mundo dos jogos, é comum que muitas pessoas ainda não tenham acesso a um computador decente para o consumo destes mesmos. O mythic entra buscando ser uma alternativa para estás pessoas, com o desenvolvimento de uma aplicação web onde será possível jogar no próprio navegador com jogos mais leves, com acesso a socialização entre os usuários, para gerar a sensação de realmente estar incluído neste mundo que está em constante crescimento. Também tem como objetivo a divulgação de trabalhos de desenvolvedores iniciantes, podendo colocar seus próprios jogos no site, e demonstrando suas habilidades, conseguindo assim oportunidades de trabalho em studios maiores, ou reconhecimento para seus próprios trabalhos.

## Objetivos Gerais
Desenvolvimento de uma aplicação web com possibilidade de jogar e socializar com outros usuários, com foco principalmente de usuários com computadores mais fracos.

## Objetivos Específicos
- Desenvolvimento de aplicação de alta usabilidade e otimização
- Temática atraente a todos os públicos para facilitar o acesso
- Design de interação fácil
- Disponibilidade de diversos tipos de jogos
- Divulgação de trabalhos de desenvolvedores

## Público-Alvo
- Usuário (usuários finais)
- Criadores (usuários intermediários)
- Admin (usuários iniciais)

## Levantamento de Requisitos do Projeto

### Requisitos Funcionais
- RF01: Permitir cadastro e login via e-mail. 
- RF02: Criar e personalizar perfil (nome, foto, biografia, status, avatar). 
- RF03: Exibir lista de jogos com categorias. 
- RF04: Implementar sistema de amigos. 
- RF05: Oferecer chats com amigos. 

## Recusos do Projeto

### Tecnológicos
- Framework de Desenvolvimento Next/React
- Linguagem de Programação: TypeScript
- Banco de Dados: Relacional (MySQL)
- VScode
- Figma

### Pessoal
- Equipe de Colaboradores

## Diagrama de Fluxo
```mermaid
graph TD
    A[Começo] --> B[Desenvolvedor faz login]
    B --> C[Desenvolvedor envia o jogo]
    C --> D[Jogo com status=&quot;pendente&quot;]
    D --> E[Administrador analisa o jogo]
    E --> F{Decisão}
    
    %% Lado "Sim" (Fluxo do Usuário)
    F -- Sim --> G[Jogo com status=&quot;aprovado&quot;]
    G --> H[Usuário faz login]
    H --> I[Usuário visualiza jogos]
    I --> J[Usuário escolhe e realiza a compra]
    J --> K[Sistema adiciona jogo a biblioteca do usuário]
    K --> L[Usuário joga]
    L --> M(Fim)
    
    %% Lado "Não"
    F -- Não --> B
```
## Diagrama de Classe
```mermaid
classDiagram

    class Jogo {
        +String titulo
        +String descricao
        +String genero
        +String tamanho
        +List~String~ imagens
        +atualizarStatus(novoStatus: String)
    }

    class Desenvolvedor {
        +String nome
        +String email
        +String senha
        +List~Jogo~ JogosEnviados
        +enviarJogo()
    }

    class Usuário {
        +String nome
        +String email
        +String senha
        +boolean contaAtiva
        +cadastrarConta()
        +fazerLogin()
        +visualizarBiblioteca()
    }

    class Biblioteca {
        +List~Jogo~ jogos
        +Usuário usuario
        +adicionarJogo(jogo: Jogo)
        +removerJogo(jogo: Jogo)
        +listarJogos()
    }

    class Administrador {
        +String nome
        +String email
        +String senha
        +cadastrarJogo()
        +editarJogo(jogo: Jogo)
        +removerJogo(jogo: Jogo)
        +gerenciarUsuarios()
        +banirUsuario()
        +gerenciarPlataforma()
    }

    %% Relacionamentos da foto
    Usuário "1.1" -- "1.1" Biblioteca
    Biblioteca "1..*" o-- "1..*" Jogo
    Usuário "1" -- "1..*" Jogo
    Desenvolvedor "1..*" <--> "1..*" Jogo
    Administrador "1" -- "1..*" Desenvolvedor
    Administrador "1" -- "1..*" Usuário
```
## Diagrama de Uso
```mermaid
graph TD

    subgraph "Plataforma de Jogos"
        caso1([Fazer Login])
        caso2([Enviar Jogo])
        caso3([Analisar Jogo])
        caso4([Visualizar Jogos])
        caso5([Comprar Jogo])
        caso6([Jogar])
    end

    Dev([Desenvolvedor])
    Usr([Usuário])
    Adm([Administrador])

    Dev --> caso1
    Dev --> caso2

    Usr --> caso1
    Usr --> caso4
    Usr --> caso5
    Usr --> caso6
    
    Adm --> caso1
    Adm --> caso3

    %% Relação "Login é necessário antes de"
    %% (Seguindo o estilo do seu exemplo)
    caso1 --> caso2
    caso1 --> caso3
    caso1 --> caso4
    caso1 --> caso5
    caso1 --> caso6
```