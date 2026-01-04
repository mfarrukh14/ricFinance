using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RICFinance.API.Data;
using RICFinance.API.DTOs;
using RICFinance.API.Models;

namespace RICFinance.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<LoginResponseDto?> CrossAuthLoginAsync(CrossAuthDto dto);
    Task<UserDto?> RegisterAsync(RegisterDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto?> UpdateUserAsync(int userId, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var username = (dto.Username ?? string.Empty).Trim().ToLower();
        var password = dto.Password ?? string.Empty;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.IsActive && u.Username.ToLower() == username);

        if (user == null || user.PasswordHash != password)
            return null;

        user.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var expiration = DateTime.UtcNow.AddHours(8);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiration,
            User = MapToDto(user)
        };
    }

    // Cross-authentication from eProcurement system
    public async Task<LoginResponseDto?> CrossAuthLoginAsync(CrossAuthDto dto)
    {
        var username = (dto.Username ?? string.Empty).Trim().ToLower();
        var password = dto.Password ?? string.Empty;

        // First, try to find existing user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username);

        if (user != null)
        {
            // User exists - verify password matches
            if (user.PasswordHash != password)
            {
                // Update password to match eProcurement
                user.PasswordHash = password;
                await _context.SaveChangesAsync();
            }

            if (!user.IsActive)
            {
                user.IsActive = true;
                await _context.SaveChangesAsync();
            }

            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            var expiration = DateTime.UtcNow.AddHours(8);

            return new LoginResponseDto
            {
                Token = token,
                ExpiresAt = expiration,
                User = MapToDto(user)
            };
        }

        // User doesn't exist - create new user from eProcurement credentials
        var newUser = new User
        {
            FullName = dto.FullName ?? username,
            Username = username,
            Email = $"{username}@ric.finance",
            PasswordHash = password,
            Role = "User",
            Department = dto.Department ?? "eProcurement",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastLogin = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var newToken = GenerateJwtToken(newUser);
        var newExpiration = DateTime.UtcNow.AddHours(8);

        return new LoginResponseDto
        {
            Token = newToken,
            ExpiresAt = newExpiration,
            User = MapToDto(newUser)
        };
    }

    public async Task<UserDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return null;

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return null;

        var user = new User
        {
            FullName = dto.FullName,
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = dto.Password,
            Role = dto.Role,
            Department = dto.Department,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        if (user.PasswordHash != dto.CurrentPassword)
            return false;

        user.PasswordHash = dto.NewPassword;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .Select(u => MapToDto(u))
            .ToListAsync();
    }

    public async Task<UserDto?> UpdateUserAsync(int userId, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return null;

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Department != null) user.Department = dto.Department;
        if (dto.Role != null) user.Role = dto.Role;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "RICFinanceSecretKey2024SecureKeyForJWT"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "RICFinance",
            audience: _configuration["Jwt:Audience"] ?? "RICFinanceApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Username = user.Username,
        Email = user.Email,
        Role = user.Role,
        Department = user.Department,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        LastLogin = user.LastLogin
    };
}
