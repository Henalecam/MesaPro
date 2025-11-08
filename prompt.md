# Prompt para Cursor AI: Sistema de Gestão para Restaurantes

## INSTRUÇÃO PRINCIPAL
Você é um assistente de desenvolvimento especializado em criar aplicações full-stack modernas. Seu objetivo é gerar TODO o código necessário para um sistema completo de gestão para restaurantes pequenos e médios, seguindo as especificações abaixo com MÁXIMA precisão.

---

## OVERVIEW DO PROJETO

**Nome:** RestaurantePro  
**Tipo:** Micro-SaaS B2B para gestão de restaurantes  
**Stack:** Next.js 14+ (App Router), TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui

**Propósito:** Sistema web responsivo (mobile-first) para restaurantes gerenciarem mesas, comandas, pedidos, cardápio, estoque e relatórios de vendas.

**Diferenciais:** Interface rápida para garçons, controle em tempo real de pedidos na cozinha, gestão de comandas, controle de estoque integrado.

---

## ARQUITETURA TÉCNICA

### Stack Completo
```
Frontend:
- Next.js 14+ com App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (componentes)
- react-hook-form + zod (validações)
- date-fns (manipulação de datas)
- zustand (state management)
- recharts (gráficos)

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js (autenticação)

Bibliotecas auxiliares:
- axios (requisições)
- clsx / cn (classes condicionais)
- lucide-react (ícones)
- react-to-print (impressão de comandas)
```

### Estrutura de Diretórios
Crie a seguinte estrutura COMPLETA:

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── mesas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── comandas/
│   │   │   ├── page.tsx
│   │   │   ├── nova/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pedidos/
│   │   │   ├── page.tsx
│   │   │   └── cozinha/page.tsx
│   │   ├── cardapio/
│   │   │   ├── page.tsx
│   │   │   ├── categorias/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── estoque/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── garcons/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── relatorios/
│   │   │   ├── vendas/page.tsx
│   │   │   ├── produtos/page.tsx
│   │   │   └── garcons/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── tables/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/status/route.ts
│   │   ├── tabs/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/close/route.ts
│   │   ├── menu/
│   │   │   ├── items/route.ts
│   │   │   ├── items/[id]/route.ts
│   │   │   └── categories/route.ts
│   │   ├── stock/route.ts
│   │   ├── waiters/route.ts
│   │   └── dashboard/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── tables/
│   │   ├── TableGrid.tsx
│   │   ├── TableCard.tsx
│   │   └── TableStatusBadge.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderForm.tsx
│   │   ├── OrderItemsList.tsx
│   │   └── KitchenDisplay.tsx
│   ├── tabs/
│   │   ├── TabCard.tsx
│   │   ├── TabSummary.tsx
│   │   └── TabPrint.tsx
│   ├── menu/
│   │   ├── MenuItemCard.tsx
│   │   ├── MenuItemForm.tsx
│   │   ├── CategoryBadge.tsx
│   │   └── MenuGrid.tsx
│   ├── dashboard/
│   │   ├── SalesMetricCard.tsx
│   │   ├── SalesChart.tsx
│   │   └── TopProductsTable.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── MobileNav.tsx
│       └── UserMenu.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations/
│       ├── order.ts
│       ├── tab.ts
│       ├── menuItem.ts
│       └── table.ts
├── hooks/
│   ├── useOrders.ts
│   ├── useTabs.ts
│   ├── useTables.ts
│   ├── useMenu.ts
│   └── useDashboard.ts
├── types/
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## SCHEMA DO BANCO DE DADOS

Implemente EXATAMENTE este schema Prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id        String   @id @default(cuid())
  name      String
  phone     String
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  tables     Table[]
  tabs       Tab[]
  orders     Order[]
  menuItems  MenuItem[]
  categories Category[]
  stockItems StockItem[]
  waiters    Waiter[]
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  password     String
  name         String
  role         Role       @default(ADMIN)
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum Role {
  ADMIN
  WAITER
  KITCHEN
}

model Table {
  id           String     @id @default(cuid())
  number       Int
  capacity     Int
  status       TableStatus @default(AVAILABLE)
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  tabs Tab[]
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}

model Tab {
  id           String     @id @default(cuid())
  code         String     @unique
  status       TabStatus  @default(OPEN)
  openedAt     DateTime   @default(now())
  closedAt     DateTime?
  totalAmount  Float      @default(0)
  paymentMethod PaymentMethod?
  discount     Float      @default(0)
  
  tableId      String
  table        Table      @relation(fields: [tableId], references: [id])
  waiterId     String
  waiter       Waiter     @relation(fields: [waiterId], references: [id])
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  orders       Order[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum TabStatus {
  OPEN
  CLOSED
  CANCELLED
}

enum PaymentMethod {
  CASH
  PIX
  DEBIT
  CREDIT
}

model Order {
  id           String      @id @default(cuid())
  status       OrderStatus @default(PENDING)
  notes        String?
  totalAmount  Float       @default(0)
  
  tabId        String
  tab          Tab         @relation(fields: [tabId], references: [id])
  restaurantId String
  restaurant   Restaurant  @relation(fields: [restaurantId], references: [id])
  
  items        OrderItem[]
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

model OrderItem {
  id          String   @id @default(cuid())
  quantity    Int
  unitPrice   Float
  totalPrice  Float
  notes       String?
  status      OrderItemStatus @default(PENDING)
  
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum OrderItemStatus {
  PENDING
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

model Category {
  id           String     @id @default(cuid())
  name         String
  description  String?
  order        Int        @default(0)
  isActive     Boolean    @default(true)
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  menuItems    MenuItem[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model MenuItem {
  id           String     @id @default(cuid())
  name         String
  description  String?
  price        Float
  image        String?
  isAvailable  Boolean    @default(true)
  preparationTime Int     @default(15)
  
  categoryId   String
  category     Category   @relation(fields: [categoryId], references: [id])
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  orderItems   OrderItem[]
  ingredients  MenuItemIngredient[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model StockItem {
  id           String     @id @default(cuid())
  name         String
  unit         String
  quantity     Float
  minQuantity  Float
  cost         Float
  isActive     Boolean    @default(true)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  menuItems    MenuItemIngredient[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model MenuItemIngredient {
  menuItemId   String
  stockItemId  String
  quantity     Float
  
  menuItem     MenuItem  @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  stockItem    StockItem @relation(fields: [stockItemId], references: [id])
  
  @@id([menuItemId, stockItemId])
}

model Waiter {
  id           String     @id @default(cuid())
  name         String
  phone        String?
  cpf          String?
  isActive     Boolean    @default(true)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  tabs         Tab[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

---

## FUNCIONALIDADES OBRIGATÓRIAS

### 1. AUTENTICAÇÃO
- Registro de novo restaurante (cria Restaurant + User admin)
- Login com email e senha
- Proteção de rotas (middleware NextAuth)
- Roles: ADMIN (gerente), WAITER (garçom), KITCHEN (cozinha)
- Session management

### 2. DASHBOARD PRINCIPAL (/)
**Para ADMIN:**
- Cards de métricas: 
  - Faturamento hoje/semana/mês
  - Total de pedidos
  - Ticket médio
  - Mesas ocupadas
- Gráfico de vendas dos últimos 7 dias
- Top 5 produtos mais vendidos
- Top 3 garçons (por faturamento)
- Alertas: estoque baixo, comandas abertas há muito tempo

**Para WAITER:**
- Suas comandas abertas
- Mesas disponíveis
- Botão rápido: Nova Comanda

**Para KITCHEN:**
- Pedidos pendentes (PENDING, PREPARING)
- Tempo desde criação de cada pedido
- Ações rápidas: Iniciar preparo, Marcar pronto

### 3. MESAS (/mesas)
**Listar:**
- Grid visual de mesas
- Cada mesa mostra: número, capacidade, status (cores)
- Status: Disponível (verde), Ocupada (vermelho), Reservada (amarelo)
- Filtro por status
- Ao clicar: ver comanda ativa ou abrir nova

**Criar/Editar:**
- Modal: número da mesa, capacidade
- Ações: editar, excluir

### 4. COMANDAS (/comandas)
**Listar:**
- Cards por comanda mostrando:
  - Código da comanda
  - Mesa
  - Garçom
  - Valor total
  - Tempo aberta
  - Status (aberta/fechada)
- Filtros: status, garçom, período
- Busca por código

**Nova Comanda (/comandas/nova):**
- Selecionar mesa (apenas disponíveis)
- Selecionar garçom
- Gerar código único automaticamente (ex: C001, C002)
- Mesa muda para status OCCUPIED
- Criar comanda com status OPEN

**Detalhes Comanda (/comandas/[id]):**
- Informações da comanda
- Lista de todos os pedidos
- Total acumulado
- Ações:
  - Adicionar novo pedido
  - Fechar comanda
  - Imprimir comanda
  - Cancelar comanda

**Fechar Comanda:**
- Modal mostrando:
  - Total de consumo
  - Campo para desconto (% ou R$)
  - Total final
  - Selecionar forma de pagamento
- Ao confirmar:
  - Status = CLOSED
  - Mesa volta para AVAILABLE
  - Registrar closedAt, paymentMethod

### 5. PEDIDOS (/pedidos)
**Fazer Pedido (dentro da comanda):**
- Buscar item do cardápio (autocomplete)
- Selecionar quantidade
- Adicionar observações (ex: sem cebola)
- Mostrar subtotal
- Adicionar múltiplos itens
- Confirmar pedido (envia para cozinha)

**Listar Pedidos:**
- Tabela com: código pedido, mesa, itens, status, garçom, horário
- Filtros: status, período
- Ações por pedido: ver detalhes, cancelar

**Cozinha (/pedidos/cozinha):**
- View específica para cozinha (TV/tablet)
- Cards grandes com:
  - Número da mesa
  - Itens do pedido
  - Observações destacadas
  - Tempo desde criação (atualiza em tempo real)
  - Botões: Iniciar Preparo, Marcar Pronto
- Ordenar por: mais antigos primeiro
- Atualização automática (polling ou websocket)

### 6. CARDÁPIO (/cardapio)
**Listar Itens:**
- Grid de cards com foto, nome, preço, categoria
- Filtro por categoria
- Badge de disponibilidade
- Busca por nome
- Ações: editar, ativar/desativar

**Criar/Editar Item:**
- Formulário:
  - Nome, descrição
  - Preço
  - Categoria (dropdown)
  - Tempo de preparo (minutos)
  - Upload de imagem (opcional)
  - Ingredientes do estoque (multi-select com quantidades)
  - Disponível (toggle)

**Categorias (/cardapio/categorias):**
- Listar categorias
- CRUD: criar, editar, reordenar (drag-drop), excluir
- Campos: nome, descrição, ordem

### 7. ESTOQUE (/estoque)
**Listar:**
- Tabela: nome, unidade, quantidade atual, quantidade mínima, custo
- Destaque visual se quantidade < quantidade mínima
- Busca por nome
- Filtro: apenas com estoque baixo

**Criar/Editar:**
- Formulário: nome, unidade (kg, L, unidade), quantidade, quantidade mínima, custo

**Movimentações:**
- Registrar entrada de estoque (aumentar quantidade)
- Ao vender item do cardápio: deduzir ingredientes automaticamente

### 8. GARÇONS (/garcons)
**Listar:**
- Cards: nome, telefone, status (ativo/inativo), total de comandas hoje
- Ações: editar, ativar/desativar

**Criar/Editar:**
- Formulário: nome, telefone, CPF (opcional)

### 9. RELATÓRIOS

**Vendas (/relatorios/vendas):**
- Filtro por período
- Métricas:
  - Faturamento total
  - Total de pedidos
  - Ticket médio
  - Faturamento por forma de pagamento
- Gráfico: vendas por dia
- Tabela: vendas detalhadas (comanda, mesa, valor, garçom, pagamento)
- Exportar CSV

**Produtos (/relatorios/produtos):**
- Filtro por período
- Ranking: itens mais vendidos (quantidade e valor)
- Gráfico de barras
- Ver por categoria

**Garçons (/relatorios/garcons):**
- Filtro por período
- Ranking: garçons por faturamento
- Tabela: garçom, comandas atendidas, valor total, ticket médio

---

## REGRAS DE NEGÓCIO CRÍTICAS

### Mesas:
1. Número da mesa único por restaurante
2. Capacidade mínima: 1
3. Só pode abrir comanda em mesa AVAILABLE
4. Ao abrir comanda, mesa = OCCUPIED
5. Ao fechar comanda, mesa = AVAILABLE
6. Não permitir deletar mesa com comanda aberta

### Comandas:
1. Código único gerado automaticamente (formato: C + número sequencial)
2. Status inicial: OPEN
3. Só pode fechar comanda se todos pedidos estiverem DELIVERED
4. Ao fechar, obrigatório: paymentMethod
5. totalAmount = soma de todos os orders - discount
6. Não permitir adicionar pedido em comanda fechada/cancelada

### Pedidos:
1. Só pode criar pedido em comanda OPEN
2. totalAmount do pedido = soma dos OrderItems
3. Status inicial de Order e OrderItem: PENDING
4. OrderItem.totalPrice = quantity × unitPrice
5. Ao marcar OrderItem como READY, notificar garçom (futuro: WhatsApp)
6. Não permitir cancelar OrderItem já DELIVERED

### Estoque:
1. Ao criar OrderItem, verificar se há estoque suficiente dos ingredientes
2. Ao OrderItem ser DELIVERED, deduzir ingredientes do estoque (transaction)
3. Se quantidade < minQuantity, marcar como alerta
4. Ao deletar MenuItem, desvincula ingredientes

### Cardápio:
1. Preço > 0
2. Tempo de preparo > 0
3. Item só aparece para pedido se isAvailable = true
4. Categoria obrigatória

---

## VALIDAÇÕES (Zod Schemas)

Crie schemas Zod completos para:
- tableSchema (create, update)
- tabSchema (create, close)
- orderSchema (create, updateStatus)
- menuItemSchema (create, update)
- categorySchema (create, update)
- stockItemSchema (create, update)
- waiterSchema (create, update)

Validações comuns:
- Campos obrigatórios
- Tipos corretos
- Limites (ex: price > 0, quantity > 0)
- Formatos (email, telefone, CPF)

---

## API ROUTES

Implemente TODAS as rotas REST necessárias:

### /api/auth/[...nextauth]/route.ts
- Provider: Credentials
- Verificar email/password com Prisma
- Session com: id, name, email, role, restaurantId

### /api/tables/route.ts
- GET: listar mesas (filtro: status)
- POST: criar mesa

### /api/tables/[id]/route.ts
- GET, PATCH, DELETE

### /api/tabs/route.ts
- GET: listar comandas (filtros: status, waiterId, period)
- POST: criar comanda (validar mesa disponível)

### /api/tabs/[id]/route.ts
- GET: detalhes completos (incluir orders com items)
- PATCH: atualizar
- DELETE: cancelar comanda

### /api/tabs/[id]/close/route.ts
- POST: fechar comanda (validar todos pedidos delivered, calcular total)

### /api/orders/route.ts
- GET: listar pedidos (filtros: status, tabId)
- POST: criar pedido (validar comanda aberta, calcular totais)

### /api/orders/[id]/route.ts
- GET, DELETE (cancelar)

### /api/orders/[id]/status/route.ts
- PATCH: atualizar status do pedido ou items específicos

### /api/menu/items/route.ts
- GET: listar itens (filtros: categoryId, isAvailable, search)
- POST: criar item

### /api/menu/items/[id]/route.ts
- GET, PATCH, DELETE

### /api/menu/categories/route.ts
- GET, POST (listar/criar categorias)

### /api/menu/categories/[id]/route.ts
- PATCH, DELETE

### /api/stock/route.ts
- GET: listar itens estoque (filtro: lowStock)
- POST: criar item

### /api/stock/[id]/route.ts
- GET, PATCH (ajustar quantidade), DELETE

### /api/waiters/route.ts
- GET, POST

### /api/waiters/[id]/route.ts
- PATCH, DELETE

### /api/dashboard/route.ts
- GET: todas métricas do dashboard

### /api/reports/sales/route.ts
- GET: dados vendas (filtros: startDate, endDate)

### /api/reports/products/route.ts
- GET: ranking produtos (filtros: startDate, endDate, categoryId)

### /api/reports/waiters/route.ts
- GET: performance garçons (filtros: startDate, endDate)

**Padrão de resposta:**
```typescript
// Sucesso
{ success: true, data: {...} }

// Erro
{ success: false, error: "Mensagem" }
```

---

## COMPONENTES UI (shadcn/ui)

Instale e use TODOS estes componentes:
- button
- card
- input
- select
- dialog
- calendar
- toast
- badge
- table
- avatar
- dropdown-menu
- tabs
- form
- label
- checkbox
- radio-group
- separator
- sheet (mobile menu)
- command (busca com autocomplete)
- popover
- scroll-area

---

## DESIGN SYSTEM

### Cores (Tailwind Config):
```javascript
colors: {
  primary: {
    DEFAULT: '#dc2626',      // Vermelho restaurante
    foreground: '#ffffff',
  },
  secondary: {
    DEFAULT: '#f97316',      // Laranja
    foreground: '#ffffff',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}
```

### Status Colors:
**Mesas:**
- AVAILABLE: green-500
- OCCUPIED: red-500
- RESERVED: yellow-500

**Pedidos:**
- PENDING: gray-400
- PREPARING: yellow-500
- READY: green-500
- DELIVERED: blue-500
- CANCELLED: red-500

**Comandas:**
- OPEN: green-500
- CLOSED: gray-400
- CANCELLED: red-500

### Responsividade:
- Mobile: < 768px (layout simplificado, menu hamburguer)
- Tablet: 768px - 1024px (grid 2 colunas)
- Desktop: > 1024px (sidebar fixa, grid 3-4 colunas)

---

## FEATURES DE UX OBRIGATÓRIAS

1. **Loading States:** Skeleton loaders em todas as listas
2. **Real-time Updates:** Polling a cada 10s na tela da cozinha
3. **Error Handling:** Toast notifications para erros e sucessos
4. **Confirmações:** Dialogs para: fechar comanda, cancelar pedido, deletar
5. **Optimistic Updates:** UI atualiza antes da resposta da API
6. **Debounce:** Em campos de busca (300ms)
7. **Auto-refresh:** Dashboard e cozinha atualizam automaticamente
8. **Keyboard Shortcuts:** 
   - ESC: fecha modais
   - Ctrl+N: nova comanda (dashboard)
   - Ctrl+F: buscar item cardápio
9. **Focus Management:** Primeiro input tem autofocus
10. **Print-friendly:** CSS específico para impressão de comandas

---

## CONFIGURAÇÃO INICIAL

### 1. package.json (dependências):
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0",
    "react-to-print": "^2.15.0",
    "lucide-react": "latest",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### 2. .env.example:
```
DATABASE_URL="postgresql://user:password@localhost:5432/restaurantepro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 3. tsconfig.json (strict):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### FASE 1 (MVP Core - semana 1-2):
1. Setup do projeto (Next.js + Prisma + shadcn/ui)
2. Schema do banco + migrations
3. Autenticação completa
4. Layout base (sidebar, header)
5. CRUD de Mesas
6. CRUD de Garçons
7. CRUD de Categorias

### FASE 2 (Core Business - semana 2-3):
8. CRUD de Itens do Cardápio
9. Criar/Listar/Fechar Comandas
10. Sistema de Pedidos (criar, listar)
11. Atualizar status de pedidos
12. Cálculo automático de totais

### FASE 3 (Operação - semana 3-4):
13. Tela da Cozinha (view especial)
14. Impressão de comandas
15. Dashboard com métricas
16. CRUD de Estoque

### FASE 4 (Gestão - semana 4+):
17. Integração estoque ↔ cardápio
18. Dedução automática de ingredientes
19. Relatórios (vendas, produtos, garçons)
20. Melhorias de UX e responsividade

---

## FLUXOS PRINCIPAIS

### Fluxo 1: Atender Cliente (Garçom)
```
1. Login como WAITER
2. Dashboard → Ver mesas disponíveis
3. Cliente chega → clicar "Nova Comanda"
4. Selecionar mesa → selecionar garçom (auto-select se for o próprio)
5. Comanda criada → redireciona para detalhes
6. Clicar "Adicionar Pedido"
7. Buscar item do cardápio (autocomplete)
8. Selecionar quantidade, adicionar observações
9. Adicionar mais itens se necessário
10. Confirmar pedido → envia para cozinha (status PENDING)
11. Pedido aparece na tela da cozinha
12. Cliente consome, garçom pode adicionar mais pedidos na mesma comanda
13. Quando terminar, clicar "Fechar Comanda"
14. Revisar total, aplicar desconto se necessário
15. Selecionar forma de pagamento
16. Confirmar → comanda fechada, mesa liberada
```

### Fluxo 2: Cozinha
```
1. Login como KITCHEN
2. Redireciona automaticamente para /pedidos/cozinha
3. Ver todos pedidos PENDING e PREPARING
4. Pedido novo chega → aparece no topo
5. Clicar "Iniciar Preparo" → status = PREPARING
6. Preparar o pedido
7. Clicar "Marcar Pronto" → status = READY
8. Garçom entrega → status = DELIVERED
9. Tela atualiza automaticamente (polling 10s)
```

### Fluxo 3: Gerente - Análise
```
1. Login como ADMIN
2. Dashboard → ver métricas gerais
3. Acessar "Relatórios de Vendas"
4. Filtrar período (última semana)
5. Ver:
   - Faturamento total
   - Produtos mais vendidos
   - Performance dos garçons
6. Identificar itens que não vendem
7. Ajustar cardápio (desativar ou reduzir preço)
8. Verificar estoque → repor itens com alerta
```

---

## TELAS PRINCIPAIS (Wireframe Textual)

### Tela: Dashboard (WAITER)
```
┌─────────────────────────────────────┐
│  [☰]    RestaurantePro    [Perfil]  │
├─────────────────────────────────────┤
│  Olá, João (Garçom)                 │
│                                     │
│  🍽️ Mesas Disponíveis               │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 1  │ │ 3  │ │ 5  │              │
│  │ 4  │ │ 2  │ │ 4  │ (capacidade) │
│  └────┘ └────┘ └────┘              │
│   🟢     🟢     🟢                  │
│                                     │
│  🔴 Mesas Ocupadas                  │
│  ┌────┐ ┌────┐                     │
│  │ 2  │ │ 4  │                     │
│  │C012│ │C013│ (código comanda)    │
│  └────┘ └────┘                     │
│                                     │
│  📋 Suas Comandas Abertas           │
│  ┌─────────────────────────────┐   │
│  │ C012 - Mesa 2               │   │
│  │ R$ 85,50 | 1h23min          │   │
│  │ [Ver] [Adicionar Pedido]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Nova Comanda]                   │
└─────────────────────────────────────┘
```

### Tela: Cozinha
```
┌─────────────────────────────────────┐
│  🔥 PEDIDOS DA COZINHA              │
├─────────────────────────────────────┤
│                                     │
│  ⏱️ PENDENTES                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ MESA 2 - PEDIDO #15         │   │
│  │ ⏱️ há 2 minutos              │   │
│  │                             │   │
│  │ • 2x Hambúrguer Especial    │   │
│  │ • 1x Batata Frita GG        │   │
│  │                             │   │
│  │ 💬 Sem cebola no hambúrguer │   │
│  │                             │   │
│  │ [Iniciar Preparo]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔄 PREPARANDO                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ MESA 5 - PEDIDO #14         │   │
│  │ ⏱️ há 8 minutos              │   │
│  │                             │   │
│  │ • 1x Filé ao Molho Madeira  │   │
│  │ • 1x Risoto de Cogumelos    │   │
│  │                             │   │
│  │ [Marcar como Pronto] ✅     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ PRONTOS                         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ MESA 1 - PEDIDO #13         │   │
│  │ ✅ Pronto há 2 minutos       │   │
│  │ • 2x Pizza Margherita       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Tela: Detalhes da Comanda
```
┌─────────────────────────────────────┐
│  [← Voltar]  Comanda C012           │
├─────────────────────────────────────┤
│  Mesa: 2 | Garçom: João             │
│  Aberta há: 1h 23min                │
│                                     │
│  📝 PEDIDOS                         │
│                                     │
│  Pedido #15 - 14:35 🟡              │
│  ┌─────────────────────────────┐   │
│  │ 2x Hambúrguer R$ 25,00      │   │
│  │ 1x Refrigerante R$ 8,00     │   │
│  │ Subtotal: R$ 58,00          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Pedido #14 - 14:15 ✅              │
│  ┌─────────────────────────────┐   │
│  │ 1x Filé R$ 45,00            │   │
│  │ 2x Cerveja R$ 7,00          │   │
│  │ Subtotal: R$ 59,00          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  TOTAL: R$ 117,00                   │
│                                     │
│  [+ Adicionar Pedido]               │
│  [Fechar Comanda]                   │
│  [Imprimir]                         │
└─────────────────────────────────────┘
```

### Tela: Novo Pedido (Modal)
```
┌─────────────────────────────────────┐
│  Adicionar Pedido - Mesa 2          │
├─────────────────────────────────────┤
│                                     │
│  🔍 Buscar item...                  │
│  [hamburguer____________]           │
│                                     │
│  Resultados:                        │
│  ┌─────────────────────────────┐   │
│  │ 🍔 Hambúrguer Especial      │   │
│  │ R$ 25,00 | 15min            │   │
│  │ [+ Adicionar]               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🍔 Hambúrguer Simples       │   │
│  │ R$ 18,00 | 10min            │   │
│  │ [+ Adicionar]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📦 Itens Adicionados:              │
│                                     │
│  • Hambúrguer Especial              │
│    Qtd: [2] R$ 50,00                │
│    💬 Observações:                  │
│    [Sem cebola_____________]        │
│    [Remover]                        │
│                                     │
│  • Refrigerante                     │
│    Qtd: [1] R$ 8,00                 │
│    [Remover]                        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Subtotal: R$ 58,00                 │
│                                     │
│  [Cancelar]  [Confirmar Pedido]     │
└─────────────────────────────────────┘
```

### Tela: Fechar Comanda (Modal)
```
┌─────────────────────────────────────┐
│  Fechar Comanda C012                │
├─────────────────────────────────────┤
│                                     │
│  Mesa: 2                            │
│  Garçom: João                       │
│  Aberta há: 1h 45min                │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Valor Total:        R$ 117,00      │
│                                     │
│  Desconto:                          │
│  ○ R$ [____] ○ % [____]             │
│                                     │
│  Valor Final:        R$ 117,00      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Forma de Pagamento:                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 💵  │ │ PIX │ │ 💳  │ │ 💳  │  │
│  │Dinh.│ │     │ │Déb. │ │Créd.│  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│     ●       ○       ○       ○      │
│                                     │
│  [Cancelar]  [Confirmar Fechamento] │
└─────────────────────────────────────┘
```

### Tela: Cardápio (Gerenciar)
```
┌─────────────────────────────────────┐
│  [← Voltar]  Cardápio               │
├─────────────────────────────────────┤
│  [🔍 Buscar]  [Filtro: Todas ▼]     │
│  [+ Novo Item]  [Gerenciar Categorias]│
│                                     │
│  🍔 Hambúrgueres                    │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 🍔 │ │ 🍔 │ │ 🍔 │              │
│  │H.Es│ │H.Si│ │H.Ve│              │
│  │25,0│ │18,0│ │22,0│              │
│  │ ✅ │ │ ✅ │ │ ❌ │ (disponível) │
│  └────┘ └────┘ └────┘              │
│                                     │
│  🍕 Pizzas                          │
│  ┌────┐ ┌────┐                     │
│  │ 🍕 │ │ 🍕 │                     │
│  │Marg│ │Pep.│                     │
│  │35,0│ │38,0│                     │
│  │ ✅ │ │ ✅ │                     │
│  └────┘ └────┘                     │
│                                     │
│  🥤 Bebidas                         │
│  ...                                │
└─────────────────────────────────────┘
```

---

## RECURSOS AVANÇADOS (Pós-MVP)

### 1. Integração WhatsApp
- Notificar garçom quando pedido está pronto
- Cliente acompanhar status do pedido via link
- Reserva de mesa por WhatsApp

### 2. Sistema de Reservas
- Cliente reserva mesa via web
- Calendário de reservas
- Confirmação automática

### 3. Cardápio Digital
- QR Code na mesa
- Cliente faz pedido direto pelo celular
- Pedido vai direto para cozinha

### 4. Gestão de Delivery
- Integração com iFood/Rappi
- Controle de motoboys
- Rastreamento de entregas

### 5. Programa de Fidelidade
- Pontos por consumo
- Descontos automáticos
- Histórico do cliente

### 6. Analytics Avançado
- Previsão de demanda
- Análise de horários de pico
- Sugestão de combos

---

## COMANDOS PARA EXECUTAR

Após gerar todos os arquivos, o desenvolvedor deve executar:

```bash
# Instalar dependências
npm install

# Instalar shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog calendar toast badge table avatar dropdown-menu tabs form label checkbox radio-group separator sheet command popover scroll-area

# Configurar Prisma
npx prisma generate
npx prisma migrate dev --name init

# Seed inicial (opcional - criar dados de exemplo)
npx prisma db seed

# Rodar desenvolvimento
npm run dev
```

---

## REQUISITOS FINAIS

1. **TypeScript:** 100% tipado, zero `any`, usar tipos do Prisma
2. **Responsive:** Mobile-first, testado em 320px, 768px, 1024px, 1920px
3. **Performance:** 
   - React Server Components onde possível
   - Client Components apenas quando necessário (interatividade)
   - Lazy loading de modais e imagens
   - Otimização de queries (include, select)
4. **Acessibilidade:** 
   - Labels em todos inputs
   - Focus visible e ordem lógica
   - Navegação por teclado
   - Contraste adequado (WCAG AA)
5. **Segurança:**
   - Validação server-side obrigatória
   - Multi-tenancy (cada restaurante vê apenas seus dados)
   - CSRF protection (NextAuth)
   - Sanitização de inputs
6. **Code Quality:**
   - Componentes reutilizáveis e pequenos
   - Custom hooks para lógica compartilhada
   - Nomes descritivos (em português para domínio, inglês para técnico)
   - Comentários apenas em lógica complexa
7. **Database:**
   - Transactions para operações críticas (fechar comanda, deduzir estoque)
   - Índices em campos frequentemente buscados
   - Soft deletes onde necessário
   - Migrations versionadas

---

## SEED DE DADOS (prisma/seed.ts)

Criar dados de exemplo para facilitar testes:
- 1 Restaurante
- 1 User ADMIN, 2 Users WAITER, 1 User KITCHEN
- 8 Mesas (variando capacidade)
- 3 Garçons
- 5 Categorias (Entradas, Pratos Principais, Hambúrgueres, Pizzas, Bebidas)
- 20 Itens no cardápio (distribuídos nas categorias)
- 10 Itens de estoque (ingredientes básicos)
- 2 Comandas abertas com pedidos
- 1 Comanda fechada (histórico)

---

## MÉTRICAS DE SUCESSO

### Técnicas
- [ ] Tempo de carregamento < 2s
- [ ] Lighthouse Performance > 90
- [ ] Zero erros no console
- [ ] 100% TypeScript (sem `any`)
- [ ] Todas as queries otimizadas (explain analyze)

### Negócio (após lançamento)
- [ ] 5 restaurantes usando em 30 dias
- [ ] Tempo médio para criar pedido < 45s
- [ ] 95% dos pedidos sem erros
- [ ] Taxa de retenção > 85% no mês 2
- [ ] NPS > 60
- [ ] Redução de 70% no uso de papel (comandas impressas)

---

## VALIDAÇÃO FINAL

Após gerar todo o código, certifique-se de que:
- [ ] Projeto compila sem erros TypeScript
- [ ] Prisma schema está correto e migrations rodaram
- [ ] Seed cria dados de exemplo
- [ ] Todas as rotas API estão implementadas e testáveis
- [ ] Todas as páginas do dashboard existem e carregam
- [ ] Formulários têm validação Zod completa
- [ ] Layout é 100% responsivo (testado em múltiplos tamanhos)
- [ ] Autenticação funciona (login, logout, proteção de rotas)
- [ ] Multi-tenancy está implementado (isolamento de dados por restaurante)
- [ ] Fluxo completo funciona: 
  - Criar comanda → Adicionar pedidos → Cozinha prepara → Fechar comanda
- [ ] Cálculos estão corretos (totais, descontos, comissões)
- [ ] Status transitions são validadas
- [ ] Tela da cozinha atualiza automaticamente

---

## PRÓXIMOS PASSOS (Pós-Implementação)

1. **Testes:** Implementar testes unitários e E2E
2. **CI/CD:** Setup GitHub Actions para deploy automático
3. **Monitoramento:** Sentry para erros, Vercel Analytics
4. **Backup:** Rotina diária de backup do banco
5. **Documentação:** README com instruções de setup
6. **Marketing:** Landing page explicativa
7. **Onboarding:** Tutorial interativo no primeiro acesso

---

**IMPORTANTE:** Gere TODOS os arquivos necessários de forma completa e funcional. Não deixe placeholders, TODOs ou comentários "implementar depois". O código deve estar 100% pronto para rodar após `npm install`, configuração do .env e `npx prisma migrate dev`.
