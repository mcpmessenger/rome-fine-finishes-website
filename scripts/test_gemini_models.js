import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const logFile = resolve(process.cwd(), "gemini_test_log.txt");
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
};

// Clear log file
fs.writeFileSync(logFile, "");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log("❌ No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    log(`Checking models for API Key: ${apiKey.substring(0, 10)}...`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-pro-vision"
        ];

        log("\nTesting Model Availability:");

        for (const modelName of modelsToTest) {
            log(`Testing ${modelName.padEnd(25)} ... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                log(`✅ OK (Response: "${response.text().trim().substring(0, 20)}...")`);
            } catch (error) {
                log(`❌ FAILED: ${error.message}`);
                // Print full error object for debugging details (status, headers, etc)
                log(JSON.stringify(error, null, 2));
            }
        }

    } catch (error) {
        log(`Fatal Error: ${error.stack}`);
    }
}

listModels();

listModels();
