// This program adds two numbers entered by the user
import java.util.Scanner; // Import the Scanner class for user input

public class AddTwoNumbers {
    // Main method to execute the program
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in); // Create a Scanner object for input
        System.out.print("Enter first number: "); // Prompt user for first number
        int num1 = scanner.nextInt(); // Read the first number
        System.out.print("Enter second number: "); // Prompt user for second number
        int num2 = scanner.nextInt(); // Read the second number
        int sum = num1 + num2; // Add the two numbers
        System.out.println("Sum: " + sum); // Print the sum
        scanner.close(); // Close the Scanner
    }
}
