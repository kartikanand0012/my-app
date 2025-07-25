# Smart AI Agent API Documentation

## Overview

The Smart AI Agent API provides natural language query processing, real-time data analysis, and Excel report generation for the Video KYC system. This API allows frontend applications to interact with the AI agent to get insights from the database and generate downloadable reports.

## Base URL

```
http://localhost:3000/api/smart-ai
```

**Production URL**: Replace `localhost:3000` with your production server URL.

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Process Natural Language Query

**Endpoint:** `POST /api/smart-ai/query`

**Description:** Process natural language queries and return real data from the database.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "query_text": "Show me all active agents"
}
```

**Request Body Parameters:**
- `query_text` (string, required): Natural language query (1-1000 characters)

**Example Request:**
```javascript
const response = await fetch('/api/smart-ai/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    query_text: "Show me all active agents"
  })
});
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "query": "Show me all active agents",
    "response": "I found 74 active agents in the Video KYC system. Here's a summary of what I found:\n\nTotal Active Agents: 74 agents\n\nKey Insights:\n• Most agents are in the 'low' capability tier\n• Product flow 7 is the most common\n• Recent activity shows good engagement\n\nTop Active Agents:\n• Udit Singh Chauhan (last active: 2025-07-22)\n• Kushal Maji (last active: 2025-07-22)\n• Saikumar Madiwal (last active: 2025-07-22)\n\nAll agents are currently online and ready for VKYC sessions.",
    "data": [
      {
        "id": "49333",
        "agent_id": "107660",
        "agent_email": "udit.singhchauhan@slicebank.com",
        "last_heartbeat": "2025-07-22T13:40:18.651Z",
        "status": "Active",
        "product_flow": 7,
        "agent_name": "Udit Singh Chauhan",
        "created_at": "2025-06-26T10:41:56.116Z",
        "updated_at": "2025-07-22T13:40:18.653Z",
        "capability": "low"
      }
    ],
    "rowCount": 74,
    "sqlGenerated": "SELECT * FROM agent_details WHERE status = 'Active' ORDER BY last_heartbeat DESC"
  },
  "execution_time_ms": 2341
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Query text must be between 1 and 1000 characters",
      "path": "query_text",
      "location": "body"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to process query",
  "error": "Database connection error"
}
```

### 2. Generate Excel Report

**Endpoint:** `POST /api/smart-ai/excel`

**Description:** Generate an Excel report from a natural language query and return a download link.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "query_text": "Show me all active agents",
  "report_name": "Active_Agents_Report"
}
```

**Request Body Parameters:**
- `query_text` (string, required): Natural language query (1-1000 characters)
- `report_name` (string, optional): Custom name for the report (1-100 characters)

**Example Request:**
```javascript
const response = await fetch('/api/smart-ai/excel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    query_text: "Show me all active agents",
    report_name: "Active_Agents_Report"
  })
});
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "filename": "Active_Agents_Report_2025-07-25T06-13-51-568Z.xlsx",
    "download_url": "/api/smart-ai/download/Active_Agents_Report_2025-07-25T06-13-51-568Z.xlsx",
    "row_count": 74,
    "query_response": "I found 74 active agents in the Video KYC system..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Failed to process query for Excel generation",
  "error": "Invalid query syntax"
}
```

### 3. Download Excel File

**Endpoint:** `GET /api/smart-ai/download/:filename`

**Description:** Download a generated Excel file.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `filename` (string, required): The filename returned from the Excel generation endpoint

**Example Request:**
```javascript
const response = await fetch('/api/smart-ai/download/Active_Agents_Report_2025-07-25T06-13-51-568Z.xlsx', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Handle file download
if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Active_Agents_Report.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

**Success Response (200):**
- Returns the Excel file as a downloadable blob
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Error Response (404):**
```json
{
  "success": false,
  "message": "File not found"
}
```

### 4. Get Query History

**Endpoint:** `GET /api/smart-ai/history`

**Description:** Retrieve the user's query history.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (number, optional): Number of records to return (default: 10, max: 50)

**Example Request:**
```javascript
const response = await fetch('/api/smart-ai/history?limit=20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "user_id": 1,
        "query_text": "Show me all active agents",
        "claude_response": {
          "response": "I found 74 active agents..."
        },
        "sql_generated": "SELECT * FROM agent_details WHERE status = 'Active'",
        "execution_time_ms": 2341,
        "result_count": 74,
        "query_type": "smart_agent",
        "status": "completed",
        "created_at": "2025-07-25T06:13:51.568Z"
      }
    ],
    "total_count": 1
  }
}
```

### 5. Get System Status

**Endpoint:** `GET /api/smart-ai/status`

**Description:** Get system status and capabilities.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Example Request:**
```javascript
const response = await fetch('/api/smart-ai/status', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "version": "1.0.0",
    "capabilities": [
      "natural_language_queries",
      "real_data_responses",
      "excel_report_generation",
      "human_like_chat",
      "query_history"
    ],
    "database_tables": 4,
    "last_updated": "2025-07-25T06:13:51.568Z"
  }
}
```

## Supported Query Types

The AI agent can handle various types of natural language queries:

### Agent Queries
- "Show me all agents"
- "Show me all active agents"
- "Show me agent performance metrics"
- "Show me top 5 agents by success rate"

### Error Analysis Queries
- "What are the most common error types?"
- "Show me error analysis for today"
- "Show me errors made by agents (flagged by IA team)"

### Session Queries
- "Show me VKYC sessions with status APPROVED but flagged as critical"
- "Show me rejected sessions where agent rejected verification"
- "Show me scheduled calls for agent 123"

### Performance Queries
- "Show me agent performance trends over the last 30 days"
- "Compare performance between different agent roles"
- "Show me error analysis with root cause patterns"

## Excel Report Features

### File Format
- **Format**: Excel (.xlsx)
- **Encoding**: UTF-8
- **Compatibility**: Excel 2010 and later

### Report Structure
- **Headers**: Bold text with gray background
- **Auto-sized columns**: Optimal width based on content
- **Data formatting**: Preserves original data types
- **Timestamped filenames**: Unique names with creation timestamp

### File Access
- **Storage**: Files stored in `uploads/reports/` directory
- **Access**: Via download endpoint with authentication
- **Cleanup**: Manual cleanup recommended for old files

## Error Handling

### Common Error Codes
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found (file not found)
- **500**: Internal Server Error (server issues)

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Rate Limiting

- **Query Processing**: 10 requests per minute per user
- **Excel Generation**: 5 requests per minute per user
- **File Downloads**: 20 requests per minute per user

## Frontend Integration Examples

### React Example

```jsx
import React, { useState } from 'react';

const SmartAIAgent = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const processQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smart-ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ query_text: query })
      });
      
      const data = await response.json();
      if (data.success) {
        setResponse(data.data);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    try {
      const response = await fetch('/api/smart-ai/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          query_text: query,
          report_name: 'Custom_Report'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Download the file
        window.open(data.data.download_url, '_blank');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about your data..."
      />
      <button onClick={processQuery} disabled={loading}>
        {loading ? 'Processing...' : 'Ask AI'}
      </button>
      <button onClick={generateExcel} disabled={!response}>
        Generate Excel
      </button>
      
      {response && (
        <div>
          <h3>Response:</h3>
          <p>{response.response}</p>
          <p>Rows returned: {response.rowCount}</p>
        </div>
      )}
    </div>
  );
};

export default SmartAIAgent;
```

### JavaScript Example

```javascript
class SmartAIAgentClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async processQuery(queryText) {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ query_text: queryText })
    });
    
    return await response.json();
  }

  async generateExcel(queryText, reportName) {
    const response = await fetch(`${this.baseUrl}/excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ 
        query_text: queryText,
        report_name: reportName 
      })
    });
    
    return await response.json();
  }

  async downloadFile(filename) {
    const response = await fetch(`${this.baseUrl}/download/${filename}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  async getHistory(limit = 10) {
    const response = await fetch(`${this.baseUrl}/history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    return await response.json();
  }

  async getStatus() {
    const response = await fetch(`${this.baseUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    return await response.json();
  }
}

// Usage
const client = new SmartAIAgentClient('http://localhost:3000/api/smart-ai', 'your_jwt_token');

// Process a query
const result = await client.processQuery('Show me all active agents');
console.log(result.data.response);

// Generate Excel
const excelResult = await client.generateExcel('Show me all active agents', 'Active_Agents');
if (excelResult.success) {
  await client.downloadFile(excelResult.data.filename);
}
```

## Best Practices

### 1. Error Handling
- Always check the `success` field in responses
- Implement proper error handling for network issues
- Show user-friendly error messages

### 2. Loading States
- Show loading indicators during API calls
- Disable buttons during processing
- Provide progress feedback for long operations

### 3. File Downloads
- Use the provided download URL for Excel files
- Handle download errors gracefully
- Consider file size for large reports

### 4. Query Optimization
- Keep queries specific and focused
- Use appropriate query types for different data needs
- Cache frequently requested data

### 5. Security
- Always include authentication tokens
- Validate user input before sending queries
- Don't expose sensitive data in client-side code

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Check Authorization header format
   - Verify token is included in all requests

2. **File Download Issues**
   - Check if file exists on server
   - Verify filename format and encoding
   - Ensure proper CORS configuration

3. **Query Processing Errors**
   - Validate query text length and format
   - Check for special characters in queries
   - Ensure database connectivity

4. **Excel Generation Issues**
   - Verify sufficient server storage space
   - Check file permissions on uploads directory
   - Monitor server memory usage for large datasets

### Support

For technical support or questions about the API:
- Check server logs for detailed error messages
- Verify API endpoint availability
- Test with simple queries first
- Contact backend team for database-specific issues

---

**Version**: 1.0.0  
**Last Updated**: 2025-07-25  
**API Base URL**: `http://localhost:3000/api/smart-ai` 