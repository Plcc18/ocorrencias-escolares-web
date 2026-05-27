# EscolaGestão — Frontend

Sistema de gestão de ocorrências escolares. Frontend completo em **React + TypeScript + Vite + TailwindCSS**.

---

## Stack

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5.5 | Tipagem |
| Vite | 5 | Build tool |
| TailwindCSS | 3.4 | Estilos |
| React Router | 6 | Roteamento |
| TanStack Query | 5 | Servidor de estado / cache |
| Axios | 1.7 | HTTP client |
| React Hot Toast | 2.4 | Notificações |
| Lucide React | 0.408 | Ícones |
| date-fns | 3.6 | Manipulação de datas |

---

## Instalação

```bash
# 1. Clone ou copie o projeto
cd escola-frontend

# 2. Instale dependências
npm install

# 3. Configure variável de ambiente
cp .env.example .env
# Edite .env e ajuste VITE_API_URL se necessário

# 4. Inicie em desenvolvimento
npm run dev

# 5. Build para produção
npm run build
```

O servidor roda em **http://localhost:5173** por padrão.

---

## Estrutura de Pastas

```
src/
├── api/                  # Services de chamada HTTP
│   ├── axios.ts          # Instância + interceptors
│   ├── auth.ts
│   ├── students.ts
│   ├── teachers.ts
│   ├── grades.ts
│   └── occurrences.ts
│
├── components/
│   └── common/           # Componentes reutilizáveis
│       ├── PageHeader.tsx
│       ├── OccurrenceBadge.tsx
│       ├── StatusBadge.tsx
│       └── EmptyState.tsx
│
├── contexts/
│   └── AuthContext.tsx   # Estado global de autenticação
│
├── guards/
│   ├── AuthGuard.tsx     # Redireciona não autenticados
│   └── RoleGuard.tsx     # Controle por perfil (ADMIN/TEACHER)
│
├── hooks/                # Hooks TanStack Query
│   ├── useStudents.ts
│   ├── useTeachers.ts
│   ├── useGrades.ts
│   └── useOccurrences.ts
│
├── layouts/
│   ├── AppLayout.tsx     # Layout principal com sidebar
│   └── AuthLayout.tsx    # Layout para login
│
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudentsPage.tsx
│   ├── TeachersPage.tsx
│   ├── GradesPage.tsx
│   ├── OccurrencesPage.tsx
│   └── NewOccurrencePage.tsx
│
├── types/                # Tipos TypeScript espelhando o backend
│   ├── index.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── grade.ts
│   ├── occurrence.ts
│   ├── student.ts
│   └── teacher.ts
│
└── utils/
    ├── format.ts         # Formatação de datas, telefones
    └── occurrenceTypes.ts # Mapa de tipos de ocorrência + labels/cores
```

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | URL base do backend |

---

## Perfis de Acesso

| Perfil | Acesso |
|---|---|
| `ADMIN` | Dashboard, Alunos, Professores, Turmas, Ocorrências (todas), Registrar |
| `TEACHER` | Dashboard, Alunos (leitura), Ocorrências (próprias), Registrar |
| `STUDENT` | Apenas login (sem telas implementadas) |

---

## Backend — Endpoints Necessários

### Autenticação
```
POST   /api/auth/login       { email, password } → { accessToken, tokenType, userId, email, role }
GET    /api/auth/me          → { id, email, username, role, createdAt }
```

### Alunos
```
GET    /api/students                        ?name=&gradeId=&status=&page=&size=  → Page<Student>
GET    /api/students/{id}                   → Student
GET    /api/students/grade/{gradeId}        → Student[]   (lista sem paginação para selects)
POST   /api/students                        StudentDTO → Student
PUT    /api/students/{id}                   StudentDTO → Student
DELETE /api/students/{id}
```

### Turmas
```
GET    /api/grades            → Grade[]
GET    /api/grades/{id}       → Grade
POST   /api/grades            GradeDTO → Grade
PUT    /api/grades/{id}       GradeDTO → Grade
DELETE /api/grades/{id}
```

### Professores
```
GET    /api/teachers          → Teacher[]
GET    /api/teachers/{id}     → Teacher
POST   /api/teachers          TeacherDTO → Teacher
PUT    /api/teachers/{id}     TeacherDTO → Teacher
DELETE /api/teachers/{id}
```

### Ocorrências
```
GET    /api/occurrences       ?studentName=&teacherId=&gradeId=&occurrenceType=&startDate=&endDate=&page=&size=&sort= → Page<Occurrence>
GET    /api/occurrences/{id}  → Occurrence
POST   /api/occurrences       OccurrenceDTO → Occurrence
PUT    /api/occurrences/{id}  OccurrenceDTO → Occurrence
DELETE /api/occurrences/{id}
GET    /api/occurrences/summary → { total, thisMonth, byType, recentOccurrences }
```

---

## DTOs esperados do Backend

### StudentDTO
```json
{
  "name": "João da Silva",
  "enrollment": "2024001",
  "gradeId": 1,
  "course": "Ensino Médio",
  "shift": "MANHÃ",
  "status": "ATIVO",
  "email": "joao@email.com",
  "birthDate": "2008-03-15",
  "guardian": "Maria da Silva",
  "guardianPhone": "(85) 99999-0000",
  "guardianEmail": "maria@email.com",
  "notes": ""
}
```

### OccurrenceDTO
```json
{
  "studentId": 10,
  "gradeId": 2,
  "occurrenceType": "DISCIPLINA",
  "description": "Aluno perturbou a aula repetidamente.",
  "occurrenceDate": "2024-11-15"
}
```

### AuthResponse
```json
{
  "accessToken": "eyJhbGc...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "admin@escola.com",
  "role": "ADMIN"
}
```

### PageResponse (paginação padrão Spring)
```json
{
  "content": [...],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

---

## Configuração CORS no Spring Boot

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://seudominio.com"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

---

## Segurança JWT no Spring Boot

O frontend envia o token no header:
```
Authorization: Bearer <token>
```

Configure o `SecurityFilterChain` para liberar `/api/auth/**` e proteger o restante.

**Rotas que PROFESSOR não deve acessar:**
- `POST/PUT/DELETE /api/students`
- `POST/PUT/DELETE /api/teachers`
- `POST/PUT/DELETE /api/grades`
- `DELETE /api/occurrences`

**Regra de visibilidade de ocorrências:**
- `ADMIN`: vê todas
- `TEACHER`: apenas as que `teacherId = usuário logado`

Implemente essa lógica no `OccurrenceService`, verificando o perfil do usuário autenticado.

---

## Tipos de Ocorrência Suportados

```
DISCIPLINA  — Indisciplina
FALTA       — Falta
ELOGIO      — Elogio
ADVERTENCIA — Advertência
SUSPENSAO   — Suspensão
ATRASO      — Atraso
CELULAR     — Uso de celular
OUTRO       — Outro
```

---

## Scripts

```bash
npm run dev      # Dev com HMR
npm run build    # Build produção
npm run preview  # Visualiza o build
npm run lint     # ESLint
```
