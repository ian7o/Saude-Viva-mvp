# AGENTS.md

## Project

Saude Viva - Clinic Management System (NestJS + React)

---

# Sprint Scope

## Sprint 1 — Gestão Clínica Base

Esta sprint deve implementar EXCLUSIVAMENTE as funcionalidades abaixo.

### US01 — Calendário Médico
Como médico, quero visualizar o meu calendário para poder acompanhar os pacientes e consultas do dia.

#### Critérios de Aceitação
- Calendário organizado por:
  - dia;
  - semana.
- Cada consulta deve apresentar:
  - nome do paciente;
  - descrição da consulta;
  - especialidade.
- O médico deve visualizar apenas as suas consultas.

#### Story Points
3

---

### US02 — Gestão de Documentos Clínicos
Como médico, quero adicionar, visualizar e descarregar documentos clínicos para agilizar o meu dia a dia sem depender do suporte em papel.

#### Critérios de Aceitação
- Deve ser possível carregar documentos clínicos.
- Deve ser possível visualizar documentos suportados diretamente na plataforma.
- Deve ser possível descarregar documentos.
- Caso o formato não permita visualização, o sistema deve disponibilizar download.

#### Story Points
5

---

### US03 — Organização dos Documentos Clínicos
Como médico, quero identificar documentos com data, local, sala e paciente correspondente para garantir uma melhor organização das informações.

#### Critérios de Aceitação
Os documentos devem apresentar:
- descrição;
- sala;
- paciente associado;
- data.

#### Story Points
2

---

# Base Project Rules

O projeto já possui uma codebase inicial extremamente básica utilizada apenas como modelo de estrutura.

## Regras obrigatórias

- Manter a arquitetura já existente do projeto base.
- Reaproveitar estrutura de pastas, organização e padrões existentes.
- Não refatorar desnecessariamente o projeto base.
- Não criar uma arquitetura nova.
- Não adicionar complexidade desnecessária.
- O foco é apenas entregar a Sprint 1 funcional.

---

# Backend Rules

## ORM

- Utilizar exclusivamente TypeORM.
- NÃO utilizar Prisma.
- Caso exista Prisma no projeto base:
  - remover dependências;
  - remover schemas;
  - remover services/configs relacionados;
  - substituir completamente por TypeORM.

## Stack obrigatória

- NestJS
- TypeORM
- PostgreSQL
- JWT apenas se já existir no projeto base

## Estrutura esperada

Criar apenas os módulos necessários para Sprint 1:

- auth (somente se já existir)
- doctors
- appointments
- documents
- patients

---

# Frontend Rules

- Manter React + Vite.
- Manter estrutura atual do frontend.
- Não adicionar state managers complexos.
- Utilizar apenas:
  - React
  - React Router
  - Axios

## Páginas esperadas

Implementar apenas:

- Login (caso já exista)
- Dashboard Médico
- Calendário Médico
- Lista de Documentos
- Upload de Documento
- Visualização de Documento

---

# Out of Scope

NÃO implementar:

- chat/mensagens;
- notificações;
- permissões avançadas;
- multi-clínica;
- monitorização;
- funcionalidades administrativas avançadas;
- gestão de utilizadores completa;
- funcionalidades do paciente;
- relatórios;
- dashboards analíticos;
- websockets;
- microservices;
- testes e2e complexos.

---

# Database Minimum Scope

## Entidades mínimas

### Doctor
- id
- name
- email

### Patient
- id
- name
- birthDate
- identificationNumber

### Appointment
- id
- description
- specialty
- date
- doctor
- patient

### ClinicalDocument
- id
- filename
- description
- room
- location
- uploadDate
- patient
- doctor
- appointment

---

# Quick Start

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start with Docker
docker-compose up --build

# Or run individually
# Backend: cd backend && npm run start:dev
# Frontend: cd frontend && npm run dev
```

---

# Default Login

- Email: `admin@saudeviva.com`
- Password: `admin123`

---

# API

- Backend: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/api/docs
- Frontend: http://localhost:3000

---

# Key Commands

```bash
# Backend
npm run lint
npm run test
npm run typecheck

# Frontend
npm run lint
npm run typecheck
```

---

# Tech Stack

- Backend: NestJS
- ORM: TypeORM
- Database: PostgreSQL
- Frontend: React + Vite
- Routing: React Router
- HTTP Client: Axios

### Save contex