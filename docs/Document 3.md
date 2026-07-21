ThreatLens AI
Document 3 — Software Requirements Specification (SRS)
Version: 1.0
Status: Draft
Project: ThreatLens AI
Prepared By: Yug Patel

Table of Contents
Introduction
Purpose
Scope
Definitions & Terminology
Overall System Description
System Overview
User Classes
Product Perspective
Assumptions & Dependencies
System Constraints

1. Introduction
This Software Requirements Specification (SRS) defines the technical requirements for the design, development, deployment, and maintenance of ThreatLens AI, an AI-powered Cyber Threat Intelligence and Investigation Platform.
The purpose of this document is to provide software engineers with a complete understanding of the system before implementation begins.
Unlike the Product Requirements Document (PRD), which focuses on user-facing functionality, this SRS specifies the software architecture, technical behavior, engineering constraints, interfaces, security requirements, and implementation standards.
This document serves as the primary technical reference throughout the software development lifecycle.

2. Purpose
The objectives of this document are to:
Define the software architecture.
Specify technical requirements.
Describe interactions between system components.
Establish engineering standards.
Identify system constraints.
Define external integrations.
Document security requirements.
Support future maintenance and scalability.

3. Scope
ThreatLens AI is a web-based application that enables users to investigate cybersecurity threats using Artificial Intelligence, OCR, computer vision, and external threat intelligence.
The system accepts multiple input types—including URLs, screenshots, QR codes, email content, phone numbers, and natural language queries—and processes them through specialized services to produce structured investigation reports.
The first software release focuses on individual users with secure authentication, investigation workflows, AI-assisted analysis, and persistent report storage.

4. Definitions & Terminology

5. Overall System Description
ThreatLens AI follows a modular client-server architecture.
The frontend is responsible for presentation, user interaction, authentication state, and data visualization.
The backend orchestrates business logic, AI services, OCR processing, database operations, and report generation.
Each subsystem has a clearly defined responsibility, allowing independent development, testing, and future scalability.

High-Level Architecture
                User
                  │
                  ▼
         React Frontend
                  │
        REST API Requests
                  │
                  ▼
         FastAPI Backend
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
Authentication  Investigation  AI Services
    │             │             │
    └──────┬──────┴──────┬──────┘
           ▼             ▼
      PostgreSQL     External APIs
        (Supabase)    (Groq, Tavily)

6. System Overview
ThreatLens AI consists of multiple independent services that communicate through REST APIs.
Core subsystems include:
Authentication Service
Investigation Service
AI Reasoning Service
OCR Processing Service
Report Generation Service
Dashboard Analytics Service
User Management Service
Each subsystem is designed to minimize coupling and maximize maintainability.

Primary Data Flow
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
     ▼
AI / OCR Processing
     │
     ▼
Threat Analysis
     │
     ▼
Report Generation
     │
     ▼
Database Storage
     │
     ▼
Dashboard & History

7. User Classes
Guest User
Capabilities:
View landing page.
Explore product information.
Register.
Log in.
Restrictions:
Cannot perform investigations.
Cannot access protected APIs.
Cannot view reports.

Authenticated User
Capabilities:
Perform investigations.
Access dashboard.
View reports.
Use AI assistant.
Manage profile.
Access investigation history.
Restrictions:
Cannot access administrative functionality (reserved for future versions).

8. Product Perspective
ThreatLens AI operates as a standalone web application.
The system interacts with external AI providers but remains independent of any specific vendor implementation.
This abstraction enables future migration to alternative AI models without requiring major architectural changes.
The platform is composed of modular services that communicate using REST APIs and standardized JSON responses.

9. Assumptions & Dependencies
The system assumes:
Users have a modern web browser.
JavaScript is enabled.
Internet connectivity is available.
External AI services are operational.
OCR libraries are installed correctly.
PostgreSQL database is accessible.
Environment variables are configured properly.

External Dependencies
Frontend
React
Vite
Bootstrap 5
React Bootstrap
Bootstrap Icons
React Router
Axios
Framer Motion
Recharts

Backend
FastAPI
Python
SQLAlchemy
Uvicorn
Pydantic

Artificial Intelligence
Groq API
Tavily Search API

Computer Vision
OpenCV
Tesseract OCR

Database
PostgreSQL (Supabase)

Deployment
Docker
Render

10. System Constraints
The following constraints apply to Version 1.0.

Technical Constraints
Web application only.
REST architecture.
Stateless backend.
JSON communication.
JWT authentication.
PostgreSQL database.
JavaScript frontend (no TypeScript).
Responsive design required.

Performance Constraints
Target objectives:

Security Constraints
The system must:
Hash passwords.
Validate all inputs.
Protect authenticated routes.
Prevent unauthorized access.
Secure secrets using environment variables.
Avoid exposing internal system information in client responses.

Scalability Constraints
The architecture should support:
Additional investigation modules.
Alternative AI providers.
Multiple OCR engines.
Future microservice migration.
Horizontal backend scaling.

Learning Notes
Concepts Introduced
Software Requirements Specification (SRS)
Modular Architecture
Client–Server Design
Technical Constraints
Engineering Assumptions
External Dependencies
High-Level System Architecture
System Data Flow
Why This Document Matters
The SRS bridges the gap between product planning and software engineering. It provides developers with a precise technical understanding of the system before implementation begins, reducing ambiguity and improving consistency across the codebase.
A well-structured SRS enables scalable architecture, easier maintenance, and smoother collaboration between frontend, backend, AI, DevOps, and QA teams.

Document Status
Document 3 — Software Requirements Specification
Status: 🟡 In Progress
Next Section: Functional Architecture & Module Specifications (Frontend Architecture, Backend Architecture, AI Engine, OCR Service, Authentication Service, Report Service, and Dashboard Service)
Document 3 — Software Requirements Specification (SRS)
Section 2 — Functional Architecture & Module Specifications

11. Functional Architecture
ThreatLens AI follows a layered modular architecture, where each subsystem is responsible for a single concern.
This architecture promotes:
High cohesion
Low coupling
Maintainability
Testability
Scalability
No module should directly access another module's internal implementation. Communication must occur through clearly defined service interfaces.

Overall Functional Architecture
                        User
                          │
                          ▼
                React Frontend (UI)
                          │
                    REST API (JSON)
                          │
                          ▼
                  FastAPI Backend
                          │
 ┌──────────────┬──────────────┬──────────────┐
 │              │              │              │
 ▼              ▼              ▼              ▼
Authentication Investigation  AI Engine   Report Engine
 │              │              │              │
 └──────┬───────┴──────┬───────┴──────────────┘
        ▼              ▼
   OCR Service     Database Service
        │              │
        ▼              ▼
    OpenCV + OCR   PostgreSQL (Supabase)

Architectural Principles
Every component must follow these engineering principles.
Single Responsibility Principle
Each module should perform one well-defined responsibility.
Examples:
Authentication handles authentication only.
OCR extracts text only.
AI Engine performs reasoning only.
Report Engine generates reports only.

Loose Coupling
Subsystems should communicate only through service interfaces.
Example:
The AI Engine should never directly access frontend components.

High Cohesion
Related functionality should remain within the same module.
For example:
All authentication logic belongs inside the Authentication Service.

Reusability
Business logic should be reusable by multiple endpoints whenever possible.
Duplicate implementations should be avoided.

Extensibility
Future modules should integrate without requiring changes to existing implementations.
Examples:
Malware Scanner
Browser Extension
VirusTotal Integration
Multi-Agent AI

12. Frontend Architecture
Responsibilities
The frontend is responsible for:
User Interface
Routing
Form Validation
API Communication
Authentication State
Dashboard Rendering
Charts
User Interaction
The frontend should never contain business logic that belongs on the server.

Frontend Layers
Pages
   │
   ▼
Reusable Components
   │
   ▼
Custom Hooks
   │
   ▼
API Services
   │
   ▼
Backend REST APIs

Core Directories
src/
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── utils/
├── context/
├── assets/
├── routes/
└── styles/

Responsibilities by Layer
Pages
Responsible for:
Screen composition
Route-level state
Navigation

Components
Reusable UI elements.
Examples:
Navbar
Button
Modal
Card
Input
Chart
Loader

Services
Responsible for:
API calls
Authentication requests
Investigation requests
No UI logic should exist inside services.

Utilities
Contains helper functions such as:
Date formatting
Risk color mapping
Validation helpers
Common constants

13. Backend Architecture
The backend acts as the orchestration layer.
Responsibilities include:
Authentication
Business logic
AI orchestration
OCR coordination
Report generation
Database access
Authorization

Backend Layers
API Routes
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

Responsibilities
API Routes
Receive HTTP requests.
Responsible only for:
Routing
Request validation
Response formatting

Controllers
Coordinate requests.
Responsible for:
Calling services
Returning responses
Handling exceptions
Controllers should remain lightweight.

Services
Contain business logic.
Examples:
URL Investigation
AI Analysis
OCR Processing
Report Generation
This is the core of the application.

Repositories
Responsible for database interaction only.
Examples:
Create Report
Update User
Read History
Delete Investigation
No business logic belongs here.

Backend Directory Structure
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
│   ├── core/
│   ├── utils/
│   └── database/
│
├── uploads/
├── tests/
└── main.py

14. Authentication Service
Responsibilities
The Authentication Service manages:
Registration
Login
JWT generation
Password hashing
Password verification
Protected routes
Session validation

Inputs
Registration Request
Login Request
Password Reset Request

Outputs
JWT Token
Authenticated User
Authentication Status

Dependencies
PostgreSQL
Password Hashing Library
JWT Library

15. Investigation Service
The Investigation Service coordinates every investigation request.
Supported investigations:
URL
Screenshot
QR Code
Email
Phone Number
Responsibilities:
Validate input
Route investigation
Trigger AI
Trigger OCR (if needed)
Generate structured results

Investigation Flow
Receive Request
      │
      ▼
Validate Input
      │
      ▼
Determine Investigation Type
      │
      ▼
Run Specialized Analysis
      │
      ▼
Send Results to AI
      │
      ▼
Generate Final Report

16. OCR Service
Purpose:
Extract readable text from uploaded images.

Processing Pipeline
Image Upload
      │
      ▼
Image Validation
      │
      ▼
Image Enhancement
      │
      ▼
OCR Extraction
      │
      ▼
Extracted Text

Responsibilities
Validate image
Improve readability
Perform OCR
Return extracted text
Handle OCR failures gracefully

Dependencies
OpenCV
Tesseract OCR

17. AI Reasoning Service
The AI Service is responsible for intelligent analysis.
Responsibilities:
Threat explanation
Cybersecurity education
Report generation support
Recommendation generation
Risk reasoning

Inputs
Investigation Result
User Query
OCR Output
External Intelligence

Outputs
Threat Explanation
Recommendations
Structured Findings
Risk Summary

Dependencies
Groq API
Tavily Search API

18. Report Generation Service
The Report Service transforms investigation results into structured reports.
Responsibilities:
Generate summaries
Assign risk levels
Format findings
Store reports
Return report objects

Report Lifecycle
Investigation Complete
        │
        ▼
Collect Results
        │
        ▼
Generate Summary
        │
        ▼
Assign Risk
        │
        ▼
Save Report
        │
        ▼
Return Report

19. Dashboard Service
The Dashboard Service aggregates user-specific data.
Responsibilities:
Investigation statistics
Risk distribution
Recent investigations
Analytics
Activity summaries

Data Sources
Reports
User Profile
Investigation History

Output
Dashboard-ready JSON optimized for frontend rendering.

Learning Notes
Concepts Introduced
Layered Architecture
Service-Oriented Design
Separation of Concerns
Frontend Layering
Backend Layering
Repository Pattern
Business Logic Isolation
Modular Engineering
Why This Architecture?
A modular architecture makes the application easier to understand, extend, test, and maintain. Each service has a clearly defined responsibility, reducing unintended dependencies and allowing future features—such as malware analysis, browser extensions, or additional AI providers—to be integrated with minimal impact on existing code.

SRS Progress
✅ Introduction
✅ System Overview
✅ Functional Architecture
✅ Frontend Architecture
✅ Backend Architecture
✅ Authentication Service
✅ Investigation Service
✅ OCR Service
✅ AI Reasoning Service
✅ Report Generation Service
✅ Dashboard Service
Next Section: Database Architecture & Data Model — including entity relationships, table specifications, indexing strategy, data lifecycle, storage conventions, and normalization rules. This section will establish the complete persistence layer before moving on to API specifications and deployment architecture.
ThreatLens AI
Document 3 — Software Requirements Specification (SRS)
Section 3 — Database Architecture & Data Model

20. Database Architecture
ThreatLens AI uses PostgreSQL as its primary relational database, hosted through Supabase.
The database is responsible for:
User management
Authentication metadata
Investigation records
AI-generated reports
Dashboard analytics
User history
The database follows Third Normal Form (3NF) to minimize redundancy while maintaining efficient query performance.

Database Goals
The database should provide:
High reliability
ACID-compliant transactions
Data consistency
Fast retrieval
Scalable schema design
Easy future expansion

Database Design Principles
The schema follows these principles:
Normalization
Eliminate duplicate data
Maintain referential integrity
Reduce storage redundancy

Consistency
Every record should maintain a valid relationship with its parent entities.

Extensibility
Future tables should integrate without requiring major schema modifications.
Examples:
Team Workspaces
Notifications
Browser Extension
API Keys
Threat Feeds

21. Entity Relationship Overview
Users
  │
  ├──────────────┐
  │              │
  ▼              ▼
Investigations  User Profiles
      │
      ▼
Reports
      │
      ▼
Dashboard Analytics

Primary Database Entities
Version 1 consists of the following core entities:
Users
User Profiles
Investigations
Reports
Dashboard Statistics
Future versions will introduce:
Notifications
Teams
Organizations
API Keys
Audit Logs

22. Users Table
Purpose
Stores authentication and account information.

Columns

Constraints
Email must be unique.
Passwords are never stored in plain text.
UUID is the primary key.

Relationships
One User
↓
Many Investigations
↓
Many Reports

23. User Profile Table
Purpose
Stores editable profile information separate from authentication data.

Columns

Relationship
One User
↓
One Profile

24. Investigation Table
Purpose
Stores every investigation initiated by a user.

Columns

Investigation Types
Supported values:
URL
Screenshot
QR Code
Email
Phone
AI Assistant

Status Values
Pending
Processing
Completed
Failed

25. Reports Table
Purpose
Stores AI-generated investigation reports.

Columns

Why JSONB?
Certain report sections vary depending on investigation type.
Using PostgreSQL JSONB provides:
Flexible schema
Fast querying
Future compatibility
Reduced schema complexity

Report Relationships
One Investigation
↓
One Report

26. Dashboard Statistics
Dashboard statistics are derived, not permanently stored.
Metrics should be calculated from investigation and report data.
Examples:
Total Investigations
Safe Investigations
High Risk Reports
Recent Activity
Weekly Trends
This avoids duplicate data and ensures analytics remain accurate.

27. Primary Relationships
Users
   │
   ├────────────┐
   │            │
   ▼            ▼
Profile   Investigations
                 │
                 ▼
              Reports

Relationship Summary

28. Indexing Strategy
Indexes improve query performance.
Indexes should be created on:
Users
email

Investigations
user_id
investigation_type
created_at
status

Reports
investigation_id
created_at

Benefits include:
Faster login lookups
Faster dashboard loading
Efficient history searches
Improved filtering

29. Data Lifecycle
Investigation lifecycle:
Create Investigation
        │
        ▼
Store Input
        │
        ▼
Run Analysis
        │
        ▼
Generate Report
        │
        ▼
Save Report
        │
        ▼
Appear in Dashboard

30. Data Validation Rules
The backend must validate all incoming data before storage.
Examples:
Email
Required
Valid format
Unique

Password
Minimum length
Complexity rules
Stored only as a hash

Investigation Input
Must not be:
Empty
Larger than supported limits
Invalid format for the selected investigation type

Uploaded Images
Requirements:
PNG
JPG
JPEG
WEBP
Maximum size:
5 MB

31. Storage Conventions
The application follows these conventions:
IDs
Use UUIDs for all primary keys.

Dates
Store timestamps in UTC.

Naming Convention
Tables:
snake_case
Columns:
snake_case
Examples:
user_profiles
created_at
risk_level
investigation_type

Boolean Values
Store using PostgreSQL BOOLEAN type.

JSON Data
Use JSONB only when flexible schemas are required.

32. Future Database Expansion
The schema is designed to support additional entities without restructuring existing tables.
Future entities may include:
Organizations
Teams
Notifications
Threat Intelligence Cache
Browser Extension Sessions
API Tokens
Audit Logs
AI Conversation History
System Settings

Learning Notes
Concepts Introduced
Relational Database Design
Entity Relationships
Database Normalization
Primary & Foreign Keys
JSONB Storage
Indexing
Data Validation
Data Lifecycle
Schema Extensibility
Why These Decisions?
A well-designed database forms the foundation of every reliable application. Separating authentication, investigations, reports, and profile data improves maintainability, simplifies future migrations, and keeps the schema scalable as new capabilities are added.
Using PostgreSQL features such as UUIDs, JSONB, foreign keys, and indexing provides both flexibility and performance while preserving strong relational integrity.

SRS Progress
✅ Introduction
✅ Functional Architecture
✅ Frontend Architecture
✅ Backend Architecture
✅ Service Specifications
✅ Database Architecture
✅ Entity Relationships
✅ Database Schema
✅ Indexing Strategy
✅ Storage Conventions
Next Section: API Design & Interface Specifications — including REST API standards, endpoint catalog, request/response formats, authentication flow, error response schema, pagination, validation, versioning, and API security requirements.
ThreatLens AI
Document 3 — Software Requirements Specification (SRS)
Section 4 — API Design & Interface Specifications

33. API Architecture
ThreatLens AI exposes a RESTful API over HTTPS.
The API acts as the communication layer between the React frontend and the FastAPI backend.
All requests and responses use JSON.

API Goals
The API should provide:
Consistent request formats
Predictable responses
Secure authentication
Stateless communication
Easy frontend integration
Future API versioning
Scalability for mobile and third-party clients

API Design Principles
The API follows these principles:
RESTful Design
Resources should be represented using nouns.
Examples:
/users
/auth
/investigations
/reports
/dashboard
Avoid using verbs in endpoint names.

Stateless Requests
Every request must contain all information required for processing.
The server should not rely on previous requests.

JSON Communication
Every request body and response body uses JSON.
Example Request
{
  "url": "https://example.com"
}
Example Response
{
  "success": true,
  "message": "Investigation completed.",
  "data": {
    "risk_level": "Low"
  }
}

34. API Versioning
Versioning enables future changes without breaking existing clients.
Current version:
/api/v1/
Future versions:
/api/v2/
/api/v3/

35. Authentication Flow
Protected endpoints require JWT authentication.
Authentication process:
Login
   │
   ▼
JWT Generated
   │
   ▼
Store Token
   │
   ▼
Send Token
   │
   ▼
Protected API

Authorization Header
Authorization: Bearer <JWT_TOKEN>

Protected Endpoints
Authentication required for:
Dashboard
Investigations
Reports
History
Profile
AI Assistant
Public endpoints:
Register
Login
Landing Page
Health Check

36. API Endpoint Catalog
Authentication

User

Dashboard

Investigations

AI Assistant

Reports

History

37. Request & Response Standards
Every response should follow a consistent structure.
Success Response
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}

Error Response
{
  "success": false,
  "message": "Invalid request.",
  "errors": []
}

Validation Error
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format."
    }
  ]
}

38. HTTP Status Codes

39. Input Validation
Every API request must be validated before processing.
Examples:
Registration
Required fields
Valid email
Password complexity
Unique email

URL Investigation
Valid URL
HTTP or HTTPS
Maximum input length

OCR Upload
Supported image format
File size ≤ 5 MB
Valid image content

Phone Investigation
International format
Valid country code

40. Pagination
Endpoints returning collections should support pagination.
Query Parameters
?page=1
&page_size=20

Paginated Response
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8
  }
}

41. Filtering & Sorting
Supported query parameters:
Filtering:
?risk=High
?type=URL
?status=Completed
Sorting:
?sort=created_at
?order=desc
Searching:
?search=paypal

42. API Security
The API must implement:
HTTPS only
JWT authentication
Password hashing
Input sanitization
SQL injection prevention
Cross-Site Scripting (XSS) protection
Cross-Origin Resource Sharing (CORS) configuration
Environment-based secrets
Request validation
Authorization checks

Rate Limiting
Protect public endpoints from abuse.
Suggested limits:
Login: 5 requests/minute/IP
Register: 3 requests/minute/IP
AI Assistant: 30 requests/minute/user
Investigation APIs: 60 requests/minute/user

43. File Upload Requirements
Supported formats:
PNG
JPG
JPEG
WEBP
Maximum file size:
5 MB
Requirements:
Validate MIME type.
Reject corrupted files.
Generate unique filenames.
Scan uploads before processing (future enhancement).

44. API Error Handling
The API should never expose internal implementation details.
Instead of:
Database connection failed on server...
Return:
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later."
}
Detailed errors should be logged internally.

45. API Documentation Standards
Every endpoint should include:
Endpoint URL
HTTP Method
Description
Authentication Requirement
Request Schema
Response Schema
Status Codes
Example Requests
Example Responses
Error Cases
This enables automatic documentation generation using FastAPI's OpenAPI support.

Learning Notes
Concepts Introduced
REST API Design
Resource-Oriented Architecture
JWT Authentication
API Versioning
HTTP Status Codes
Validation
Pagination
Filtering
Rate Limiting
Secure API Design
Error Response Standards
Why These Standards?
A consistent API contract simplifies frontend development, improves debugging, supports automated documentation, and allows future clients—such as mobile applications or third-party integrations—to consume the backend reliably.
By defining naming conventions, authentication mechanisms, response formats, and validation rules upfront, the development team avoids inconsistencies that often emerge as projects grow.

SRS Progress
✅ Introduction
✅ Functional Architecture
✅ Database Architecture
✅ API Design & Interface Specifications
Next Section: Security Architecture & Infrastructure — covering authentication internals, authorization model, password storage, encryption, CORS policy, environment management, logging, monitoring, deployment topology, Docker architecture, backup strategy, disaster recovery, and operational best practices.
ThreatLens AI
Document 3 — Software Requirements Specification (SRS)
Section 5 — Security Architecture & Infrastructure

46. Security Architecture
Security is a foundational requirement of ThreatLens AI.
Every layer of the application—from the frontend to the database—must implement appropriate security controls to protect user data, authentication credentials, and investigation results.
The platform follows the principle of Security by Design, where security measures are integrated into the architecture from the beginning rather than added after development.

Security Goals
The system should ensure:
Confidentiality
Integrity
Availability
Accountability
Privacy
Resilience

Security Layers
                User
                  │
                  ▼
          HTTPS Connection
                  │
                  ▼
        Authentication Layer
                  │
                  ▼
        Authorization Layer
                  │
                  ▼
        Input Validation Layer
                  │
                  ▼
      Business Logic Layer
                  │
                  ▼
      Database Security Layer
                  │
                  ▼
     Infrastructure Security

47. Authentication Architecture
ThreatLens AI uses JWT (JSON Web Tokens) for stateless authentication.

Authentication Flow
User Login
      │
      ▼
Credential Validation
      │
      ▼
Password Verification
      │
      ▼
JWT Generation
      │
      ▼
Client Storage
      │
      ▼
Protected Requests

Authentication Requirements
The system shall:
Authenticate users securely.
Generate signed JWTs.
Validate tokens on every protected request.
Reject expired or invalid tokens.
Support secure logout.

Token Claims
Each JWT should contain:
User ID
Email
Issued Time
Expiration Time
Sensitive information such as passwords or personal profile data must never be embedded within the token.

Session Management
Requirements:
Automatic expiration after inactivity.
Immediate logout on invalid token detection.
Secure token renewal (future enhancement).

48. Authorization Model
Version 1 implements Role-Based Access Control (RBAC).

Roles
Guest
Permissions:
Landing Page
Login
Registration

Authenticated User
Permissions:
Dashboard
Investigations
Reports
Profile
History
AI Assistant

Administrator (Future)
Permissions:
User Management
System Monitoring
Analytics
Audit Logs
Configuration

Authorization Rules
Every protected endpoint shall:
Verify JWT.
Verify user identity.
Verify resource ownership.
Execute the request only after successful authorization.

49. Password Security
Passwords shall never be stored in plain text.

Password Requirements
Minimum:
8 characters
Must include:
Uppercase letter
Lowercase letter
Number
Special character

Password Storage
Passwords must be hashed using a modern adaptive hashing algorithm before storage.
Additional requirements:
Unique salt per password.
Hash verification only during login.
Plain-text passwords must never be logged or returned.

Password Reset
Reset links should:
Expire automatically.
Be single-use.
Be cryptographically secure.

50. Input Validation & Sanitization
Every request must be validated before entering business logic.

Validation Categories
User Input
Validate:
Length
Type
Format
Required fields

File Uploads
Validate:
MIME type
Extension
Size
Readability

URLs
Validate:
Format
Protocol
Length

Phone Numbers
Validate:
Country code
Number length
International format

Sanitization
Before processing:
Remove invalid characters where appropriate.
Reject malformed payloads.
Normalize accepted data formats.

51. API Security
The API must enforce:
HTTPS-only communication.
JWT authentication.
Authorization checks.
Request validation.
Secure response headers.
CORS configuration.
Rate limiting.

Rate Limiting
Suggested defaults:

52. Database Security
The database must provide:
Foreign key constraints.
Transaction integrity.
Least-privilege database access.
Encrypted network connections.
Regular backups.

Sensitive Data
Sensitive information includes:
Password hashes
Authentication tokens
Email addresses
Investigation history
These fields should only be accessible to authorized services.

53. Environment Configuration
Sensitive configuration values must never be committed to source control.
Examples:
GROQ_API_KEY
TAVILY_API_KEY
DATABASE_URL
JWT_SECRET
SUPABASE_URL
SUPABASE_KEY

Environment Separation
Separate configurations should exist for:
Development
Testing
Staging
Production
Each environment should have independent credentials and configuration values.

54. Logging & Monitoring
The system should maintain structured application logs.

Log Categories
Authentication
API Requests
Investigations
AI Responses
Errors
Warnings
Performance

Logging Rules
Logs must:
Include timestamps.
Include request identifiers.
Avoid storing passwords or authentication secrets.
Avoid exposing sensitive investigation content unnecessarily.

Monitoring Metrics
Monitor:
API response time
CPU usage
Memory usage
Database latency
OCR duration
AI response time
Error rate

55. Docker Deployment
ThreatLens AI should be containerized for consistent deployments.

Container Architecture
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
PostgreSQL (Supabase)

External Services

Groq API
Tavily API

Benefits
Consistent environments
Easier deployment
Simplified dependency management
Better scalability

56. Deployment Architecture
Initial deployment stack:

Deployment Pipeline
GitHub Push
      │
      ▼
Build
      │
      ▼
Run Tests
      │
      ▼
Deploy Backend
      │
      ▼
Deploy Frontend
      │
      ▼
Production

57. Backup & Recovery
The application should support regular backups.

Database Backups
Recommended schedule:
Daily incremental backups.
Weekly full backups.

Recovery Objectives

Disaster Recovery
Recovery procedures should include:
Database restoration.
Environment recreation.
Secret rotation if required.
Service verification.
Health checks before reopening access.

58. Operational Best Practices
Development team guidelines:
Use feature branches.
Review pull requests.
Write meaningful commit messages.
Keep dependencies updated.
Test before deployment.
Document architectural changes.
Monitor production continuously.

Learning Notes
Concepts Introduced
Security by Design
JWT Authentication
Role-Based Access Control (RBAC)
Password Security
Input Validation
API Hardening
Environment Management
Logging & Monitoring
Docker Deployment
Disaster Recovery
Operational Best Practices
Why These Requirements?
A secure application depends on more than authentication alone. Protecting user data requires layered defenses that span validation, authorization, infrastructure, deployment, and operational practices.
By documenting these requirements before implementation, ThreatLens AI is designed to be secure, maintainable, and resilient from its first release while remaining flexible enough to support future enterprise capabilities.

SRS Progress
✅ Introduction
✅ Functional Architecture
✅ Database Architecture
✅ API Design & Interface Specifications
✅ Security Architecture & Infrastructure
Next Section: Quality Attributes, Testing Strategy & Final Engineering Standards — covering maintainability, scalability, reliability, availability, performance testing, testing pyramid, coding standards, documentation standards, release management, and final software acceptance criteria. This will complete Document 3 — Software Requirements Specification (SRS).
ThreatLens AI
Document 3 — Software Requirements Specification (SRS)
Section 6 — Quality Attributes, Testing Strategy & Engineering Standards

59. Software Quality Attributes
ThreatLens AI shall be designed with software quality as a primary objective.
The following quality attributes guide all architectural and implementation decisions.

Maintainability
The application should be easy to modify and extend.
Requirements:
Modular architecture
Clear folder structure
Reusable components
Consistent coding style
Comprehensive documentation
Target:
A new feature should integrate without requiring major modifications to existing modules.

Scalability
The platform should accommodate future growth without architectural redesign.
The architecture should support:
Additional AI models
New investigation types
Team workspaces
Browser extension
Mobile application
Enterprise features
Scalability should be achieved through modular services and loosely coupled components.

Reliability
The system should produce consistent results under normal operating conditions.
Requirements:
Graceful error recovery
Stable API responses
Reliable database transactions
Automatic retry for transient failures (where appropriate)

Availability
ThreatLens AI should remain accessible whenever possible.
Target availability:
99.9% uptime (future production goal)
Temporary failures in external AI services should not cause the entire application to fail.

Performance
Target response times:

Usability
The interface should prioritize clarity and ease of use.
Requirements:
Consistent navigation
Responsive layouts
Clear validation messages
Minimal learning curve
Accessible design

60. Testing Strategy
Testing shall occur throughout the development lifecycle.
The goal is to detect defects early and maintain confidence during future changes.

Testing Pyramid
                End-to-End Tests
                     ▲
              Integration Tests
                     ▲
                 Unit Tests

Unit Testing
Purpose:
Validate individual functions and components in isolation.
Examples:
Password validation
URL validation
Risk score calculation
Utility functions
API service methods

Integration Testing
Purpose:
Verify interaction between multiple modules.
Examples:
Authentication → Dashboard
Investigation → AI → Report
Report → Database
Dashboard → History

End-to-End Testing
Purpose:
Validate complete user workflows.
Examples:
Register → Login → Dashboard
Upload Screenshot → OCR → AI → Report
URL Investigation → History
Login → Profile Update → Logout

Regression Testing
Whenever a new feature is added:
Existing functionality must continue working.
Previous defects must not reappear.
Regression testing should be performed before every release.

Manual Testing Checklist
Each feature should be verified for:
Correct functionality
Error handling
Responsive layout
Accessibility
Loading states
Empty states
Edge cases

61. Coding Standards
Consistency across the codebase is essential.

General Principles
Write readable code.
Avoid unnecessary complexity.
Prefer composition over duplication.
Keep functions focused on one responsibility.
Use meaningful names for variables, functions, and components.

Frontend Standards
Requirements:
Functional React components
Reusable UI components
Consistent folder structure
Proper state management
Minimal prop drilling

Backend Standards
Requirements:
Thin controllers
Business logic in services
Repository pattern for data access
Structured exception handling
Type validation for requests and responses

Naming Conventions
Variables
riskScore
userProfile
investigationType

Functions
generateReport()
analyzeUrl()
extractText()

Components
DashboardCard
ThreatReport
LoginForm

Database
users
reports
investigations
created_at
risk_level

62. Documentation Standards
Every major module should include:
Purpose
Responsibilities
Dependencies
Inputs
Outputs
Error cases
Examples
Future enhancements
Inline code comments should explain why something is implemented, not merely what it does.

63. Release Management
Development should follow incremental releases.

Development Workflow
Feature Branch
      │
      ▼
Implementation
      │
      ▼
Testing
      │
      ▼
Code Review
      │
      ▼
Merge
      │
      ▼
Release

Release Types
Major Release
Examples:
Version 2.0
New architecture
New platform support

Minor Release
Examples:
New investigation type
Additional dashboard features
Performance improvements

Patch Release
Examples:
Bug fixes
Security updates
UI corrections

64. Future Engineering Roadmap
The architecture should support future enhancements without significant redesign.
Potential additions include:
Multi-Agent AI workflows
Threat Intelligence Graph
Browser extension
Real-time threat feeds
Team collaboration
Mobile application
WebSocket notifications
Offline investigation cache
AI model selection
Plugin architecture

65. Software Acceptance Criteria
ThreatLens AI Version 1.0 is considered technically complete when:
Architecture
Modular architecture implemented.
Clear separation of concerns.
Independent services communicate correctly.

Security
JWT authentication operational.
Passwords securely hashed.
Protected endpoints enforced.
Inputs validated.

Database
Relationships implemented.
Constraints enforced.
Indexes created.
Reports stored correctly.

API
REST endpoints implemented.
Consistent response schema.
Error handling standardized.
Pagination and filtering functional.

Frontend
Responsive layouts.
Protected routes.
Dashboard functional.
Investigation workflows complete.

AI
AI reasoning integrated.
OCR pipeline operational.
Report generation functional.

Deployment
Dockerized application.
Environment variables configured.
Production deployment completed.
Health checks operational.

Documentation
Required documentation includes:
Vision & Branding
Product Requirements Document
Software Requirements Specification
System Architecture
UI/UX Design System
Implementation Handbook

66. Engineering Principles
Every future contributor should follow these principles:
Simplicity before complexity.
Security before convenience.
Readability before cleverness.
Reuse before duplication.
Testing before deployment.
Documentation alongside development.
Build for extension, not modification.
These principles ensure the project remains maintainable as it grows.

Learning Notes
Concepts Introduced
Software Quality Attributes
Testing Pyramid
Maintainability
Scalability
Reliability
Coding Standards
Release Management
Engineering Principles
Acceptance Criteria
Why These Standards Matter
A successful software product is measured not only by the features it provides but also by the quality of its implementation. Consistent engineering practices improve collaboration, reduce technical debt, simplify onboarding, and make future enhancements more predictable.
By defining measurable quality attributes, testing expectations, coding conventions, and release processes, ThreatLens AI establishes a strong engineering foundation that supports long-term growth.

Document Summary
This Software Requirements Specification defines the complete technical blueprint for ThreatLens AI, including:
System Architecture
Functional Architecture
Database Design
API Specifications
Security Requirements
Infrastructure
Quality Attributes
Testing Strategy
Engineering Standards
Acceptance Criteria
Together with the Vision & Branding document and the Product Requirements Document, this SRS provides the technical direction required to build a scalable, secure, and maintainable platform.

Document Status
Document 3 — Software Requirements Specification
Status: ✅ Completed
Next Document: System Architecture
The System Architecture document will provide a deep architectural view of ThreatLens AI, including C4 architecture diagrams, sequence diagrams, component diagrams, deployment diagrams, request lifecycles, AI processing flows, infrastructure topology, and detailed interaction patterns between every subsystem.
