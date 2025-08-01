# Organon - Seu Hub Pessoal de Organização e Produtividade

![Status do Projeto](https://img.shields.io/badge/status-ativo-brightgreen)
![Licença](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-v9-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-blue?logo=tailwind-css)

---

## 1. Sobre o Projeto

Organon é uma aplicação web full-stack projetada para centralizar todas as facetas da organização pessoal em uma única plataforma coesa e intuitiva. O projeto nasceu da necessidade de unificar o gerenciamento de tarefas, agendamento de eventos, rastreamento de hábitos e registros diários, eliminando a fragmentação entre múltiplas ferramentas de produtividade.

A aplicação foi construída com uma arquitetura moderna, utilizando o Next.js App Router para renderização no servidor e no cliente, e o Firebase como um back-end robusto e escalável para autenticação e armazenamento de dados em tempo real.

[**Acesse a Demo Ao Vivo**](https://organon-red.vercel.app/)

---

## 2. Principais Funcionalidades

* **👤 Autenticação Completa:** Sistema seguro de registro e login com e-mail e senha, utilizando Firebase Authentication.
* **🏠 Dashboard Central:** Uma página inicial que oferece um resumo dinâmico do dia, incluindo tarefas, eventos e o progresso dos hábitos.
* **✅ Gerenciador de Tarefas Avançado:**
    * Múltiplas visualizações: Kanban, Lista e Matriz de Eisenhower.
    * Funcionalidade de arrastar e soltar (drag-and-drop) para reorganizar tarefas entre áreas e prioridades.
    * Criação de sub-tarefas e adição de anexos.
* **🗓️ Agenda Inteligente:**
    * Calendário mensal interativo.
    * Criação, edição e exclusão de eventos com detalhes como localização, recorrência e cores.
* **🔄 Monitor de Hábitos:**
    * Interface visual em grid para acompanhamento semanal.
    * Suporte para hábitos binários (sim/não) e quantitativos (contagem).
    * Cálculo automático de sequência (streak).
* **📓 Diário (Linha do Tempo):**
    * Busca de registros por data.
    * Templates diários que consolidam notas de gratidão, memórias, e um resumo das atividades concluídas no dia.
* **⚙️ Perfil de Usuário e Configurações:**
    * Gerenciamento de informações pessoais.
    * Criação e personalização de "Áreas da Vida" com cores, que são usadas globalmente no app.
    * Funcionalidade de troca de tema (Claro, Escuro, Sistema) com persistência no `localStorage`.

---

## 3. Tech Stack

A aplicação foi construída utilizando um conjunto de tecnologias modernas e eficientes:

* **Framework:** [Next.js](https://nextjs.org/) (v14+) com App Router
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Backend & Banco de Dados:** [Firebase](https://firebase.google.com/) (Authentication, Firestore Realtime Database)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes UI:** Construídos com base nos princípios de [Shadcn/UI](https://ui.shadcn.com/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Deploy:** [Vercel](https://vercel.com/)

---

## 4. Começando

Para rodar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

* Node.js (v18.x ou superior)
* npm, yarn ou pnpm
* Uma conta no Firebase

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/renancmd/organon.git](https://github.com/renancmd/organon.git)
    cd organon
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env.local` na raiz do projeto.
    * Copie e cole o conteúdo do arquivo `.env.example` (se houver) ou adicione as chaves do seu projeto Firebase. Veja a seção abaixo para mais detalhes.

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

---

## 5. Configuração do Ambiente

Para que a aplicação se conecte ao Firebase, você precisa obter suas credenciais no console do Firebase e adicioná-las ao arquivo `.env.local`.

**Caminho:** `.env.local`


* NEXT_PUBLIC_FIREBASE_API_KEY=(insira_a_key_aqui)
* NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=https://www.google.com/search?q=seu-projeto.firebaseapp.com
* NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
* NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=https://www.google.com/search?q=seu-projeto.appspot.com
* NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
* NEXT_PUBLIC_FIREBASE_APP_ID=1:...


> **Nota:** O arquivo `.env.local` **não deve** ser enviado para o seu repositório Git.

---

## 6. Estrutura do Projeto

A estrutura de arquivos segue o padrão do Next.js App Router para uma organização clara e baseada em rotas.


```text
/src
├── app/
│   ├── tasks/           # Página de Tarefas
│   ├── schedule/        # Página de Agenda
│   ├── habits/          # Página de Hábitos
│   ├── daily-journal/   # Página do Diário
│   ├── profile/         # Página de Perfil
│   ├── sign-in/         # Página de Login
│   ├── sign-up/         # Página de Registro
│   ├── layout.tsx       # Layout raiz da aplicação
│   └── page.tsx         # Página inicial (Dashboard)
├── components/          # Componentes reutilizáveis (ex: ProtectedRoute)
├── context/             # Contextos React (AuthContext, ThemeContext)
└── lib/                 # Configuração de serviços (ex: firebase.ts)
```


---

## 7. Roadmap de Melhorias

O projeto tem uma base sólida, mas há várias melhorias planejadas para o futuro:

-   [ ] **Upload de Anexos:** Implementar a integração com o Firebase Storage para permitir o upload real de arquivos.
-   [ ] **Notificações (Toasts):** Substituir os `alert()` por um sistema de notificações mais elegante.
-   [ ] **Recuperação de Senha:** Conectar a página de recuperação de senha à funcionalidade do Firebase.
-   [ ] **Página de Estatísticas:** Criar uma nova seção com gráficos sobre a produtividade do usuário.
-   [ ] **Refinamento da UX:** Melhorar os estados de carregamento (skeletons) e estados vazios.

---

## 8. Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 9. Contato

Renan Mendes - [LinkedIn](https://www.linkedin.com/in/SEU-LINKEDIN/) - renanmvc421@gmail.com

Link do Projeto: [https://github.com/renancmd/organon](https://github.com/renancmd/organon)
