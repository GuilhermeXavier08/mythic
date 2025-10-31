## Para usar este projeto:
* Clone o projeto
git clone https://github.com/GuilhermeXavier08/mythic.git


## Para contribuir com esse projeto
* entre na sua branch(seu nome)
`git checkout <nome_branch>`  

* ao terminar sua contribuição, faça __push__ para o servidor remoto no branch que você criou. Por exemplo:  
`git add .`  
`git commit -m "mensagem do commit"`  
`git push -u origin <nome_branch>`  

* crie um novo __PULL REQUEST__ no repositório, para que o seu branch seja analisado e, se estiver correto, seja adicionado ao branch main pelo gerente do projeto.

* ## Atualizando sua Branch com a Última Versão da `main`

Antes de começar a trabalhar em uma nova tarefa ou após terminar de trabalhar em sua branch, é importante garantir que sua cópia local da branch `main` esteja sempre atualizada. Para isso, siga os passos abaixo para puxar as últimas atualizações de `main`:

### 1. Vá para a Branch `main`
Primeiro, certifique-se de que você está na branch `main`, onde todas as atualizações principais do projeto estão sendo feitas.

`git checkout main`
`git pull origin main`


## Voltando para sua Branch de Trabalho e Fazendo o Merge com `main`

Após garantir que a branch `main` está atualizada, o próximo passo é voltar para a sua branch de trabalho e integrar as últimas alterações da `main` nela. Isso garante que você esteja trabalhando com a versão mais atualizada do projeto, evitando conflitos futuros ao fazer o merge de volta para a `develop`. Siga os passos abaixo:

### 1. Volte para a Sua Branch de Trabalho
Se você estava na branch `main` para atualizar o código, agora é hora de voltar para a sua branch de trabalho, onde você estava desenvolvendo suas alterações. Use o seguinte comando para mudar para a sua branch de trabalho:

```bash
git checkout <nome_da_sua_branch>

git merge main

