function BankAccount(holderName, initialBalance) {
    this.holderName = holderName;
    this.balance = initialBalance;

    // Function to handle deposits and withdrawals
    this.transact = function(type, amount) {
        if (type === "deposit") {
            this.balance += amount;
            return true;
        } else if (type === "withdraw") {
            if (this.balance >= amount) {
                this.balance -= amount;
                return true;
            } else {
                return false; // Insufficient funds
            }
        } else {
            return false; // Invalid transaction type
        }
    };
}
// Create a new bank account for Alice with an initial balance of 100
const myAccount = new BankAccount("Alice", 100);

// 1. Deposit 50
console.log(myAccount.transact("deposit", 50)); // Output: true
console.log(myAccount.balance);                 // Output: 150

// 2. Successful withdrawal of 30
console.log(myAccount.transact("withdraw", 30)); // Output: true
console.log(myAccount.balance);                  // Output: 120

// 3. Unsuccessful withdrawal (amount greater than balance)
console.log(myAccount.transact("withdraw", 200)); // Output: false
console.log(myAccount.balance);                   // Output: 120 (unchanged)