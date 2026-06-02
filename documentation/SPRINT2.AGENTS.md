# Agents — Sprint 2

> **Note:** This document covers Sprint 2 exclusively. It does not alter or replace the Sprint 1 agents.md. Sprint 1 functionalities remain intact.

---

## Sprint 2 Context

Sprint 2 focuses on three highly interdependent functional pillars:

* **Appointment Management** — scheduling, editing, and organizing appointments.
* **Patient Management** — registration and centralization of basic patient data.
* **Basic Internal Communication** — private messages between professionals and communication history.

These functionalities deliver an almost complete clinical workflow when combined with those from Sprint 1.

---

## User Stories & Agents

---

### US-S2-01 · Schedule Appointment

**Actor:** Receptionist
**Priority:** Must | **Story Points:** 5

> *As a receptionist, I want to schedule appointments to organize patient care.*

**Acceptance Criteria:**

* It must be possible to create an appointment by associating: patient, doctor, clinic, date, and time.
* The system must prevent scheduling conflicts (same doctor, same time).
* The created appointment must be visible in the doctor's calendar and in the receptionist's schedule.

**Responsible Agent — `AppointmentSchedulerAgent`**

| Field       | Detail                                                              |
| ----------- | ------------------------------------------------------------------- |
| Role        | Orchestrates the creation of new appointments                       |
| Inputs      | `patient_id`, `doctor_id`, `clinic_id`, `date`, `time`              |
| Outputs     | Created appointment, user confirmation, calendar update             |
| Tools       | `checkAvailability()`, `createAppointment()`, `notifyDoctor()`      |
| Validations | Checks availability before confirming; rejects scheduling conflicts |

---

### US-S2-02 · Edit Appointment Information

**Actor:** Doctor
**Priority:** Must | **Story Points:** 3

> *As a doctor, I want to edit and update appointment-related information to keep the data accurate.*

**Acceptance Criteria:**

* It must be possible to edit data from already registered appointments (date, time, clinical notes, status).
* Changes must be recorded with timestamp and the user who made the edit.
* Only authenticated users with a doctor profile may edit clinical data.

**Responsible Agent — `AppointmentEditorAgent`**

| Field       | Detail                                                                |
| ----------- | --------------------------------------------------------------------- |
| Role        | Manages the editing and updating of existing appointments             |
| Inputs      | `appointment_id`, fields to update, `user_id` (authenticated doctor)  |
| Outputs     | Updated appointment, change log with timestamp                        |
| Tools       | `getAppointment()`, `updateAppointment()`, `auditLog()`               |
| Validations | Verifies user permissions; rejects edits without valid authentication |

---

### US-S2-03 · Register Patient

**Actor:** Receptionist
**Priority:** Must | **Story Points:** 3

> *As a receptionist, I want to register basic patient information to keep data organized.*

**Acceptance Criteria:**

* It must be possible to register: name, contact, birth date, and identification number.
* The system must check for duplicates using the identification number before creating the record.
* The registered patient becomes available for selection when scheduling appointments (US-S2-01).

**Responsible Agent — `PatientRegistrationAgent`**

| Field       | Detail                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| Role        | Centralizes registration and validation of patients' basic data                  |
| Inputs      | `name`, `contact`, `birthdate`, `identification_number`                          |
| Outputs     | Created patient profile, duplicate alert if applicable                           |
| Tools       | `checkDuplicate()`, `createPatient()`, `validateFields()`                        |
| Validations | Required fields: name, identification number; contact and birth date recommended |

---

### US-S2-04 · Message History

**Actor:** Doctor
**Priority:** Should | **Story Points:** 3

> ✅ **Implemented in Sprint 1** — This functionality has already been developed. See Sprint 1 `agents.md` for details about the responsible agent.

---

### US-S2-05 · Private Messages Between Professionals

**Actor:** Doctor / Receptionist
**Priority:** Should | **Story Points:** 5

> ✅ **Implemented in Sprint 1** — This functionality has already been developed. See Sprint 1 `agents.md` for details about the responsible agent.

---

## Agent Dependencies

```text
PatientRegistrationAgent
        │
        ▼
AppointmentSchedulerAgent ──► AppointmentEditorAgent
```

* The **PatientRegistrationAgent** provides the `patient_id` required by the **AppointmentSchedulerAgent**.
* The **AppointmentEditorAgent** depends on appointments previously created by the **AppointmentSchedulerAgent**.
* Internal communication (private messages and message history) is managed by the agents already implemented in Sprint 1.

---

## Story Points Summary

| User Story                    | Actor                 | Priority | SP     | Status      |
| ----------------------------- | --------------------- | -------- | ------ | ----------- |
| US-S2-01 Schedule Appointment | Receptionist          | Must     | 5      | 🔲 Sprint 2 |
| US-S2-02 Edit Appointment     | Doctor                | Must     | 3      | 🔲 Sprint 2 |
| US-S2-03 Register Patient     | Receptionist          | Must     | 3      | 🔲 Sprint 2 |
| US-S2-04 Message History      | Doctor                | Should   | 3      | ✅ Sprint 1  |
| US-S2-05 Private Messages     | Doctor / Receptionist | Should   | 5      | ✅ Sprint 1  |
| **Total Sprint 2**            |                       |          | **11** |             |

---

## Sprint 2 Goal

> Deliver a cohesive clinical workflow that enables **appointment and patient management**, **updating clinical and administrative information**, and **improving internal communication** among platform professionals — without breaking any functionality developed in Sprint 1.
