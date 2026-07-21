ThreatLens AI
Document 4 — System Architecture
Version: 1.0
Status: Draft
Project: ThreatLens AI
Prepared By: Yug Patel

Table of Contents
Introduction
Architecture Goals
Architectural Principles
System Context
High-Level Architecture
Layered Architecture
Technology Stack Architecture
Component Overview
Core Request Lifecycle
Document Summary

1. Introduction
The System Architecture document describes the internal organization of ThreatLens AI, including its components, communication patterns, deployment model, and data flow.
Its purpose is to provide developers with a complete architectural understanding before implementation begins.
This document complements the Software Requirements Specification (SRS) by focusing on how the application is structured rather than what functionality it provides.

Objectives
The architecture aims to:
Build a modular and scalable platform.
Separate responsibilities across layers.
Simplify maintenance.
Support future expansion.
Improve reliability and security.
Enable independent evolution of components.

2. Architecture Goals
ThreatLens AI is designed around the following goals.
Scalability
Support increasing numbers of users and investigation requests without major architectural changes.

Maintainability
Keep modules independent so that changes remain localized.

Security
Protect authentication, investigation data, and API communication using layered security mechanisms.

Performance
Provide fast response times while handling AI processing efficiently.

Extensibility
Allow new investigation modules, AI providers, and integrations to be added with minimal impact on existing code.

Observability
Ensure that system behavior can be monitored through logging, metrics, and health checks.

3. Architectural Principles
Every architectural decision follows these engineering principles.

Separation of Concerns
Each subsystem has one primary responsibility.
Examples:
React handles presentation.
FastAPI handles orchestration.
AI services perform reasoning.
PostgreSQL stores persistent data.

Loose Coupling
Subsystems communicate only through defined interfaces.
No component should depend on another component's internal implementation.

High Cohesion
Closely related functionality remains within the same module.

Stateless Backend
The backend does not maintain user session state.
Each authenticated request is validated independently using JWT.

API-First Design
All frontend interactions occur through REST APIs.
Future mobile applications or external clients can consume the same APIs without architectural changes.

4. System Context
ThreatLens AI exists within a broader ecosystem of users, external services, and infrastructure.

System Context Diagram
                  ┌──────────────────────┐
                  │        User          │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   ThreatLens AI UI   │
                  └──────────┬───────────┘
                             │
                    HTTPS / REST API
                             │
                             ▼
                  ┌──────────────────────┐
                  │  ThreatLens Backend  │
                  └───────┬───────┬──────┘
                          │       │
                          │       │
                ┌─────────▼─┐   ┌─▼─────────┐
                │ Supabase  │   │ AI APIs   │
                │PostgreSQL │   │Groq,Tavily│
                └───────────┘   └───────────┘
                          │
                          ▼
                    OCR Processing
               (OpenCV + Tesseract)

External Systems
The platform communicates with:

5. High-Level Architecture
ThreatLens AI follows a layered client-server architecture.

High-Level Architecture Diagram
                    User
                     │
                     ▼
          React Frontend (Vite)
                     │
             HTTPS / REST APIs
                     │
                     ▼
            FastAPI Backend
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
 Authentication  Investigation   AI Engine
      │              │              │
      └──────────────┼──────────────┘
                     ▼
              Report Generator
                     │
                     ▼
          PostgreSQL (Supabase)

Architecture Characteristics
The architecture is:
Layered
Modular
Service-oriented
Stateless
API-driven
Cloud-ready

6. Layered Architecture
The system is divided into distinct layers.

Layer Overview
Presentation Layer
        │
        ▼
API Layer
        │
        ▼
Business Logic Layer
        │
        ▼
AI Processing Layer
        │
        ▼
Persistence Layer

Presentation Layer
Responsibilities:
User Interface
Forms
Routing
Dashboard
Visualization
Authentication state
Technology:
React
Bootstrap 5
React Bootstrap
Bootstrap Icons
Framer Motion

API Layer
Responsibilities:
Request routing
Validation
Authentication
Response formatting
Technology:
FastAPI

Business Logic Layer
Responsibilities:
Investigation workflows
Report generation
Dashboard aggregation
User management

AI Processing Layer
Responsibilities:
OCR pipeline
AI reasoning
Threat analysis
Recommendation generation

Persistence Layer
Responsibilities:
Data storage
Query execution
Transactions
Relationships
Technology:
PostgreSQL (Supabase)

7. Technology Stack Architecture
The architecture is built using modern, production-ready technologies.

8. Component Overview
Major architectural components:
Frontend
Authentication UI
Dashboard
Investigation Pages
AI Assistant
Reports
Profile

Backend
API Gateway
Authentication Service
Investigation Service
OCR Service
AI Service
Report Service
Dashboard Service

External Services
Groq API
Tavily Search API
OCR Engine
PostgreSQL

Component Interaction Overview
Frontend
    │
    ▼
API Gateway
    │
    ▼
Authentication
    │
    ▼
Investigation Service
    │
    ├─────────────┐
    ▼             ▼
OCR Service   AI Service
    │             │
    └──────┬──────┘
           ▼
     Report Service
           │
           ▼
      PostgreSQL

9. Core Request Lifecycle
Every investigation follows a standardized lifecycle.

Request Lifecycle
User Action
      │
      ▼
Frontend Validation
      │
      ▼
API Request
      │
      ▼
Authentication
      │
      ▼
Business Logic
      │
      ▼
AI / OCR Processing
      │
      ▼
Report Generation
      │
      ▼
Database Storage
      │
      ▼
API Response
      │
      ▼
Dashboard Update

Architectural Decisions
The following key decisions shape Version 1:
React for the presentation layer.
FastAPI as the backend orchestration framework.
PostgreSQL (Supabase) for persistent storage.
REST APIs for communication.
JWT-based stateless authentication.
Modular services with clearly defined responsibilities.
AI processing isolated from frontend logic.
External AI providers abstracted behind service interfaces.
These decisions provide a balance between simplicity, maintainability, and future scalability.

Learning Notes
Concepts Introduced
System Architecture
Layered Architecture
System Context
Client–Server Model
API-First Design
Separation of Concerns
Service-Oriented Components
Request Lifecycle
Why This Document?
The System Architecture document provides a shared mental model of how ThreatLens AI operates internally. By defining component boundaries, communication paths, and architectural principles early, the development team can build features consistently, reduce integration issues, and prepare the platform for future growth.

Document Status
Document 4 — System Architecture
Status: 🟡 In Progress
Next Section: C4 Architecture Model — including Context Diagram, Container Diagram, Component Diagram, Code-Level Architecture, responsibilities of each container, and interaction boundaries before moving into detailed sequence diagrams.
ThreatLens AI
Document 4 — System Architecture
Section 2 — C4 Architecture Model

10. C4 Architecture Overview
ThreatLens AI follows the C4 Model, a hierarchical approach to software architecture visualization.
The C4 Model consists of four levels:
Each level progressively reveals more implementation detail while maintaining architectural clarity.

Architecture Progression
Level 1
System Context
      │
      ▼
Level 2
Containers
      │
      ▼
Level 3
Components
      │
      ▼
Level 4
Code Structure

11. Level 1 — System Context
The System Context diagram shows how ThreatLens AI interacts with external actors and services.

Context Diagram
                    ┌───────────────────────┐
                    │         User          │
                    └───────────┬───────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │       ThreatLens AI         │
                 └───────┬───────────┬─────────┘
                         │           │
          ┌──────────────▼───┐   ┌──▼────────────┐
          │ Groq AI Service  │   │ Tavily Search │
          └──────────────────┘   └───────────────┘
                         │
                         ▼
                 ┌─────────────────┐
                 │ PostgreSQL DB   │
                 │ (Supabase)      │
                 └─────────────────┘
                         │
                         ▼
              OpenCV + Tesseract OCR

External Actors
User
Interacts with:
Authentication
Dashboard
Investigations
Reports
AI Assistant

External Services
ThreatLens AI communicates with:
Groq API
Tavily Search API
PostgreSQL (Supabase)
OpenCV
Tesseract OCR
These services remain independent of the application's internal implementation.

12. Level 2 — Container Architecture
A container represents an independently deployable or logically distinct part of the system.
For ThreatLens AI, the primary containers are:
React Frontend
FastAPI Backend
PostgreSQL Database
External AI Services

Container Diagram
                 User
                  │
                  ▼
        ┌───────────────────┐
        │ React Frontend    │
        │ (Vite + Bootstrap 5) │
        └─────────┬─────────┘
                  │ HTTPS / REST
                  ▼
        ┌───────────────────┐
        │ FastAPI Backend   │
        └───────┬───────────┘
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
 PostgreSQL   Groq API   Tavily API
 (Supabase)
                │
                ▼
        OCR Processing
(OpenCV + Tesseract)

Container Responsibilities
React Frontend
Responsibilities:
User Interface
Routing
Form Validation
Authentication State
Dashboard Rendering
Report Visualization

FastAPI Backend
Responsibilities:
Authentication
API Gateway
Business Logic
AI Orchestration
OCR Coordination
Report Generation

PostgreSQL (Supabase)
Responsibilities:
User Data
Investigations
Reports
Dashboard Data

External AI Services
Responsibilities:
Threat reasoning
Threat intelligence
OCR text extraction support

Container Communication
React Frontend
        │
 REST API (JSON)
        │
        ▼
FastAPI Backend
        │
        ├────────────┐
        ▼            ▼
Database      External APIs

13. Level 3 — Component Architecture
The backend is internally divided into multiple components.
Each component performs one clearly defined responsibility.

Backend Component Diagram
               API Gateway
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
Authentication  Investigation   Dashboard
Service         Service         Service
      │             │
      │             ├──────────────┐
      │             ▼              ▼
      │        OCR Service     AI Service
      │             │              │
      └─────────────┴──────┬───────┘
                            ▼
                     Report Service
                            │
                            ▼
                     Repository Layer
                            │
                            ▼
                     PostgreSQL DB

Component Responsibilities
API Gateway
Responsible for:
Routing requests
Authentication checks
Response formatting
Error handling

Authentication Service
Handles:
Registration
Login
JWT generation
Password verification

Investigation Service
Coordinates:
URL investigations
Screenshot investigations
QR investigations
Email investigations
Phone investigations

OCR Service
Responsible for:
Image preprocessing
OCR extraction
Text cleanup

AI Service
Responsible for:
Threat reasoning
Risk assessment
Recommendation generation
AI responses

Report Service
Responsible for:
Report creation
Report formatting
Executive summaries
Persistence coordination

Repository Layer
Responsible for:
CRUD operations
Database abstraction
Query optimization
Transaction handling

Component Communication
API Gateway
      │
      ▼
Authentication
      │
      ▼
Investigation
      │
 ┌────┴────┐
 ▼         ▼
OCR       AI
 └────┬────┘
      ▼
Report Service
      ▼
Repository
      ▼
Database

14. Level 4 — Code-Level Architecture
The final C4 level describes how the source code is organized.

Frontend Structure
src/
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── context/
├── services/
├── utils/
├── assets/
├── routes/
└── styles/

Backend Structure
backend/
│
├── app/
│   ├── api/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── middleware/
│   ├── database/
│   ├── utils/
│   └── core/
│
├── tests/
├── uploads/
└── main.py

Dependency Direction
Dependencies should always flow in one direction.
Frontend
     │
     ▼
API Layer
     │
     ▼
Controllers
     │
     ▼
Services
     │
     ▼
Repositories
     │
     ▼
Database
Higher layers must never depend directly on lower-level implementation details.

Design Rules
Every new feature should follow these architectural rules:
Maintain single responsibility.
Avoid circular dependencies.
Reuse existing services before creating new ones.
Keep business logic inside services.
Keep controllers lightweight.
Access the database only through repositories.
Validate all external inputs before processing.

Learning Notes
Concepts Introduced
C4 Model
System Context Diagram
Container Diagram
Component Diagram
Code-Level Architecture
Architectural Layers
Dependency Direction
Component Responsibilities
Why the C4 Model?
The C4 Model provides a consistent way to communicate architecture at different levels of detail. High-level stakeholders can understand the overall system context, while developers gain detailed insight into containers, components, and code organization. This layered perspective improves communication, simplifies onboarding, and helps maintain architectural consistency as the project evolves.

Document Progress
✅ Introduction
✅ High-Level Architecture
✅ Layered Architecture
✅ C4 Architecture Model
Next Section: Detailed Sequence Diagrams & End-to-End Workflows — covering login, registration, URL investigation, OCR investigation, AI reasoning, report generation, dashboard loading, profile management, and complete request lifecycles with sequence diagrams for each workflow.
ThreatLens AI
Document 4 — System Architecture
Section 3 — Detailed Sequence Diagrams & End-to-End Workflows

15. Sequence Diagram Overview
Sequence diagrams illustrate the chronological interaction between system components during a user request.
Each diagram answers:
Who initiates the request?
Which components participate?
What information is exchanged?
What processing occurs?
How is the final response returned?

Common Participants
The following participants appear throughout the workflows.

16. User Registration Workflow
Objective
Create a new user account securely.

Sequence Diagram
User
 │
 ▼
React Frontend
 │
 │ Submit Registration Form
 ▼
FastAPI Backend
 │
 ▼
Authentication Service
 │
 │ Validate Input
 │ Check Existing Email
 ▼
Repository Layer
 │
 ▼
PostgreSQL
 │
 ▲
 │ User Not Found
 │
 ▼
Authentication Service
 │
 │ Hash Password
 │ Create User
 ▼
Repository Layer
 │
 ▼
PostgreSQL
 │
 ▲
 │ User Created
 ▼
FastAPI Backend
 │
 ▼
React Frontend
 │
 ▼
User

Workflow Summary
User submits registration details.
Backend validates input.
Email uniqueness is verified.
Password is securely hashed.
User record is created.
Success response is returned.

17. Login Workflow
Objective
Authenticate an existing user and issue a JWT.

Sequence Diagram
User
 │
 ▼
React Frontend
 │
 │ Login Request
 ▼
FastAPI Backend
 │
 ▼
Authentication Service
 │
 │ Verify Credentials
 ▼
Repository Layer
 │
 ▼
PostgreSQL
 │
 ▲
 │ User Data
 ▼
Authentication Service
 │
 │ Verify Password
 │ Generate JWT
 ▼
FastAPI Backend
 │
 ▼
React Frontend
 │
 │ Store JWT
 ▼
Dashboard

Workflow Summary
Validate credentials.
Verify password hash.
Generate JWT.
Return authenticated user.
Redirect to dashboard.

18. URL Investigation Workflow
Objective
Analyze a submitted URL for potential cybersecurity threats.

Sequence Diagram
User
 │
 ▼
React Frontend
 │
 │ Submit URL
 ▼
FastAPI Backend
 │
 ▼
Investigation Service
 │
 ├───────────────┐
 ▼               ▼
Groq API    Tavily Search API
 │               │
 └───────┬───────┘
         ▼
AI Service
         │
         ▼
Report Service
         │
         ▼
Repository Layer
         │
         ▼
PostgreSQL
         │
         ▼
Frontend

Processing Steps
Validate URL.
Collect external threat intelligence.
Perform AI reasoning.
Determine risk level.
Generate structured report.
Save investigation.
Return report.

19. OCR Screenshot Investigation
Objective
Extract text from a screenshot and determine potential cyber threats.

Sequence Diagram
User
 │
 ▼
React Frontend
 │
 │ Upload Image
 ▼
FastAPI Backend
 │
 ▼
Investigation Service
 │
 ▼
OCR Service
 │
 ▼
OpenCV
 │
 ▼
Tesseract OCR
 │
 ▲
 │ Extracted Text
 ▼
AI Service
 │
 ▼
Groq API
 │
 ▼
Report Service
 │
 ▼
Repository Layer
 │
 ▼
PostgreSQL
 │
 ▼
Frontend

Processing Pipeline
Validate image.
Improve image quality.
Extract text.
Analyze extracted content.
Generate report.
Save investigation.
Display findings.

20. QR Code Investigation
Sequence Diagram
User
 │
 ▼
Upload QR Image
 │
 ▼
OCR / QR Decoder
 │
 ▼
Extract URL/Data
 │
 ▼
Investigation Service
 │
 ▼
AI Analysis
 │
 ▼
Report Generation
 │
 ▼
Database

21. Email Investigation
Sequence Diagram
User
 │
 ▼
Paste Email
 │
 ▼
Investigation Service
 │
 ▼
Header Analysis
 │
 ▼
Content Analysis
 │
 ▼
Groq API
 │
 ▼
Threat Assessment
 │
 ▼
Report Service
 │
 ▼
Database

Analysis Includes
Sender inspection
Subject evaluation
Content review
Phishing indicators
Suspicious links
Recommendations

22. Phone Number Investigation
Sequence Diagram
User
 │
 ▼
Submit Phone Number
 │
 ▼
Investigation Service
 │
 ▼
Validation
 │
 ▼
Threat Intelligence
 │
 ▼
AI Analysis
 │
 ▼
Risk Report
 │
 ▼
Database

Processing
Format validation.
Intelligence lookup.
AI interpretation.
Risk scoring.
Report generation.

23. AI Assistant Workflow
Objective
Provide conversational cybersecurity guidance.

Sequence Diagram
User
 │
 ▼
Frontend Chat
 │
 ▼
Backend
 │
 ▼
AI Service
 │
 ├─────────────┐
 ▼             ▼
Groq API   Tavily Search API
 │             │
 └──────┬──────┘
        ▼
AI Response
        │
        ▼
Frontend

Workflow
Receive user prompt.
Retrieve supporting intelligence (when required).
Generate AI response.
Return formatted answer.

24. Report Generation Workflow
Sequence Diagram
Investigation Complete
         │
         ▼
Collect Results
         │
         ▼
Generate Summary
         │
         ▼
Risk Assessment
         │
         ▼
Recommendations
         │
         ▼
Store Report
         │
         ▼
Return Report

Report Sections
Every report contains:
Executive Summary
Investigation Details
Threat Findings
Risk Level
Confidence Score
Recommendations
Timestamp

25. Dashboard Loading Workflow
Sequence Diagram
User
 │
 ▼
Dashboard
 │
 ▼
Backend
 │
 ▼
Dashboard Service
 │
 ▼
Repository Layer
 │
 ▼
PostgreSQL
 │
 ▲
 │ Dashboard Data
 ▼
Backend
 │
 ▼
Frontend

Dashboard Data
The dashboard retrieves:
Total investigations
Recent reports
Risk distribution
Investigation history
Weekly analytics

26. Profile Update Workflow
Sequence Diagram
User
 │
 ▼
Edit Profile
 │
 ▼
Backend
 │
 ▼
Authentication
 │
 ▼
Repository
 │
 ▼
Database
 │
 ▲
 │ Updated
 ▼
Frontend

27. Error Handling Workflow
Every request follows a consistent error handling path.
Request
 │
 ▼
Validation
 │
 ├───────────────┐
 │ Valid         │ Invalid
 ▼               ▼
Business      Error Response
Logic             │
 │                ▼
 ▼           Frontend
Success

Failure Recovery Strategy
If an error occurs:
Stop processing safely.
Record diagnostic information.
Return a standardized error response.
Avoid exposing internal implementation details.
Preserve system consistency.

Architectural Observations
Across all workflows, several design principles remain consistent:
Authentication occurs before protected operations.
Business logic is centralized within services.
External providers are accessed only through dedicated service layers.
Database writes occur after successful processing.
Responses follow a standardized API contract.
Errors are handled gracefully without exposing internal details.
These conventions improve maintainability, simplify debugging, and provide predictable behavior across every feature.

Learning Notes
Concepts Introduced
Sequence Diagrams
Request Lifecycle
Authentication Flow
Investigation Pipelines
AI Interaction Flow
OCR Processing Workflow
Report Generation Pipeline
Dashboard Data Retrieval
Error Handling Sequence
Why Sequence Diagrams?
Static architecture diagrams explain what exists, whereas sequence diagrams explain how the system behaves over time. They clarify the order of operations, participant responsibilities, and data flow, making them valuable during implementation, API design, testing, and troubleshooting.

Document Progress
✅ Introduction
✅ High-Level Architecture
✅ Layered Architecture
✅ C4 Architecture Model
✅ Sequence Diagrams & End-to-End Workflows
Next Section: Data Flow Architecture & Internal Processing Pipelines — covering data flow diagrams (DFDs), investigation pipelines, AI reasoning pipeline, OCR processing pipeline, report generation pipeline, state transitions, caching strategy, and internal data movement throughout the system.
ThreatLens AI
Document 4 — System Architecture
Section 4 — Data Flow Architecture & Internal Processing Pipelines

28. Data Flow Architecture
Data Flow Architecture illustrates how information moves through ThreatLens AI, from user input to final report generation.
Unlike sequence diagrams, which emphasize interactions over time, Data Flow Diagrams (DFDs) emphasize how data is transformed throughout the system.

Data Flow Principles
The architecture follows these principles:
Single source of truth
One-way data flow
Stateless processing
Data validation before transformation
Persistent storage only after successful processing

High-Level Data Flow
User Input
    │
    ▼
Frontend Validation
    │
    ▼
REST API
    │
    ▼
Business Logic
    │
 ┌──┴─────────────┐
 ▼                ▼
OCR Engine    AI Engine
 └──────┬─────────┘
        ▼
 Investigation Result
        │
        ▼
 Report Generator
        │
        ▼
 PostgreSQL
        │
        ▼
 Dashboard / History

29. Investigation Pipeline
Every investigation follows a common processing pipeline regardless of input type.
Receive Request
      │
      ▼
Input Validation
      │
      ▼
Identify Investigation Type
      │
      ▼
Execute Specialized Processor
      │
      ▼
AI Threat Analysis
      │
      ▼
Generate Structured Report
      │
      ▼
Persist Results
      │
      ▼
Return Response

Specialized Investigation Pipelines
URL
Validation → Threat Intelligence → AI Analysis → Report
Screenshot
Image Validation → OpenCV → OCR → AI Analysis → Report
QR Code
Decode → Validation → Threat Intelligence → AI Analysis → Report
Email
Header Parsing → Content Analysis → AI Analysis → Report
Phone
Validation → Intelligence Lookup → AI Analysis → Report

AI Reasoning Pipeline
Investigation Result
        │
        ▼
Prompt Builder
        │
        ▼
Groq API
        │
        ▼
Threat Interpretation
        │
        ▼
Risk Classification
        │
        ▼
Recommendations
        │
        ▼
Structured JSON Output

OCR Processing Pipeline
Image Upload
      │
      ▼
Image Validation
      │
      ▼
Noise Reduction
      │
      ▼
Contrast Enhancement
      │
      ▼
Tesseract OCR
      │
      ▼
Text Cleanup
      │
      ▼
AI Analysis

Report Generation Pipeline
Every investigation ultimately produces a standardized report.
AI Findings
     │
     ▼
Executive Summary
     │
     ▼
Threat Findings
     │
     ▼
Risk Assessment
     │
     ▼
Recommendations
     │
     ▼
Confidence Score
     │
     ▼
Database Storage

Investigation State Machine
Each investigation transitions through predefined states.
Created
   │
   ▼
Validated
   │
   ▼
Processing
   │
   ├──────────────┐
   │              │
   ▼              ▼
Completed      Failed

Caching Strategy
Version 1 uses minimal caching.
Potential cache candidates:
Dashboard statistics
Frequently accessed reports
Threat intelligence lookups
AI prompt templates
Future versions may introduce Redis for distributed caching.

Data Ownership

Learning Notes
Topics covered:
Data Flow Diagrams
Processing Pipelines
State Machines
Data Ownership
Internal Processing
AI Pipeline Design
OCR Pipeline

Section Status
✅ Data Flow Architecture Complete

Section 5 — Deployment, Infrastructure & Scalability

30. Deployment Architecture
ThreatLens AI follows a cloud-native deployment model.
Internet
    │
    ▼
Render
    │
 ┌──┴─────────┐
 ▼            ▼
Frontend   Backend
                │
     ┌──────────┼────────────┐
     ▼          ▼            ▼
Supabase     Groq API   Tavily API

Infrastructure Components

Deployment Responsibilities
Frontend
UI Rendering
Routing
API Requests
Backend
Authentication
Investigation Processing
Report Generation
Database Access
Supabase
Persistent Storage
Relational Data
Backups
External APIs
AI reasoning
Threat intelligence

Scaling Strategy
Horizontal scaling should be supported for:
Backend instances
API servers
AI request processing
Vertical scaling may be used initially.

Load Distribution
Users
   │
   ▼
Load Balancer
   │
   ├─────────┐
   ▼         ▼
Backend   Backend
Instance1 Instance2
      │
      ▼
Supabase

Availability Strategy
Future production deployments should support:
Automatic restarts
Health checks
Rolling deployments
Backup restoration
Monitoring

Disaster Recovery
Recovery process:
Restore database.
Redeploy backend.
Redeploy frontend.
Restore environment variables.
Verify health endpoints.
Resume traffic.

Monitoring Architecture
Monitor:
API latency
Database latency
OCR duration
AI response time
Error rates
CPU usage
Memory usage

Logging Pipeline
Application
      │
      ▼
Structured Logs
      │
      ▼
Monitoring Platform
      │
      ▼
Dashboards & Alerts

Future Infrastructure
Planned enhancements include:
Redis cache
CDN for static assets
Background job queue
Multi-region deployment
Object storage for uploads
Kubernetes orchestration
CI/CD automation
Centralized observability

Architectural Evolution Roadmap
Version 1
Modular monolith
REST APIs
PostgreSQL
External AI

Version 2
Redis
Background workers
WebSockets
Real-time notifications

Version 3
Microservices
Event-driven architecture
Multi-agent AI
Enterprise deployment

Architecture Decision Records (ADRs)
The following major architectural decisions guide Version 1:

Final Architecture Summary
ThreatLens AI is designed as a layered, modular, API-first platform.
Key architectural characteristics:
Client-server architecture
Layered design
Modular services
Stateless backend
REST communication
Cloud-ready deployment
AI-assisted processing
Secure authentication
Relational persistence
Extensible infrastructure
The architecture emphasizes clear responsibility boundaries, making the system easier to maintain, test, scale, and evolve as new cybersecurity capabilities are introduced.

Learning Notes
Concepts Introduced
Data Flow Diagrams (DFDs)
Processing Pipelines
State Machines
Cloud Deployment
Infrastructure Topology
Scalability
Monitoring
Disaster Recovery
Architecture Decision Records (ADRs)
Why These Sections?
A complete system architecture should explain not only the software structure but also how data moves, how the system is deployed, how it scales under load, and why key engineering decisions were made. These sections provide the operational perspective required to transition from design to implementation.

Document Status
Document 4 — System Architecture
Status: ✅ Completed
The document now covers:
Introduction & Architecture Goals
High-Level Architecture
Layered Architecture
C4 Model
Sequence Diagrams
Data Flow Architecture
Processing Pipelines
Deployment Architecture
Infrastructure
Scalability
Monitoring
Disaster Recovery
Architecture Decision Records (ADRs)
Future Evolution Roadmap
Next Document: Document 5 — UI/UX Design System, which will define the complete visual language of ThreatLens AI, including design principles, color system, typography, spacing, components, accessibility guidelines, motion design, responsive behavior, and page-by-page design specifications.
