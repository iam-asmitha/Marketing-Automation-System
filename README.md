# Market Auto — Marketing Automation System

**Internship task:** WD-CRM-005  
**Student code:** DAS-CRM-005  
**Company:** Data Alcott Systems  
**Domain:** CRM — Marketing Automation

## Project overview
Market Auto is a responsive, frontend-only marketing automation CRM dashboard. It helps a small marketing team organize campaigns, manage email templates and subscribers, review campaign engagement, create automation workflows, prepare landing-page concepts and export reports.

## Technologies
- HTML5 — semantic page structure and forms
- CSS3 — responsive layout, theme styling and UI components
- JavaScript (ES6+) — navigation, validation, CRUD operations, charts and data handling
- Browser Local Storage — persists demo data locally; no database or server is required
- Font Awesome and Google Fonts — interface icons and typography (CDN)

## Included modules
1. Dashboard — campaign and subscriber KPIs, performance chart and audience overview
2. Campaign management — create, edit, delete, search and filter campaigns
3. Email templates — create, edit, preview and delete templates
4. Subscriber management — add, search, segment, change status, delete and export contacts
5. Campaign analytics — open/click metrics, conversions, comparison chart and insights
6. Automation workflows — create, pause/activate and delete simulated workflows
7. Landing pages — create and manage landing-page concepts
8. Reports — workspace summary, CSV export and print-to-PDF
9. User profile/settings — simulated profile editing and dark mode

## Run locally
1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. No package installation or build command is required.

> Internet access is used only for the optional Google Fonts and Font Awesome CDN assets. The application itself runs in the browser.

## Data and limitations
- The task specifies that a database is not required. Campaigns, subscribers, templates, workflows, landing pages and profile data are stored in JavaScript objects/arrays and persisted with `localStorage`.
- This is a demonstration CRM. Email sending, delivery tracking, real opens/clicks, authentication and automation triggers are simulated; there is no email server or backend.
- CSV exports are generated in the browser. The PDF option uses the browser's Print dialog; choose **Save as PDF**.

## Internship task reference
https://www.freeinternships.in/blog/

## Suggested demonstration flow
1. Open the dashboard and explain the summary cards and charts.
2. Create a campaign, edit it, filter it and delete it.
3. Create and preview an email template.
4. Add a subscriber, search the list and export CSV.
5. Explain analytics and the simulated workflow controls.
6. Create a landing-page concept.
7. Open Reports and demonstrate CSV / Save as PDF.
8. Resize the browser to show responsive layout and toggle dark mode.
