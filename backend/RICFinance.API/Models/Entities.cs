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

    public int? LevelId { get; set; }

    [ForeignKey("LevelId")]
    public ObjectCodeLevel? Level { get; set; }
    
    public ICollection<BudgetEntry> BudgetEntries { get; set; } = new List<BudgetEntry>();
}

public class ObjectCodeLevel
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    [ForeignKey("ParentId")]
    public ObjectCodeLevel? Parent { get; set; }

    public ICollection<ObjectCodeLevel> Children { get; set; } = new List<ObjectCodeLevel>();

    public bool IsActive { get; set; } = true;
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

public class ExpenseHistory
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int BudgetEntryId { get; set; }
    
    [ForeignKey("BudgetEntryId")]
    public BudgetEntry BudgetEntry { get; set; } = null!;
    
    [Required]
    [StringLength(200)]
    public string ExpenseName { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; } = 0;
    
    [Required]
    [StringLength(10)]
    public string BudgetType { get; set; } = "AAA"; // AAA, PLA, UHI
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int? CreatedById { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }
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

// ==================== eProcurement Integration Entities ====================

public class ContingentBill
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string BillNumber { get; set; } = string.Empty;
    
    public DateTime BillDate { get; set; } = DateTime.UtcNow;
    
    // Source from eProcurement
    public int? EprocTenderId { get; set; }
    
    [StringLength(200)]
    public string? SupplierName { get; set; }
    
    [StringLength(200)]
    public string? TenderTitle { get; set; }
    
    [StringLength(100)]
    public string? LetterOfAwardNumber { get; set; }
    
    // Budget allocation
    public int? ObjectCodeId { get; set; }
    
    [ForeignKey("ObjectCodeId")]
    public ObjectCode? ObjectCode { get; set; }
    
    public int? FiscalYearId { get; set; }
    
    [ForeignKey("FiscalYearId")]
    public FiscalYear? FiscalYear { get; set; }
    
    [StringLength(50)]
    public string? HeadCode { get; set; }
    
    [StringLength(200)]
    public string? HeadTitle { get; set; }
    
    // Amounts
    [Column(TypeName = "decimal(18,2)")]
    public decimal BudgetAllotment { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountOfBill { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPreviousBills { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalUptoDate { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AvailableBalance { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal GrandTotal { get; set; } = 0;
    
    // Tax deductions
    [Column(TypeName = "decimal(18,2)")]
    public decimal StampDuty { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal GST { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal IncomeTax { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal LaborDuty { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal NetPayment { get; set; } = 0;
    
    [StringLength(500)]
    public string? AmountInWords { get; set; }
    
    // Status: Pending, Approved, Rejected
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending";
    
    // Approval signatures
    public bool MedicalSuperintendentApproved { get; set; } = false;
    public DateTime? MedicalSuperintendentApprovalDate { get; set; }
    
    public bool ExecutiveDirectorApproved { get; set; } = false;
    public DateTime? ExecutiveDirectorApprovalDate { get; set; }
    
    public bool PreAuditPassed { get; set; } = false;
    public DateTime? PreAuditDate { get; set; }
    
    [StringLength(500)]
    public string? DisallowanceReason { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountLessDrawn { get; set; } = 0;
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public int? CreatedById { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }
    
    // Navigation
    public ICollection<ScheduleOfPayment> ScheduleOfPayments { get; set; } = new List<ScheduleOfPayment>();
}

public class ScheduleOfPayment
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int ContingentBillId { get; set; }
    
    [ForeignKey("ContingentBillId")]
    public ContingentBill ContingentBill { get; set; } = null!;
    
    public int SheetNumber { get; set; } = 1;
    
    // Payment details (multiple rows possible)
    public int SerialNumber { get; set; }
    
    [StringLength(50)]
    public string? BillMonth { get; set; }
    
    public DateTime? PaymentDate { get; set; }
    
    [StringLength(500)]
    public string? Particulars { get; set; }
    
    [StringLength(50)]
    public string? HeadCode { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal GrossAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal StampDuty { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal IncomeTax { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal GST { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PST { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal NetAmount { get; set; } = 0;
    
    [StringLength(100)]
    public string? ChequeNumberAndDate { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ChequeAmount { get; set; } = 0;
    
    // Status: Pending, Approved
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending";
    
    // Approval signatures
    public bool AccountantApproved { get; set; } = false;
    public bool BudgetOfficerApproved { get; set; } = false;
    public bool AuditOfficerApproved { get; set; } = false;
    public bool AccountsOfficerApproved { get; set; } = false;
    public bool DirectorFinanceApproved { get; set; } = false;
    public bool ExecutiveDirectorApproved { get; set; } = false;
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public int? CreatedById { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }
    
    // Navigation
    public ICollection<AsaanCheque> AsaanCheques { get; set; } = new List<AsaanCheque>();
}

public class AsaanCheque
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int ScheduleOfPaymentId { get; set; }
    
    [ForeignKey("ScheduleOfPaymentId")]
    public ScheduleOfPayment ScheduleOfPayment { get; set; } = null!;
    
    public int SheetNumber { get; set; } = 2;
    
    // Header info
    public int ScheduleSerialNumber { get; set; }
    
    public DateTime ScheduleDate { get; set; } = DateTime.UtcNow;
    
    [StringLength(200)]
    public string? DDOName { get; set; }
    
    [StringLength(200)]
    public string? DepartmentName { get; set; }
    
    [StringLength(200)]
    public string? AsaanAccountTitle { get; set; }
    
    [StringLength(100)]
    public string? AsaanAccountNumber { get; set; }
    
    [StringLength(50)]
    public string? CostCentre { get; set; }
    
    [StringLength(200)]
    public string? ProjectDescription { get; set; }
    
    [StringLength(200)]
    public string? SubDetailedFunction { get; set; }
    
    [StringLength(50)]
    public string? GrantNumber { get; set; }
    
    // Cheque details
    public int ChequeSerialNumber { get; set; }
    
    [StringLength(50)]
    public string? ChequeNumber { get; set; }
    
    public DateTime? ChequeDate { get; set; }
    
    [StringLength(200)]
    public string? PayeeName { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; } = 0;
    
    [StringLength(100)]
    public string? ObjectCodeDetail { get; set; }
    
    // Certificate
    public bool CertificateConfirmed { get; set; } = false;
    
    // Status: Pending, Approved, Forwarded
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending";
    
    // Approval
    public bool DirectorFinanceApproved { get; set; } = false;
    public DateTime? DirectorFinanceApprovalDate { get; set; }
    
    public bool ExecutiveDirectorApproved { get; set; } = false;
    public DateTime? ExecutiveDirectorApprovalDate { get; set; }
    
    // Forwarding info
    [StringLength(500)]
    public string? ForwardedToBank { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
    
    public DateTime? ForwardedDate { get; set; }
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public int? CreatedById { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }
}
