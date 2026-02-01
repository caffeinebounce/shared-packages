---
"@caffeinebounce/logger": patch
---

Security fix: Sanitize SQL queries from error messages returned to clients

- Added `sanitizeErrorMessageForClient` function to strip SQL queries and database schema details from API error responses
- Error messages containing SQL patterns (SELECT, INSERT, UPDATE, DELETE, JOIN, etc.) are now replaced with user-friendly messages
- Full error details are still logged server-side for debugging
- Known PostgreSQL error codes (23505, 23503, 22P02, etc.) now return friendly messages
- Quoted identifiers like "table_name" are sanitized to prevent schema leakage

This prevents accidental exposure of database implementation details to end users while maintaining full debugging capability in logs.
