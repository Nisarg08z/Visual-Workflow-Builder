const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("flowmaster")

    // Create collections and indexes
    await createCollections(db)

    // Seed sample data
    await seedData(db)

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await client.close()
  }
}

async function createCollections(db) {
  // Users collection
  const users = db.collection("users")
  await users.createIndex({ email: 1 }, { unique: true })
  await users.createIndex({ createdAt: 1 })

  // Workflows collection
  const workflows = db.collection("workflows")
  await workflows.createIndex({ userId: 1, status: 1 })
  await workflows.createIndex({ userId: 1, createdAt: -1 })
  await workflows.createIndex({ status: 1 })

  // Executions collection
  const executions = db.collection("executions")
  await executions.createIndex({ workflowId: 1, startTime: -1 })
  await executions.createIndex({ userId: 1, startTime: -1 })
  await executions.createIndex({ status: 1 })

  // Templates collection
  const templates = db.collection("workflow_templates")
  await templates.createIndex({ category: 1 })
  await templates.createIndex({ isPublic: 1 })
  await templates.createIndex({ usageCount: -1 })

  console.log("✓ Collections and indexes created")
}

async function seedData(db) {
  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 12)

  const demoUser = {
    name: "Demo User",
    email: "demo@flowmaster.ai",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    const userResult = await db.collection("users").insertOne(demoUser)
    const userId = userResult.insertedId.toString()
    console.log("✓ Demo user created")

    // Create sample workflows
    const sampleWorkflows = [
      {
        userId: userId,
        name: "Email Processing Pipeline",
        description: "Automatically process incoming emails with AI analysis",
        nodes: [
          {
            id: "1",
            type: "langgraph",
            position: { x: 100, y: 100 },
            data: {
              label: "Email Trigger",
              type: "trigger",
              nodeType: "trigger",
              description: "Triggers when new email arrives",
            },
          },
          {
            id: "2",
            type: "langgraph",
            position: { x: 400, y: 100 },
            data: {
              label: "AI Email Processor",
              type: "agent",
              nodeType: "agent",
              description: "Analyze email content with AI",
            },
          },
        ],
        edges: [{ id: "e1-2", source: "1", target: "2" }],
        status: "active",
        executions: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRun: new Date(),
      },
    ]

    await db.collection("workflows").insertMany(sampleWorkflows)
    console.log("✓ Sample workflows created")

    // Create workflow templates
    const templates = [
      {
        name: "Email to Slack Notification",
        description: "Automatically send Slack notifications for important emails",
        category: "Email Automation",
        nodes: [
          {
            id: "1",
            type: "langgraph",
            position: { x: 100, y: 100 },
            data: {
              label: "Email Trigger",
              type: "trigger",
              nodeType: "trigger",
            },
          },
          {
            id: "2",
            type: "langgraph",
            position: { x: 400, y: 100 },
            data: {
              label: "AI Processor",
              type: "agent",
              nodeType: "agent",
            },
          },
          {
            id: "3",
            type: "langgraph",
            position: { x: 700, y: 100 },
            data: {
              label: "Send to Slack",
              type: "action",
              nodeType: "action",
            },
          },
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
        ],
        tags: ["email", "slack", "notifications", "ai"],
        isPublic: true,
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 156,
      },
      {
        name: "Document Analysis Workflow",
        description: "Analyze uploaded documents with AI and extract insights",
        category: "Data Processing",
        nodes: [
          {
            id: "1",
            type: "langgraph",
            position: { x: 100, y: 100 },
            data: {
              label: "File Upload Trigger",
              type: "trigger",
              nodeType: "trigger",
            },
          },
          {
            id: "2",
            type: "langgraph",
            position: { x: 400, y: 100 },
            data: {
              label: "Document Analyzer",
              type: "agent",
              nodeType: "agent",
            },
          },
          {
            id: "3",
            type: "langgraph",
            position: { x: 700, y: 100 },
            data: {
              label: "Generate Report",
              type: "action",
              nodeType: "action",
            },
          },
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
        ],
        tags: ["documents", "ai", "analysis", "reports"],
        isPublic: true,
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 89,
      },
    ]

    await db.collection("workflow_templates").insertMany(templates)
    console.log("✓ Workflow templates created")

    // Create sample executions
    const sampleExecutions = []
    for (let i = 0; i < 10; i++) {
      const execution = {
        _id: `exec_${Date.now()}_${i}`,
        workflowId: sampleWorkflows[0]._id,
        userId: userId,
        status: i % 8 === 0 ? "failed" : "completed",
        startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 30000),
        results: [
          {
            nodeId: "1",
            status: "completed",
            output: { message: "Trigger executed successfully" },
            timestamp: new Date().toISOString(),
          },
          {
            nodeId: "2",
            status: "completed",
            output: { message: "AI processing completed" },
            timestamp: new Date().toISOString(),
          },
        ],
        logs: ["Execution started", "Processing nodes", "Execution completed"],
        nodeStates: {
          1: { status: "completed" },
          2: { status: "completed" },
        },
      }
      sampleExecutions.push(execution)
    }

    await db.collection("executions").insertMany(sampleExecutions)
    console.log("✓ Sample executions created")
  } catch (error) {
    if (error.code === 11000) {
      console.log("✓ Demo user already exists")
    } else {
      throw error
    }
  }
}

if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
