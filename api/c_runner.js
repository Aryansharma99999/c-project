const { exec } = require('child_process');
const { promises: fs } = require('fs');
const path = require('path');
const url = require('url');

// --- Configuration Constants ---
// Temporary directory where Vercel will compile the C executable
const BUILD_DIR = '/tmp/c-build';
const EXECUTABLE_NAME = 'fib_runner';
const EXECUTABLE_PATH = path.join(BUILD_DIR, EXECUTABLE_NAME);

// The C source file is located in the root, one directory up from the 'api' folder
const SOURCE_PATH = path.join(path.dirname(__dirname), 'fibonacci.c');

/**
 * Handles the serverless function request.
 * Endpoint will be accessed via: /fibonacci?n=40
 */
module.exports = async (req, res) => {
    // 1. Get the parameter N from the URL query string
    const query = url.parse(req.url, true).query;
    const n = query.n || '40'; // Default to 40 if 'n' is missing

    const requestedN = parseInt(n, 10);
    // Input Validation: Ensure N is a safe integer for the 64-bit C program (0-92)
    if (isNaN(requestedN) || requestedN < 0 || requestedN > 92) {
        res.status(400).setHeader('Content-Type', 'text/plain').send('Invalid input: Please provide a valid integer N between 0 and 92.');
        return;
    }

    try {
        // --- Compilation Step (Required for the first run or cold start) ---
        await fs.mkdir(BUILD_DIR, { recursive: true });

        // Check if the compiled executable already exists in the temporary directory.
        // If not, we run the GCC compiler.
        try {
            await fs.access(EXECUTABLE_PATH, fs.constants.X_OK);
            console.log("Executable already exists, skipping compilation.");
        } catch {
            console.log("Compiling C source code...");
            // Execute the GCC compiler to create the binary in the temp directory
            const compileCommand = `gcc -o ${EXECUTABLE_PATH} ${SOURCE_PATH}`;
            await new Promise((resolve, reject) => {
                exec(compileCommand, (error, stdout, stderr) => {
                    if (error) {
                        return reject(new Error(`Compilation failed: ${stderr}`));
                    }
                    resolve();
                });
            });
            console.log("Compilation successful.");
        }

        // --- Execution Step (Runs on every request) ---
        // Execute the compiled C program, passing the requested N as a command line argument
        const executeCommand = `${EXECUTABLE_PATH} ${requestedN}`;
        const output = await new Promise((resolve, reject) => {
            exec(executeCommand, (error, stdout, stderr) => {
                if (error) {
                    // Capture and return any error output from the C program itself
                    return reject(new Error(`C Program Execution Error: ${stdout}`));
                }
                resolve(stdout); // stdout contains the result from the C program's printf
            });
        });

        // 4. Send the output back to the user
        res.status(200).setHeader('Content-Type', 'text/plain').send(output);

    } catch (error) {
        // Handle deployment or wrapper script errors
        console.error("Vercel C Runner Error:", error);
        res.status(500).send(`Deployment or Runtime Error: ${error.message}`);
    }
};
