#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

/*
 * Calculates the Nth Fibonacci number iteratively.
 * This approach is used to avoid stack overflow errors common with simple recursion
 * for large N, and is generally faster.
 * * Note: Uses unsigned long long to handle larger numbers, but will overflow
 * around N=93. For this example, it demonstrates computational efficiency.
 */
unsigned long long calculate_fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;

    unsigned long long a = 0;
    unsigned long long b = 1;
    unsigned long long temp;

    for (int i = 2; i <= n; i++) {
        // Check for potential overflow before calculation
        if (a > ULLONG_MAX - b) {
            // This is a simple way to indicate overflow, usually handled better
            // in a real application, but sufficient for this demo.
            return 0; 
        }
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        // The program requires exactly one argument (N)
        fprintf(stderr, "Error: Missing input number (N).\n");
        return 1;
    }

    // Read the input number N from the command-line argument
    int n = atoi(argv[1]);

    if (n < 0 || n > 92) {
        // Limit N to prevent obvious overflow and to handle negative inputs
        fprintf(stderr, "Error: Input N must be between 0 and 92.\n");
        return 1;
    }

    unsigned long long result = calculate_fibonacci(n);

    if (result == 0 && n > 0) {
        // Output error if overflow was detected in the function
        fprintf(stderr, "Error: Result overflowed unsigned long long limit.\n");
        return 1;
    }

    // Print the result to stdout, which the Node.js wrapper captures
    printf("%llu\n", result);

    return 0;
}
