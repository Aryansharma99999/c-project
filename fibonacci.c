#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

/**
 * fibonacci - Calculates the Nth Fibonacci number using an iterative approach.
 * @n: The index of the Fibonacci number to find (e.g., n=7 gives 13).
 * Return: The Nth Fibonacci number as a long long (up to Fib(92)).
 */
long long fibonacci(int n) {
    // Base cases
    if (n <= 0) return 0;
    if (n == 1) return 1;

    // Iterative calculation for speed and efficiency
    long long a = 0;
    long long b = 1;
    long long next;

    for (int i = 2; i <= n; i++) {
        // Check for potential overflow (though long long handles up to 92)
        if (b > (LLONG_MAX - a)) {
             // In a real app, you'd handle this more gracefully, but here we just stop.
             // This is mostly for demonstration, as 92 is the practical limit for 64-bit int.
        }
        next = a + b;
        a = b;
        b = next;
    }
    return b;
}

/**
 * main - Entry point for the C program.
 * Reads the input number N from the command line argument (argv[1]).
 * The Node.js wrapper calls this program like: ./fib_runner 40
 */
int main(int argc, char *argv[]) {
    // 1. Input Check: Ensure an argument was provided
    if (argc < 2) {
        // Outputting error to stdout is captured by the Node.js wrapper
        fprintf(stdout, "Error: Missing input N. Usage: [EXECUTABLE] N\n");
        return 1; // Exit with error code
    }

    // 2. Conversion and Validation
    char *endptr;
    // strtol safely converts string to long, handles errors
    long input_n_long = strtol(argv[1], &endptr, 10);

    // Validate if conversion was successful, number is positive, and within the safe range
    if (errno == ERANGE || *endptr != '\0' || input_n_long < 0 || input_n_long > 92) {
        fprintf(stdout, "Error: Invalid input. Please use an integer between 0 and 92.\n");
        return 1;
    }

    // Cast the validated input to int
    int n = (int)input_n_long;

    // 3. Calculation
    long long result = fibonacci(n);

    // 4. Output: Print the result to stdout
    // The Node.js wrapper (api/c_runner.js) will read this output.
    printf("Fib(%d) is: %lld\n", n, result);

    return 0; // Exit successfully
}
