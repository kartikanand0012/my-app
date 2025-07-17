export const checkpoints = [
  {
    id: "CP_001",
    name: "Database Connectivity",
    description: "Verify connection to Apache Superset and data sources",
    category: "system",
    status: "pending",
    priority: "critical",
    validationRules: [
      "Database connection established",
      "Query execution successful",
      "Data retrieval within acceptable time",
      "Connection pool healthy",
    ],
  },
  // ...other checkpoints
]; 