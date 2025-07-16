import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { employeeData, reportType, customMessage } = await request.json()

    const systemPrompt = `You are an AI assistant that generates personalized performance reports for Video KYC employees. 
    Create professional, constructive, and actionable reports based on the provided data.
    
    Focus on:
    - Performance metrics and trends
    - Areas of improvement with specific suggestions
    - Recognition of achievements
    - Actionable recommendations
    - Professional tone suitable for workplace communication`

    const userPrompt = `Generate a ${reportType} performance report for an employee with the following data:
    
    Employee Performance Data:
    - Calls completed: ${employeeData.callsCompleted || "N/A"}
    - Success rate: ${employeeData.successRate || "N/A"}%
    - Error rate: ${employeeData.errorRate || "N/A"}%
    - Average call duration: ${employeeData.avgDuration || "N/A"}
    - Common errors: ${employeeData.commonErrors?.join(", ") || "None specified"}
    - Performance trend: ${employeeData.trend || "Stable"}
    
    ${customMessage ? `Additional context: ${customMessage}` : ""}
    
    Please structure the report with:
    1. Performance Summary
    2. Key Achievements
    3. Areas for Improvement
    4. Specific Action Items
    5. Encouragement/Motivation`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return NextResponse.json({ report: text })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
