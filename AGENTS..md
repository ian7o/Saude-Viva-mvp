# Agents — Sprint 2

> **Nota:** Este documento cobre exclusivamente a Sprint 2. Não altera nem substitui o agents.md da Sprint 1. As funcionalidades da Sprint 1 permanecem intactas.

---

## Contexto da Sprint 2

A Sprint 2 foca-se em três pilares funcionais de alta dependência entre si:

- **Gestão de Consultas** — agendamento, edição e organização de atendimentos.
- **Gestão de Pacientes** — registo e centralização de dados básicos dos pacientes.
- **Comunicação Interna Básica** — mensagens privadas entre profissionais e histórico de comunicações.

Estas funcionalidades entregam um fluxo clínico quase completo quando combinadas com as da Sprint 1.

---

## User Stories & Agentes

---

### US-S2-01 · Agendar Consulta
**Ator:** Rececionista  
**Prioridade:** Must | **Story Points:** 5

> *Como rececionista, quero agendar consultas para organizar os atendimentos dos pacientes.*

**Critérios de aceitação:**
- Deve ser possível criar uma consulta associando: paciente, médico, data, hora e clínica.
- O sistema deve impedir conflitos de agenda (mesmo médico, mesma hora).
- A consulta criada deve ficar visível no calendário do médico e na agenda da rececionista.

**Agente responsável — `AppointmentSchedulerAgent`**

| Campo | Detalhe |
|---|---|
| Papel | Orquestra a criação de novas consultas |
| Entradas | `patient_id`, `doctor_id`, `clinic_id`, `date`, `time` |
| Saídas | Consulta criada, confirmação ao utilizador, atualização do calendário |
| Ferramentas | `checkAvailability()`, `createAppointment()`, `notifyDoctor()` |
| Validações | Verifica disponibilidade antes de confirmar; rejeita conflitos de horário |

---

### US-S2-02 · Editar Informações de Consulta
**Ator:** Médico  
**Prioridade:** Must | **Story Points:** 3

> *Como médico, quero editar e atualizar informações relacionadas às consultas para manter os dados corretos.*

**Critérios de aceitação:**
- Deve ser possível editar dados de consultas já registadas (data, hora, notas clínicas, estado).
- As alterações devem ser registadas com timestamp e utilizador que editou.
- Apenas utilizadores autenticados com perfil de médico podem editar dados clínicos.

**Agente responsável — `AppointmentEditorAgent`**

| Campo | Detalhe |
|---|---|
| Papel | Gere a edição e atualização de consultas existentes |
| Entradas | `appointment_id`, campos a atualizar, `user_id` (médico autenticado) |
| Saídas | Consulta atualizada, log de alteração com timestamp |
| Ferramentas | `getAppointment()`, `updateAppointment()`, `auditLog()` |
| Validações | Verifica permissões do utilizador; rejeita edições sem autenticação válida |

---

### US-S2-03 · Registar Paciente
**Ator:** Rececionista  
**Prioridade:** Must | **Story Points:** 3

> *Como rececionista, quero registar informações básicas dos pacientes para manter os dados organizados.*

**Critérios de aceitação:**
- Deve ser possível registar: nome, contacto, data de nascimento e número de identificação.
- O sistema deve verificar duplicados pelo número de identificação antes de criar o registo.
- O paciente registado fica disponível para seleção no agendamento de consultas (US-S2-01).

**Agente responsável — `PatientRegistrationAgent`**

| Campo | Detalhe |
|---|---|
| Papel | Centraliza o registo e validação de dados básicos dos pacientes |
| Entradas | `name`, `contact`, `birthdate`, `identification_number` |
| Saídas | Perfil de paciente criado, alerta de duplicado se aplicável |
| Ferramentas | `checkDuplicate()`, `createPatient()`, `validateFields()` |
| Validações | Campos obrigatórios: nome, nº de identificação; contacto e data de nascimento recomendados |

---

### US-S2-04 · Histórico de Mensagens
**Ator:** Médico  
**Prioridade:** Should | **Story Points:** 3  
> ✅ **Implementado na Sprint 1** — Esta funcionalidade já se encontra desenvolvida. Consultar o `agents.md` da Sprint 1 para detalhes do agente responsável.

---

### US-S2-05 · Mensagens Privadas entre Profissionais
**Ator:** Médico / Rececionista  
**Prioridade:** Should | **Story Points:** 5  
> ✅ **Implementado na Sprint 1** — Esta funcionalidade já se encontra desenvolvida. Consultar o `agents.md` da Sprint 1 para detalhes do agente responsável.

---

## Dependências entre Agentes

```
PatientRegistrationAgent
        │
        ▼
AppointmentSchedulerAgent ──► AppointmentEditorAgent
```

- O **PatientRegistrationAgent** fornece os `patient_id` necessários ao **AppointmentSchedulerAgent**.
- O **AppointmentEditorAgent** depende de consultas previamente criadas pelo **AppointmentSchedulerAgent**.
- A comunicação interna (mensagens privadas e histórico) é gerida pelos agentes já implementados na Sprint 1.

---

## Resumo de Story Points

| User Story | Ator | Prioridade | SP | Estado |
|---|---|---|---|---|
| US-S2-01 Agendar Consulta | Rececionista | Must | 5 | 🔲 Sprint 2 |
| US-S2-02 Editar Consulta | Médico | Must | 3 | 🔲 Sprint 2 |
| US-S2-03 Registar Paciente | Rececionista | Must | 3 | 🔲 Sprint 2 |
| US-S2-04 Histórico de Mensagens | Médico | Should | 3 | ✅ Sprint 1 |
| US-S2-05 Mensagens Privadas | Médico / Rececionista | Should | 5 | ✅ Sprint 1 |
| **Total Sprint 2** | | | **11** | |

---

## Objetivo da Sprint 2

> Entregar um fluxo clínico coeso que permita **gerir consultas e pacientes**, **atualizar informações clínicas e administrativas** e **melhorar a comunicação interna** entre os profissionais da plataforma — sem quebrar qualquer funcionalidade desenvolvida na Sprint 1.