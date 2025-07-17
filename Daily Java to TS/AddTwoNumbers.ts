// This program adds two numbers entered by the user
import * as readline from 'readline'; // Import the readline module for user input

class AddTwoNumbers {
    // Main method to execute the program
    static main(): void {
        // Create an interface for reading input from the console
        const rl = readline.createInterface({
            input: process.stdin, // Standard input
            output: process.stdout // Standard output
        });
        // Ask the user for the first number
        rl.question('Enter first number: ', (num1) => {
            // Ask the user for the second number
            rl.question('Enter second number: ', (num2) => {
                // Parse the input strings to integers and add them
                const sum = parseInt(num1) + parseInt(num2);
                // Print the sum to the console
                console.log(`Sum: ${sum}`);
                // Close the readline interface
                rl.close();
            });
        });
    }
}

// Call the main method to run the program
AddTwoNumbers.main();
