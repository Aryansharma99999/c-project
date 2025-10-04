#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

/*
 * Calculates the Nth Fibonacci number iteratively.
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
        fprintf(stderr, "Error: Missing input number (N).\n");
        return 1;
    }

    int n = atoi(argv[1]);

    if (n < 0 || n > 92) {
        fprintf(stderr, "Error: Input N must be between 0 and 92.\n");
        return 1;
    }

    unsigned long long result = calculate_fibonacci(n);

    if (result == 0 && n > 0) {
        fprintf(stderr, "Error: Result overflowed unsigned long long limit.\n");
        return 1;
    }

    // Print the result to stdout
    printf("%llu\n", result);

    return 0;
}
