using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RICFinance.API.Data;
using RICFinance.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Configure Entity Framework with LocalDB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "RICFinanceSecretKey2024SecureKeyForJWT256Bits!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RICFinance";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RICFinanceApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IReportService, ReportService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5100",
                "http://127.0.0.1:5100",
                "http://localhost:3000",
                "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RIC Finance API",
        Version = "v1",
        Description = "Finance Management System API for Rawalpindi Institute of Cardiology"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Auto-migrate database and seed default admin user
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    // Ensure default users exist (plain-text auth)
    var seedUsers = new List<RICFinance.API.Models.User>
    {
        new()
        {
            FullName = "Administrator",
            Username = "admin",
            Email = "admin@ric.gov.pk",
            PasswordHash = "admin123",
            Role = "Admin",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Computer Operator",
            Username = "computeroperator",
            Email = "computeroperator@ric.gov.pk",
            PasswordHash = "operator123",
            Role = "ComputerOperator",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Accountant",
            Username = "accountant",
            Email = "accountant@ric.gov.pk",
            PasswordHash = "accountant123",
            Role = "Accountant",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Account Officer",
            Username = "accountofficer",
            Email = "accountofficer@ric.gov.pk",
            PasswordHash = "account123",
            Role = "AccountOfficer",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Audit Officer",
            Username = "auditofficer",
            Email = "auditofficer@ric.gov.pk",
            PasswordHash = "audit123",
            Role = "AuditOfficer",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Senior Budget & Account Officer",
            Username = "seniorbudget",
            Email = "seniorbudget@ric.gov.pk",
            PasswordHash = "senior123",
            Role = "SeniorBudgetOfficer",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new()
        {
            FullName = "Director Finance",
            Username = "directorfinance",
            Email = "directorfinance@ric.gov.pk",
            PasswordHash = "director123",
            Role = "DirectorFinance",
            Department = "Finance",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        }
    };

    foreach (var seedUser in seedUsers)
    {
        var existing = db.Users.FirstOrDefault(u => u.Username.ToLower() == seedUser.Username.ToLower());
        if (existing == null)
        {
            db.Users.Add(seedUser);
            continue;
        }

        // If DB was previously seeded with a bcrypt hash, reset to plain text.
        if (!string.IsNullOrWhiteSpace(existing.PasswordHash) && existing.PasswordHash.StartsWith("$2"))
        {
            existing.PasswordHash = seedUser.PasswordHash;
        }
    }

    db.SaveChanges();
}

app.Run();
