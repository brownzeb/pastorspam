const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json()); // Needed for JSON request body parsing

const CONNECTION_STRING = "mongodb+srv://cocoa:Lawbrown123@cocoadata.7h8qn.mongodb.net/?retryWrites=true&w=majority&appName=cocoadata";
const DATABASENAME = "cocoadb";

const client = new MongoClient(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let database;

async function startServer() {
    try {
        await client.connect();
        database = client.db(DATABASENAME);
        console.log("MongoDB connection successful");

        // Start Express server after successful DB connection
        app.listen(5149, () => {
            console.log("Server is running on port 5149");
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

// Route to get logs
app.get('/api/cocoadata/GetLogs', async (request, response) => {
    if (!database) {
        return response.status(500).json({ error: "Database not connected yet" });
    }
    
    try {
        const result = await database.collection("cocoacollection").find({}).toArray();
        response.status(200).json(result);
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        response.status(500).send({ error: "Failed to fetch data from the database" });
    }
    
});

// Route to add logs
const upload = multer(); 

app.post('/api/cocoadata/AddLogs', async (request, response) => {
    try {
        if (!database) {
            return response.status(500).json({ error: "Database not connected yet" });
        }

        const logData = request.body; // Get the request data
        console.log("Received Data:", logData);

        // Insert data into MongoDB
        const result = await database.collection("cocoacollection").insertOne(logData);

        // Check if insertion was successful
        if (result.insertedId) {
            return response.status(201).json({ message: "Log added successfully!", insertedId: result.insertedId });
        } else {
            return response.status(500).json({ error: "Failed to insert log into database" });
        }
    } catch (error) {
        console.error("Error adding log to database:", error);
        response.status(500).json({ error: error.message });
    }
});

// Start server after MongoDB connection
startServer();
