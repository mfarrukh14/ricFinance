using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RICFinance.API.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Role { get; set; } = "User"; // Admin, FinanceOfficer, User
    
    [StringLength(50)]
    public string? Department { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLogin { get; set; }
}

public class ObjectCode
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string HeadOfAccount { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<BudgetEntry> BudgetEntries { get; set; } = new List<BudgetEntry>();
}

public class FiscalYear
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Year { get; set; } = string.Empty; // e.g., "2024-25"
    
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool IsCurrent { get; set; } = false;
    
    public ICollection<BudgetEntry> BudgetEntries { get; set; } = new List<BudgetEntry>();
}

public class BudgetEntry
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int ObjectCodeId { get; set; }
    
    [ForeignKey("ObjectCodeId")]
    public ObjectCode ObjectCode { get; set; } = null!;
    
    [Required]
    public int FiscalYearId { get; set; }
    
    [ForeignKey("FiscalYearId")]
    public FiscalYear FiscalYear { get; set; } = null!;
    
    // Non-Development Budget (AAA)
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalBudgetAllocation { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal FirstReleased { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal SecondReleased { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ThirdReleased { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal FourthReleased { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal SupplementaryBudget { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AdditionalSurrender { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ExcessReallocation { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal SumOfReleased { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AAAReApp { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAAABudget { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal BudgetWithheldLapse { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AAAExpenditure { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AAARemainingBudget { get; set; } = 0;
    
    // PLA Budget
    [Column(TypeName = "decimal(18,2)")]
    public decimal PLABudgetAllocated { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PLAReApp { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PLATotalBudget { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PLAExpenditure { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PLARemainingBudget { get; set; } = 0;
    
    // UHI Budget
    [Column(TypeName = "decimal(18,2)")]
    public decimal UHIBudgetAllocated { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UHIReApp { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UHITotalBudget { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UHIExpenditure { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal UHIRemainingBudget { get; set; } = 0;
    
    // Consolidated (computed values)
    [Column(TypeName = "decimal(18,2)")]
    public decimal ConsolidatedTotalBudget { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ConsolidatedTotalExpenditure { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ConsolidatedRemainingBudget { get; set; } = 0;
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public int? CreatedById { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }
    
    public int? UpdatedById { get; set; }
    
    [ForeignKey("UpdatedById")]
    public User? UpdatedBy { get; set; }
    
    // Method to calculate derived fields
    public void CalculateTotals()
    {
        SumOfReleased = FirstReleased + SecondReleased + ThirdReleased + FourthReleased;
        TotalAAABudget = SumOfReleased + AAAReApp;
        AAARemainingBudget = TotalAAABudget - BudgetWithheldLapse - AAAExpenditure;
        
        PLATotalBudget = PLABudgetAllocated + PLAReApp;
        PLARemainingBudget = PLATotalBudget - PLAExpenditure;
        
        UHITotalBudget = UHIBudgetAllocated + UHIReApp;
        UHIRemainingBudget = UHITotalBudget - UHIExpenditure;
        
        ConsolidatedTotalBudget = TotalAAABudget + PLATotalBudget + UHITotalBudget;
        ConsolidatedTotalExpenditure = AAAExpenditure + PLAExpenditure + UHIExpenditure;
        ConsolidatedRemainingBudget = AAARemainingBudget + PLARemainingBudget + UHIRemainingBudget;
    }
}

public class AuditLog
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string Action { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string EntityType { get; set; } = string.Empty;
    
    public int? EntityId { get; set; }
    
    public string? OldValues { get; set; }
    
    public string? NewValues { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [StringLength(50)]
    public string? IpAddress { get; set; }
}
