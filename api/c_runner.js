const { exec } = require('child_process');
const path = require('path');
const { promises: fs } = require('fs');

// Define paths relative to the current working directory (__dirname is api folder)
const SOURCE_PATH = path.join(__dirname, '..', 'fibonacci.c');
const EXECUTABLE_PATH = path.join('/tmp', 'fib_program'); // Must use /tmp on Vercel

// Wrapper function for the Vercel Serverless environment
module.exports = async (req, res) => {
    // 1. Get input N from URL query parameters
    const n = req.query.n;

    if (!n) {
        res.status(400).send('Error: Missing query parameter "n" (e.g., /fibonacci?n=20)');
        return;
    }
    
    const N = parseInt(n);
    if (isNaN(N) || N < 0 || N > 92) {
        res.status(400).send('Error: Invalid input. "n" must be an integer between 0 and 92.');
        return;
    }

    try {
        // 2. Check if the C program needs compilation (only compile once per deployment)
        try {
            await fs.access(EXECUTABLE_PATH);
        } catch (e) {
            // If the executable doesn't exist, compile the C code
            console.log(`[C_RUNNER] Compiling ${SOURCE_PATH}...`);
            await new Promise((resolve, reject) => {
                // Use the explicit path for GCC
                const compileCommand = `/usr/bin/gcc -o ${EXECUTABLE_PATH} ${SOURCE_PATH}`;

                exec(compileCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[C_RUNNER] Compilation failed: ${stderr}`);
                        return reject(new Error(`Compilation failed: ${stderr}`));
                    }
                    console.log('[C_RUNNER] Compilation successful.');
                    resolve();
                });
            });
            
            // *** NEW CRITICAL STEP: Set execution permissions on the compiled binary ***
            // This prevents a common "Permission denied" runtime error on Vercel.
            await new Promise((resolve, reject) => {
                exec(`chmod +x ${EXECUTABLE_PATH}`, (error) => {
                    if (error) {
                        console.error(`[C_RUNNER] Chmod failed: ${error.message}`);
                        return reject(new Error(`Chmod failed: ${error.message}`));
                    }
                    console.log('[C_RUNNER] Execution permissions set.');
                    resolve();
                });
            });
        }

        // 3. Execute the compiled C program with N as argument
        console.log(`[C_RUNNER] Executing compiled program with N=${N}...`);
        
        const output = await new Promise((resolve, reject) => {
            exec(`${EXECUTABLE_PATH} ${N}`, (error, stdout, stderr) => {
                if (error) {
                    // Crucial: Log runtime error for debugging
                    console.error(`[C_RUNNER] Runtime error: ${stderr}`);
                    return reject(new Error(`C Program Runtime Error: ${stderr}`));
                }
                resolve(stdout.trim());
            });
        });

        // 4. Return the result
        res.status(200).json({
            n: N,
            result: output,
            message: `The ${N}th Fibonacci number is ${output}.`
        });

    } catch (error) {
        // 5. Handle any errors (compilation or execution failure)
        console.error(`[C_RUNNER] Fatal Error: ${error.message}`);
        res.status(500).json({
            error: true,
            message: "Failed to execute C program on the server.",
            details: error.message 
        });
    }
};
