using Microsoft.EntityFrameworkCore;
using RICFinance.API.Models;

namespace RICFinance.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<ObjectCode> ObjectCodes { get; set; }
    public DbSet<FiscalYear> FiscalYears { get; set; }
    public DbSet<BudgetEntry> BudgetEntries { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ObjectCode configuration
        modelBuilder.Entity<ObjectCode>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
        });

        // FiscalYear configuration
        modelBuilder.Entity<FiscalYear>(entity =>
        {
            entity.HasIndex(e => e.Year).IsUnique();
        });

        // BudgetEntry configuration
        modelBuilder.Entity<BudgetEntry>(entity =>
        {
            entity.HasIndex(e => new { e.ObjectCodeId, e.FiscalYearId }).IsUnique();
            
            entity.HasOne(e => e.ObjectCode)
                .WithMany(o => o.BudgetEntries)
                .HasForeignKey(e => e.ObjectCodeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FiscalYear)
                .WithMany(f => f.BudgetEntries)
                .HasForeignKey(e => e.FiscalYearId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.UpdatedBy)
                .WithMany()
                .HasForeignKey(e => e.UpdatedById)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // AuditLog configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed default admin user (password: Admin@123)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FullName = "System Administrator",
            Username = "admin",
            Email = "admin@ric.gov.pk",
            PasswordHash = "$2a$11$KilIsS23lIjFOdYdbr6jredow9KzaURfWTgZnWxxyKau/DFGb.xai", // Admin@123
            Role = "Admin",
            Department = "IT",
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed default fiscal year
        modelBuilder.Entity<FiscalYear>().HasData(new FiscalYear
        {
            Id = 1,
            Year = "2024-25",
            StartDate = new DateTime(2024, 7, 1),
            EndDate = new DateTime(2025, 6, 30),
            IsActive = true,
            IsCurrent = true
        });
    }
}
