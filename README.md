# ROI Page Generator

App interno simples para o time de CS gerar uma "ROI Page" (1 página) para PQLs com Implementation Rate alto.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Puppeteer (geração de PDF)

## Como usar

1. **Instalar dependências** (se já não fez):
   ```bash
   npm install
   ```

2. **Rodar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Acessar o app**:
   - Abra o navegador em `http://localhost:3000` (ou a porta que o Next.js indicar)

4. **Gerar uma ROI Page**:
   1. Preencha o formulário com os dados da empresa e métricas
   2. Clique em "Preview da ROI Page"
   3. Visualize o preview (use os botões Normal/Compacto/Mínimo para ajustar)
   4. Clique em "Gerar PDF" para baixar o PDF

## Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Roda o ESLint

## Campos do formulário

### Empresa
- Nome da empresa (obrigatório)
- Logo da empresa (opcional - upload ou URL)

### Metadados do Relatório
- Período do relatório (obrigatório)
- Gerado por (opcional)

### Métricas de Uso
- PRs analisados (obrigatório, > 0)
- PRs com ação do Kodus (opcional)
- Sugestões implementadas (obrigatório)
- Taxa de implementação 0-100 (obrigatório)

### Impacto por Categoria
- Lista de categorias com quantidade (opcional)

### Leitura Rápida
- Até 3 destaques (opcional, gerados automaticamente se vazio)

### Próximo Nível de Impacto
- Até 3 próximos passos (opcional, sugestões padrão se vazio)

### Footer / CTA
- Pergunta de convite à conversa (opcional, texto padrão)

## Estrutura de arquivos

```
app/
├── api/
│   └── pdf/
│       └── route.ts       # API route para gerar PDF (Puppeteer)
├── components/
│   ├── ROIForm.tsx        # Formulário de entrada
│   └── ROIPreview.tsx     # Preview interativo do PDF
├── globals.css            # Estilos globais (Tailwind)
├── layout.tsx             # Layout principal
├── page.tsx               # Página inicial
└── types.ts               # Definições de tipos TypeScript
```

## Notas

- Os camposopcionais com conteúdo vazio são automaticamente preenchidos com valores padrão
- O layout é ajustado para caber em 1 página A4
- Caso o conteúdo exceda 1 página, use os botões de escala (Normal/Compacto/Mínimo) no preview
- O PDF é gerado com o mesmo layout do preview
