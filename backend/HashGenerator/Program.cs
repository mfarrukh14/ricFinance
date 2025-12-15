using BCrypt.Net;

string password = "Admin@123";
string hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine($"Password: {password}");
Console.WriteLine($"Hash: {hash}");
Console.WriteLine($"Verify: {BCrypt.Net.BCrypt.Verify(password, hash)}");

// Also verify the existing hash
string existingHash = "$2a$11$rBNrkhL8hPZq3.VhVYPZUOQMTVZjXXL9dGE3fCHN1SXKx6JJqhzGK";
Console.WriteLine($"\nExisting hash verification: {BCrypt.Net.BCrypt.Verify(password, existingHash)}");
