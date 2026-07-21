ThreatLens AI
Document 2 — Product Requirements Document (PRD)
Version: 1.0
Status: Draft
Project: ThreatLens AI

Table of Contents
Product Overview
Product Objectives
Scope
Stakeholders
User Roles
Functional Requirements
Non-Functional Requirements
User Journeys
Acceptance Criteria
Success Metrics

1. Product Overview
ThreatLens AI is an AI-powered Cyber Threat Intelligence and Investigation Platform that enables users to detect, investigate, explain, and document cybersecurity threats from a single web application.
Instead of relying on separate tools for phishing detection, OCR, QR analysis, email inspection, and AI research, users interact with one unified platform that intelligently routes each request through the appropriate analysis pipeline.
The system combines Artificial Intelligence, Computer Vision, OCR, and live threat intelligence to produce explainable security reports and actionable recommendations.

2. Product Objectives
The primary objectives are:
Simplify cyber threat investigations.
Provide explainable AI-generated security analysis.
Reduce dependence on multiple security tools.
Improve cybersecurity education through AI explanations.
Generate professional incident reports.
Deliver a fast, responsive, and intuitive user experience.

3. Project Scope
In Scope
Authentication
User Registration
Login
Logout
JWT Authentication
Forgot Password
Profile Management

Threat Investigation
URL Analysis
QR Code Analysis
OCR Screenshot Analysis
Email Analysis
Phone Number Analysis
AI Threat Assistant

Dashboard
Threat History
Recent Investigations
Analytics
Risk Distribution
Search & Filters

Reporting
Incident Report Generation
Report History
Export Ready Structure

Out of Scope (Version 1)
The following features are intentionally excluded from Version 1 to keep the MVP focused:
Browser Extension
Mobile Application
SIEM Integration
Team Collaboration
Real-Time Monitoring
Enterprise Administration
API Marketplace
These capabilities are planned for future releases.

4. Stakeholders
End Users
Cybersecurity Students
Developers
Security Researchers
Ethical Hackers
SOC Analysts

Development Team
Frontend Developer
Backend Developer
AI Engineer
UI/UX Designer
QA Tester

5. User Roles
Guest
Permissions:
Visit Landing Page
Read Documentation
View Features
Register
Login
Cannot:
Perform investigations
View dashboard
Save reports

Registered User
Permissions:
Access Dashboard
Perform Threat Analysis
Use AI Assistant
Save Reports
View History
Manage Profile

6. Functional Requirements
The MVP consists of the following functional modules.

Product Workflow
User Login
      │
      ▼
Dashboard
      │
      ▼
Select Investigation Type
      │
      ▼
Upload / Enter Input
      │
      ▼
Threat Detection
      │
      ▼
AI Reasoning
      │
      ▼
Threat Report
      │
      ▼
Save to Database
      │
      ▼
History & Analytics

Core Product Modules
Module 1 — Authentication
Purpose:
Provide secure access to the application.
Features:
Register
Login
JWT Authentication
Password Hashing
Protected Routes
Forgot Password
Profile

Module 2 — Dashboard
Purpose:
Give users a centralized overview of investigations.
Widgets include:
Recent Reports
Risk Summary
Scan Statistics
Threat Categories
Quick Actions

Module 3 — URL Investigation
Purpose:
Analyze suspicious URLs.
Expected capabilities:
URL validation
Domain information
SSL inspection
Typosquatting detection
Redirect analysis
AI explanation

Module 4 — OCR Investigation
Purpose:
Analyze screenshots containing suspicious content.
Pipeline:
Image
↓
OCR
↓
Text Extraction
↓
Threat Detection
↓
AI Explanation

Module 5 — QR Investigation
Purpose:
Decode QR codes and inspect embedded content.
Expected workflow:
QR Upload
↓
Decode
↓
Extract URL
↓
Threat Analysis
↓
Generate Report

Module 6 — Email Investigation
Purpose:
Analyze suspicious emails.
Expected checks:
Sender
Domain
Header
Spoofing Indicators
AI Explanation

Module 7 — Phone Investigation
Purpose:
Evaluate suspicious phone numbers.
Information returned:
Country
Carrier
Risk Level
Scam Indicators
AI Recommendation

Module 8 — AI Threat Assistant
Purpose:
Allow users to ask cybersecurity questions.
Example queries:
Explain ransomware.
Explain CVE.
Is this phishing?
Latest cyber attacks.
Explain MITRE ATT&CK.

Module 9 — Reports
Purpose:
Generate structured investigation reports.
Report sections:
Executive Summary
Findings
Threat Score
Risk Category
Recommendations
References

Module 10 — History
Purpose:
Store previous investigations.
Capabilities:
Search
Filter
Sort
View Report
Delete Report

Non-Functional Requirements
The system should provide:
Fast response time
Secure authentication
Responsive UI
Modular architecture
High availability
Easy maintenance
Accessible design
Scalable backend
Clean codebase

Learning Notes
Concepts Introduced
Product Requirements Document (PRD)
Functional Requirements
Scope Definition
User Roles
Product Modules
Product Workflow
Non-Functional Requirements
Why This Document Matters
The PRD defines what the product must do, while leaving implementation details to later documents.
A well-written PRD reduces ambiguity, aligns the team on priorities, and provides a clear reference for design, development, testing, and future enhancements.

Document Status
🟢 In Progress
Next Section: Detailed Functional Requirements (Feature-by-Feature Specifications)
Document 2 — Product Requirements Document (PRD)
Section 2 — Detailed Functional Requirements (Part 1)

Functional Module Specification Template
Every feature in ThreatLens AI follows the same documentation structure.
Each module defines:
Purpose
User Story
Functional Requirements
Input Requirements
Validation Rules
Business Logic
Error Handling
Success Flow
Acceptance Criteria
Future Enhancements
This standardized format ensures consistency across design, development, testing, and future maintenance.

Module 1 — Authentication
Purpose
Provide secure access to ThreatLens AI while protecting user accounts and investigation data.

User Story
As a user, I want to create an account and securely log in so that I can access my dashboard, perform investigations, and save my reports.

Functional Requirements
The authentication module shall provide:
User Registration
User Login
Secure Logout
JWT-based Authentication
Forgot Password
Password Reset
Profile Creation
Session Validation
Protected Routes

Registration Requirements
Input Fields

Validation Rules
Full Name
Required
Minimum 2 characters
Maximum 60 characters

Email
Required
Must be unique
Must follow a valid email format

Password
Requirements:
Minimum 8 characters
At least one uppercase letter
At least one lowercase letter
At least one number
At least one special character

Confirm Password
Must exactly match the password.

Business Logic
Registration process:
Validate all fields.
Check for existing email.
Hash the password.
Create user account.
Generate JWT token.
Redirect user to Dashboard.

Login Requirements
Inputs
Email
Password

Business Logic
Verify email exists.
Compare hashed password.
Generate JWT.
Store authentication token securely.
Redirect to Dashboard.

Logout
Upon logout:
Remove authentication token.
Clear local user session.
Redirect to Landing Page.

Forgot Password
Workflow:
User enters email
↓
Verification request
↓
Password reset link
↓
New password
↓
Login with updated password

Error Handling
Examples:
Email already registered
Invalid email format
Incorrect password
Account not found
Expired session
Weak password
Each error should display a clear, user-friendly message without exposing sensitive system information.

Success Flow
After successful authentication:
User is logged in.
Dashboard loads automatically.
User profile becomes available.
Navigation updates to authenticated state.

Acceptance Criteria
Authentication is considered complete when:
Users can register successfully.
Users can log in with valid credentials.
Invalid credentials are rejected.
Passwords are securely stored.
Protected pages require authentication.
Logout ends the session correctly.

Future Enhancements
Two-Factor Authentication (2FA)
Passkey Support
OAuth Providers
Enterprise SSO

Module 2 — Dashboard
Purpose
Provide a centralized overview of the user's cybersecurity activity and enable quick access to investigations.

User Story
As a logged-in user, I want to see recent investigations, analytics, and shortcuts so that I can quickly continue my work.

Functional Requirements
The dashboard shall display:
Welcome Banner
Quick Investigation Actions
Recent Reports
Threat Statistics
Risk Distribution
Investigation History Preview
User Activity Summary

Dashboard Widgets
Welcome Section
Displays:
User name
Greeting
Current date
Quick start button

Quick Actions
Cards for:
URL Analysis
Screenshot Analysis
QR Analysis
Email Analysis
Phone Analysis
AI Assistant
Each card should open its corresponding investigation workflow.

Analytics Cards
Display:
Total Investigations
High-Risk Threats
Safe Investigations
Saved Reports

Charts
Include:
Threat Category Distribution
Weekly Investigation Trend
Risk Level Breakdown

Recent Activity
Displays:
Latest investigations
Status
Risk level
Timestamp
Users should be able to open a report directly from this section.

Business Logic
Dashboard data should be personalized to the authenticated user.
Statistics must update automatically whenever a new investigation is completed.

Empty State
If no investigations exist:
Display:
Welcome illustration
Introduction message
"Start Your First Investigation" button

Error State
If dashboard data cannot be loaded:
Display:
Friendly error message
Retry button
The remainder of the application should remain usable whenever possible.

Acceptance Criteria
Dashboard is complete when:
All widgets load correctly.
Charts display accurate user data.
Quick Actions navigate correctly.
Recent investigations update automatically.
Empty states display appropriately.

Future Enhancements
Real-time updates
Team dashboards
Threat notifications
Custom widgets
Personalized layouts

Module 3 — Profile Management
Purpose
Allow users to manage their personal information and account settings.

User Story
As a user, I want to update my profile and manage my account so that my information remains accurate and my account stays secure.

Functional Requirements
The profile page shall allow users to:
View personal details
Edit profile information
Change password
Upload profile picture
View account statistics
Log out

Editable Fields

Account Statistics
Display:
Total Investigations
Saved Reports
High-Risk Investigations
Member Since
Last Login

Profile Picture
Users may:
Upload an image
Replace the current image
Remove the image
Accepted formats:
JPG
JPEG
PNG
WEBP
Maximum size:
5 MB

Password Change
Requirements:
Current password
New password
Confirm password
New passwords must satisfy the same security rules used during registration.

Business Logic
Whenever profile information is updated:
Validate inputs.
Save changes.
Update displayed information immediately.
Show confirmation message.

Error Handling
Examples:
Unsupported image format
File too large
Incorrect current password
Weak password
Validation failure

Acceptance Criteria
Profile Management is complete when:
Users can update their name.
Profile pictures upload successfully.
Password changes require the current password.
Validation errors display correctly.
Changes persist after logging out and back in.

Future Enhancements
Dark/Light Theme Preferences
Notification Settings
Activity Log
Connected Devices
Account Deletion
Privacy Controls

Learning Notes
Concepts Introduced
Authentication Requirements
Dashboard Design Requirements
Profile Management Requirements
Validation Rules
Business Logic
Acceptance Criteria
Error States
Empty States
Why This Level of Detail Matters
A feature is not fully specified by saying "build a login page" or "create a dashboard." Developers, designers, testers, and AI assistants all need a shared understanding of expected behavior, validation rules, edge cases, and success criteria.
By documenting these details now, implementation becomes more predictable, testing becomes more thorough, and future maintenance becomes significantly easier.

PRD Progress
✅ Authentication
✅ Dashboard
✅ Profile Management
Next Section: Investigation Modules (URL Analysis, OCR Screenshot Analysis, QR Code Analysis, Email Analysis, Phone Number Intelligence, AI Threat Assistant)
Document 2 — Product Requirements Document (PRD)
Section 3 — Investigation Modules

Module 4 — URL Threat Analysis
Purpose
Allow users to analyze suspicious URLs and domains using AI, threat intelligence, and security heuristics to determine their legitimacy and potential risks.

User Story
As a user, I want to analyze a suspicious URL so that I can determine whether it is safe before visiting or sharing it.

Functional Requirements
The module shall:
Accept URLs entered manually.
Validate URL format.
Normalize shortened URLs where applicable.
Analyze domain characteristics.
Detect phishing indicators.
Generate an AI explanation.
Save the investigation to history.

Input
Example:
https://example.com

Validation Rules
The system shall:
Reject empty input.
Reject malformed URLs.
Accept HTTP and HTTPS URLs.
Trim unnecessary whitespace.

Analysis Pipeline
User Input
      │
      ▼
URL Validation
      │
      ▼
Domain Extraction
      │
      ▼
Threat Intelligence
      │
      ▼
AI Analysis
      │
      ▼
Risk Score
      │
      ▼
Threat Report

Security Checks
The investigation should evaluate:
HTTPS usage
Suspicious keywords
Domain length
Typosquatting
Homograph attacks
Redirect behavior
Domain reputation
Domain age (future enhancement)

Output
The report should include:
URL
Domain
Threat Category
Risk Score
AI Explanation
Security Recommendations
Investigation Timestamp

Error Handling
Possible errors:
Invalid URL
Unsupported protocol
Analysis timeout
External API unavailable

Acceptance Criteria
The feature is complete when:
Valid URLs are analyzed successfully.
Invalid URLs are rejected.
AI explanations are generated.
Reports are stored in history.

Module 5 — OCR Screenshot Investigation
Purpose
Extract text from uploaded screenshots and identify potential cyber threats such as phishing pages, fake payment requests, and scam messages.

User Story
As a user, I want to upload a suspicious screenshot so that AI can identify potential scams and explain the associated risks.

Functional Requirements
The module shall:
Accept image uploads.
Perform OCR.
Extract readable text.
Detect suspicious patterns.
Generate an AI investigation report.

Supported Formats
PNG
JPG
JPEG
WEBP
Maximum file size:
5 MB

OCR Pipeline
Upload Image
      │
      ▼
Image Processing
      │
      ▼
OCR Extraction
      │
      ▼
Threat Detection
      │
      ▼
AI Reasoning
      │
      ▼
Report Generation

Scam Detection
Examples include:
Fake login pages
Banking scams
Cryptocurrency scams
Payment requests
Credential harvesting
Gift card scams
Fake customer support
Social engineering attempts

Output
The report shall contain:
Extracted Text
Threat Category
Confidence Score
AI Explanation
Recommended Actions

Error Handling
Unsupported image
Corrupted file
OCR extraction failure
No readable text detected

Acceptance Criteria
OCR extracts readable text.
AI identifies suspicious content.
Reports are generated correctly.
Results are saved to history.

Module 6 — QR Code Investigation
Purpose
Decode uploaded QR codes and determine whether the embedded content poses a cybersecurity risk.

User Story
As a user, I want to scan a QR code before opening it so that I can avoid malicious websites or scams.

Functional Requirements
The module shall:
Decode QR codes.
Extract embedded data.
Detect embedded URLs.
Analyze associated threats.
Produce a structured report.

Workflow
Upload QR
      │
      ▼
Decode QR
      │
      ▼
Extract Content
      │
      ▼
Threat Analysis
      │
      ▼
AI Report

Supported Content
URLs
Text
Email links
Telephone links
Wi-Fi credentials (future enhancement)

Output
The report should include:
Decoded Content
Threat Level
AI Explanation
Security Advice

Acceptance Criteria
QR codes decode successfully.
Embedded URLs are analyzed.
AI explanation is generated.
Investigation is stored.

Module 7 — Email Security Investigation
Purpose
Analyze suspicious emails for phishing, spoofing, impersonation, and other indicators of malicious intent.

User Story
As a user, I want to inspect a suspicious email so that I can determine whether it is genuine or fraudulent.

Functional Requirements
The module shall:
Accept email content.
Analyze sender details.
Examine subject lines.
Evaluate suspicious wording.
Generate AI-based findings.

Inputs
Users may provide:
Email subject
Sender address
Email body
Version 1 will focus on content analysis. Header analysis is planned for future releases.

Analysis
The AI should evaluate:
Urgent language
Credential requests
Suspicious links
Grammar anomalies
Brand impersonation
Financial requests

Output
The investigation should provide:
Threat Category
Risk Level
Suspicious Indicators
AI Explanation
Recommended Response

Acceptance Criteria
Email content is analyzed.
Suspicious indicators are identified.
AI produces recommendations.
Reports are saved.

Module 8 — Phone Number Intelligence
Purpose
Evaluate suspicious phone numbers using available metadata and AI-generated risk assessments.

User Story
As a user, I want to check an unknown phone number before responding so that I can avoid scams and fraud.

Functional Requirements
The module shall:
Accept international phone numbers.
Validate number format.
Retrieve available metadata.
Produce a risk assessment.

Information Returned
Country
Region
Carrier (if available)
Number Type
Risk Level
AI Recommendation

Error Handling
Invalid number format
Unsupported country code
Data unavailable

Acceptance Criteria
Valid numbers are analyzed.
Invalid numbers are rejected.
Investigation reports are generated.

Module 9 — AI Threat Assistant
Purpose
Provide an AI-powered cybersecurity assistant capable of answering questions, explaining threats, and assisting users during investigations.

User Story
As a user, I want to ask cybersecurity questions in natural language so that I can better understand threats and security concepts.

Functional Requirements
The assistant shall:
Accept natural language questions.
Maintain conversational context within a session.
Explain cybersecurity concepts.
Research current threats using external intelligence sources.
Provide actionable recommendations.
Generate responses in clear, structured language.

Example Questions
What is ransomware?
Explain phishing.
What is CVE-2026-XXXX?
Latest cyber attacks in India.
Explain MITRE ATT&CK.
Is this website safe?

AI Workflow
User Question
      │
      ▼
Intent Detection
      │
      ▼
Knowledge Retrieval
      │
      ▼
LLM Reasoning
      │
      ▼
Structured Response

Response Structure
Each response should include:
Summary
Explanation
Risk Assessment (if applicable)
Mitigation Steps
References (when available)

Error Handling
AI service unavailable
Rate limit exceeded
Unsupported request
Incomplete external data

Acceptance Criteria
The assistant should:
Answer cybersecurity questions accurately.
Provide understandable explanations.
Reference current information when appropriate.
Maintain a professional and educational tone.

Learning Notes
Concepts Introduced
Threat Investigation Pipelines
OCR-Based Security Analysis
QR Code Analysis
Email Content Analysis
URL Threat Detection
Phone Number Intelligence
Conversational AI
Explainable AI
Why These Modules Matter
These investigation modules form the core value proposition of ThreatLens AI. Rather than acting as isolated utilities, they work together to create a unified investigation platform that accepts multiple input types, applies specialized analysis techniques, and delivers consistent, explainable results.

PRD Progress
✅ Authentication
✅ Dashboard
✅ Profile Management
✅ URL Threat Analysis
✅ OCR Screenshot Investigation
✅ QR Code Investigation
✅ Email Security Investigation
✅ Phone Number Intelligence
✅ AI Threat Assistant
Next Section: Reports, Investigation History, Search & Filters, Notifications, Error Handling, Cross-Module User Flows, and Complete Acceptance Criteria (Final PRD Section).
Document 2 — Product Requirements Document (PRD)
Section 4 — Reports, History & System-Wide Requirements

Module 10 — Investigation Reports
Purpose
Generate professional, structured, and explainable cybersecurity reports for every completed investigation.
Reports should be easy to understand for beginners while remaining useful for cybersecurity professionals.

User Story
As a user, I want every investigation to generate a structured report so that I can understand the findings, review them later, and share them when necessary.

Functional Requirements
The system shall automatically generate a report after every successful investigation.
Reports must include:
Executive Summary
Investigation Type
User Input
Threat Category
Risk Score
Confidence Score
AI Findings
Indicators of Risk
Recommendations
Investigation Timestamp

Report Structure
Investigation Report

│
├── Executive Summary
├── User Input
├── Threat Analysis
├── AI Explanation
├── Risk Assessment
├── Recommendations
├── Technical Details
└── Investigation Metadata

Risk Classification
Every report must classify threats using standardized levels.

Report Metadata
Each report shall store:
Report ID
User ID
Investigation Type
Creation Date
Last Updated
Processing Time
AI Model Used
Investigation Status

Report Actions
Users may:
View report
Search report
Delete report
Copy findings
Download report (Future Version)
Share report (Future Version)

Acceptance Criteria
Reports are complete when:
Every investigation generates a report.
Risk levels are displayed correctly.
Reports remain accessible in history.
Metadata is stored accurately.

Module 11 — Investigation History
Purpose
Allow users to access previous investigations without repeating analyses.

User Story
As a user, I want to revisit previous investigations so that I can compare results and review past findings.

Functional Requirements
History shall provide:
Investigation List
Search
Filters
Sorting
Report Preview
Delete Option

Stored Information
Each history entry contains:
Investigation Type
Original Input
Threat Category
Risk Level
Date
Status

Search
Users can search by:
URL
Domain
Email Address
Phone Number
Keywords
Investigation ID

Filters
Available filters:
Investigation Type
Risk Level
Date Range
Status

Sorting
Sort options include:
Newest First
Oldest First
Highest Risk
Lowest Risk
Alphabetical

Empty State
If no investigations exist:
Display:
Friendly illustration
Empty history message
"Start Investigation" button

Acceptance Criteria
History is complete when:
Reports appear immediately after completion.
Search returns accurate results.
Filters work correctly.
Sorting behaves consistently.

Module 12 — Notifications
Purpose
Provide clear feedback about system actions and investigation status.

Notification Types
Success
Examples:
Investigation completed.
Profile updated.
Login successful.

Information
Examples:
Investigation started.
OCR processing.
AI generating report.

Warning
Examples:
Suspicious URL detected.
Low confidence result.
Slow external API response.

Error
Examples:
Investigation failed.
Invalid input.
AI unavailable.
Network error.

Notification Principles
Notifications should:
Be concise.
Explain what happened.
Suggest the next action when appropriate.
Never expose sensitive internal errors.

Cross-Module User Flow
The following illustrates the primary application workflow.
Landing Page
      │
      ▼
Register / Login
      │
      ▼
Dashboard
      │
      ▼
Choose Investigation
      │
      ▼
Submit Input
      │
      ▼
Validation
      │
      ▼
Threat Analysis
      │
      ▼
AI Reasoning
      │
      ▼
Report Generation
      │
      ▼
Save Report
      │
      ▼
History
      │
      ▼
Dashboard Analytics

Global Error Handling
The application should gracefully recover whenever possible.

Client Errors
Examples:
Invalid input
Missing required fields
Unsupported file type
File too large
Expected behavior:
Highlight affected field.
Display helpful validation message.
Preserve user input whenever possible.

Server Errors
Examples:
Database unavailable
AI service timeout
External API failure
Expected behavior:
Display friendly message.
Log the error internally.
Allow retry without data loss.

Network Errors
Examples:
Internet disconnected
Request timeout
Slow response
Expected behavior:
Show retry option.
Preserve investigation data.
Resume workflow when possible.

Accessibility Requirements
ThreatLens AI should remain accessible to all users.
Requirements:
Keyboard navigation
Screen reader compatibility
High color contrast
Responsive layouts
Clear focus indicators
Descriptive button labels
Readable typography

Performance Requirements
Target metrics:

Product Acceptance Criteria
ThreatLens AI Version 1.0 is considered complete when:
Authentication
Users can register, log in, and log out securely.
Protected routes function correctly.

Dashboard
Analytics display accurate user data.
Navigation is responsive.
Empty states are handled gracefully.

Investigation Modules
URL analysis functions correctly.
OCR successfully extracts text.
QR codes decode reliably.
Email content is analyzed.
Phone numbers are validated.
AI assistant answers cybersecurity questions.

Reports
Reports generate automatically.
Reports persist after logout.
Risk scores display consistently.

History
Reports are searchable.
Filters and sorting operate correctly.
Users can reopen previous reports.

System
Responsive across supported devices.
Secure authentication.
Stable API communication.
Graceful error handling.
Consistent UI design.

MVP Definition
The Minimum Viable Product is complete when a user can:
Create an account.
Log in securely.
Access the dashboard.
Perform any supported investigation.
Receive an AI-generated report.
Save the report.
View it later in history.
Continue using the platform without errors.

Learning Notes
Concepts Covered
Investigation Reports
Report Lifecycle
Search & Filtering
Notifications
Cross-Module Workflows
Error Handling
Accessibility
Performance Targets
Acceptance Criteria
MVP Definition
Why This Matters
A PRD is more than a list of features. It defines the expected behavior of the product from the user's perspective and establishes a shared understanding between product managers, designers, developers, testers, and stakeholders.
By documenting workflows, report behavior, error handling, and measurable acceptance criteria, the team can build and validate the product with confidence.

Document Summary
This Product Requirements Document defines:
Product Scope
User Roles
Functional Requirements
Non-Functional Requirements
Investigation Modules
Report Management
History Management
Notifications
User Workflows
Performance Targets
MVP Success Criteria
It serves as the authoritative reference for feature planning before system architecture and implementation begin.

Document Status
Document 2 — Product Requirements Document
Status: ✅ Completed
Next Document: Software Requirements Specification (SRS)
The SRS will translate these product requirements into a detailed technical specification, covering system architecture, APIs, database schema, security, deployment, component interactions, and engineering constraints.
