using System.ComponentModel.DataAnnotations;

namespace RICFinance.API.DTOs;

// Authentication DTOs
public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class RegisterDto
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Department { get; set; }
    
    [Required]
    public string Role { get; set; } = "User";
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
}

public class UpdateUserDto
{
    [StringLength(100)]
    public string? FullName { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [StringLength(50)]
    public string? Department { get; set; }
    
    public string? Role { get; set; }
    
    public bool? IsActive { get; set; }
}

// Object Code DTOs
public class ObjectCodeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string HeadOfAccount { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class CreateObjectCodeDto
{
    [Required]
    [StringLength(20)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string HeadOfAccount { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class UpdateObjectCodeDto
{
    [StringLength(20)]
    public string? Code { get; set; }
    
    [StringLength(200)]
    public string? HeadOfAccount { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool? IsActive { get; set; }
}

// Fiscal Year DTOs
public class FiscalYearDto
{
    public int Id { get; set; }
    public string Year { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsCurrent { get; set; }
}

public class CreateFiscalYearDto
{
    [Required]
    [StringLength(20)]
    public string Year { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public bool IsCurrent { get; set; } = false;
}

// Budget Entry DTOs
public class BudgetEntryDto
{
    public int Id { get; set; }
    public int ObjectCodeId { get; set; }
    public string ObjectCode { get; set; } = string.Empty;
    public string HeadOfAccount { get; set; } = string.Empty;
    public int FiscalYearId { get; set; }
    public string FiscalYear { get; set; } = string.Empty;
    
    // Non-Development Budget (AAA)
    public decimal TotalBudgetAllocation { get; set; }
    public decimal FirstReleased { get; set; }
    public decimal SecondReleased { get; set; }
    public decimal ThirdReleased { get; set; }
    public decimal FourthReleased { get; set; }
    public decimal SupplementaryBudget { get; set; }
    public decimal AdditionalSurrender { get; set; }
    public decimal ExcessReallocation { get; set; }
    public decimal SumOfReleased { get; set; }
    public decimal AAAReApp { get; set; }
    public decimal TotalAAABudget { get; set; }
    public decimal BudgetWithheldLapse { get; set; }
    public decimal AAAExpenditure { get; set; }
    public decimal AAARemainingBudget { get; set; }
    
    // PLA Budget
    public decimal PLABudgetAllocated { get; set; }
    public decimal PLAReApp { get; set; }
    public decimal PLATotalBudget { get; set; }
    public decimal PLAExpenditure { get; set; }
    public decimal PLARemainingBudget { get; set; }
    
    // UHI Budget
    public decimal UHIBudgetAllocated { get; set; }
    public decimal UHIReApp { get; set; }
    public decimal UHITotalBudget { get; set; }
    public decimal UHIExpenditure { get; set; }
    public decimal UHIRemainingBudget { get; set; }
    
    // Consolidated
    public decimal ConsolidatedTotalBudget { get; set; }
    public decimal ConsolidatedTotalExpenditure { get; set; }
    public decimal ConsolidatedRemainingBudget { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateBudgetEntryDto
{
    [Required]
    public int ObjectCodeId { get; set; }
    
    [Required]
    public int FiscalYearId { get; set; }
    
    // Non-Development Budget (AAA)
    public decimal TotalBudgetAllocation { get; set; }
    public decimal FirstReleased { get; set; }
    public decimal SecondReleased { get; set; }
    public decimal ThirdReleased { get; set; }
    public decimal FourthReleased { get; set; }
    public decimal SupplementaryBudget { get; set; }
    public decimal AdditionalSurrender { get; set; }
    public decimal ExcessReallocation { get; set; }
    public decimal AAAReApp { get; set; }
    public decimal BudgetWithheldLapse { get; set; }
    public decimal AAAExpenditure { get; set; }
    
    // PLA Budget
    public decimal PLABudgetAllocated { get; set; }
    public decimal PLAReApp { get; set; }
    public decimal PLAExpenditure { get; set; }
    
    // UHI Budget
    public decimal UHIBudgetAllocated { get; set; }
    public decimal UHIReApp { get; set; }
    public decimal UHIExpenditure { get; set; }
}

public class UpdateBudgetEntryDto
{
    // Non-Development Budget (AAA)
    public decimal? TotalBudgetAllocation { get; set; }
    public decimal? FirstReleased { get; set; }
    public decimal? SecondReleased { get; set; }
    public decimal? ThirdReleased { get; set; }
    public decimal? FourthReleased { get; set; }
    public decimal? SupplementaryBudget { get; set; }
    public decimal? AdditionalSurrender { get; set; }
    public decimal? ExcessReallocation { get; set; }
    public decimal? AAAReApp { get; set; }
    public decimal? BudgetWithheldLapse { get; set; }
    public decimal? AAAExpenditure { get; set; }
    
    // PLA Budget
    public decimal? PLABudgetAllocated { get; set; }
    public decimal? PLAReApp { get; set; }
    public decimal? PLAExpenditure { get; set; }
    
    // UHI Budget
    public decimal? UHIBudgetAllocated { get; set; }
    public decimal? UHIReApp { get; set; }
    public decimal? UHIExpenditure { get; set; }
}

// Dashboard DTOs
public class DashboardSummaryDto
{
    public string FiscalYear { get; set; } = string.Empty;
    public decimal TotalBudgetAllocated { get; set; }
    public decimal TotalExpenditure { get; set; }
    public decimal TotalRemaining { get; set; }
    public decimal UtilizationPercentage { get; set; }
    
    public BudgetCategorySummaryDto AAABudget { get; set; } = new();
    public BudgetCategorySummaryDto PLABudget { get; set; } = new();
    public BudgetCategorySummaryDto UHIBudget { get; set; } = new();
    
    public List<TopExpenditureDto> TopExpenditures { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
}

public class BudgetCategorySummaryDto
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }
    public decimal TotalExpenditure { get; set; }
    public decimal Remaining { get; set; }
    public decimal UtilizationPercentage { get; set; }
}

public class TopExpenditureDto
{
    public string ObjectCode { get; set; } = string.Empty;
    public string HeadOfAccount { get; set; } = string.Empty;
    public decimal Expenditure { get; set; }
    public decimal Budget { get; set; }
    public decimal UtilizationPercentage { get; set; }
}

public class MonthlyTrendDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Expenditure { get; set; }
    public decimal Budget { get; set; }
}
