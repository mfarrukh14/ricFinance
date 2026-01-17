using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RICFinance.API.Data;
using RICFinance.API.Models;

namespace RICFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkflowController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public WorkflowController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private int GetCurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    private async Task<User?> GetCurrentUserAsync() =>
        await _context.Users.FindAsync(GetCurrentUserId());

    private ActionResult? EnsureRole(params string[] roles)
    {
        if (roles.Length == 0)
            return null;

        if (!roles.Any(r => User.IsInRole(r)))
            return Forbid();

        return null;
    }

    // ==================== Role-Based Bill Retrieval ====================

    /// <summary>
    /// Get bills for Computer Operator - Drafts and own created bills
    /// </summary>
    [HttpGet("bills/computer-operator")]
    public async Task<ActionResult> GetComputerOperatorBills()
    {
        var roleCheck = EnsureRole("ComputerOperator", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        
        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.CreatedById == userId || b.IsDraft)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills pending for Accountant review
    /// </summary>
    [HttpGet("bills/accountant")]
    public async Task<ActionResult> GetAccountantBills()
    {
        var roleCheck = EnsureRole("Accountant", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "PendingAccountant" && !b.IsDraft)
            .OrderByDescending(b => b.ComputerOperatorSubmittedAt)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills pending for Account Officer review
    /// </summary>
    [HttpGet("bills/account-officer")]
    public async Task<ActionResult> GetAccountOfficerBills()
    {
        var roleCheck = EnsureRole("AccountOfficer", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "PendingAccountOfficer" && !b.IsDraft)
            .OrderByDescending(b => b.AccountantApprovalDate)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills pending for Audit Officer review
    /// </summary>
    [HttpGet("bills/audit-officer")]
    public async Task<ActionResult> GetAuditOfficerBills()
    {
        var roleCheck = EnsureRole("AuditOfficer", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "PendingAuditOfficer" && !b.IsDraft)
            .OrderByDescending(b => b.AccountOfficerApprovalDate)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills pending for Senior Budget & Account Officer review
    /// </summary>
    [HttpGet("bills/senior-budget-officer")]
    public async Task<ActionResult> GetSeniorBudgetOfficerBills()
    {
        var roleCheck = EnsureRole("SeniorBudgetOfficer", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "PendingSeniorBudgetOfficer" && !b.IsDraft)
            .OrderByDescending(b => b.AuditOfficerApprovalDate)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills pending for Director Finance approval
    /// </summary>
    [HttpGet("bills/director-finance")]
    public async Task<ActionResult> GetDirectorFinanceBills()
    {
        var roleCheck = EnsureRole("DirectorFinance", "Admin");
        if (roleCheck != null)
            return roleCheck;

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "PendingDirectorFinance" && !b.IsDraft)
            .OrderByDescending(b => b.SeniorBudgetOfficerApprovalDate)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get all approved bills (for reports)
    /// </summary>
    [HttpGet("bills/approved")]
    public async Task<ActionResult> GetApprovedBills()
    {
        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "Approved")
            .OrderByDescending(b => b.DirectorFinanceApprovalDate)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get all rejected bills
    /// </summary>
    [HttpGet("bills/rejected")]
    public async Task<ActionResult> GetRejectedBills()
    {
        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Where(b => b.Status == "Rejected")
            .OrderByDescending(b => b.UpdatedAt)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get bills based on current user's role
    /// </summary>
    [HttpGet("bills/my-queue")]
    public async Task<ActionResult> GetMyQueueBills()
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
            return Unauthorized();

        IQueryable<ContingentBill> query = _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy);

        // Filter based on role
        query = user.Role switch
        {
            "ComputerOperator" => query.Where(b => b.CreatedById == user.Id || (b.IsDraft && b.Status == "Draft")),
            "Accountant" => query.Where(b => b.Status == "PendingAccountant"),
            "AccountOfficer" => query.Where(b => b.Status == "PendingAccountOfficer"),
            "AuditOfficer" => query.Where(b => b.Status == "PendingAuditOfficer"),
            "SeniorBudgetOfficer" => query.Where(b => b.Status == "PendingSeniorBudgetOfficer"),
            "DirectorFinance" => query.Where(b => b.Status == "PendingDirectorFinance"),
            "Admin" => query, // Admin sees all
            _ => query.Where(b => false) // Unknown role sees nothing
        };

        var bills = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => MapToWorkflowResponse(b))
            .ToListAsync();

        return Ok(bills);
    }

    // ==================== Workflow Actions ====================

    /// <summary>
    /// Save bill as draft (Computer Operator)
    /// </summary>
    [HttpPost("bills/{id}/save-draft")]
    public async Task<ActionResult> SaveAsDraft(int id)
    {
        var roleCheck = EnsureRole("ComputerOperator");
        if (roleCheck != null)
            return roleCheck;

        var bill = await _context.ContingentBills.FindAsync(id);
        if (bill == null)
            return NotFound();

        bill.IsDraft = true;
        bill.Status = "Draft";
        bill.WorkflowStatus = "Draft";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill saved as draft" });
    }

    /// <summary>
    /// Computer Operator submits bill to Account Officer
    /// </summary>
    [HttpPost("bills/{id}/submit-to-account-officer")]
    public async Task<ActionResult> SubmitToAccountOfficer(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("ComputerOperator");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "Draft" && bill.Status != "Rejected")
            return BadRequest(new { message = "Bill must be in Draft or Rejected status to submit" });

        bill.IsDraft = false;
        bill.Status = "PendingAccountOfficer";
        bill.WorkflowStatus = "InProgress";
        bill.CreatedByComputerOperatorId = userId;
        bill.ComputerOperatorSubmittedAt = DateTime.UtcNow;
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill submitted to Account Officer" });
    }

    /// <summary>
    /// Accountant approves and forwards to Account Officer
    /// </summary>
    [HttpPost("bills/{id}/accountant-approve")]
    public async Task<ActionResult> AccountantApprove(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("Accountant");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "PendingAccountant")
            return BadRequest(new { message = "Bill is not pending Accountant approval" });

        bill.AccountantId = userId;
        bill.AccountantApproved = true;
        bill.AccountantApprovalDate = DateTime.UtcNow;
        bill.AccountantRemarks = dto?.Remarks;
        bill.Status = "PendingAccountOfficer";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill forwarded to Account Officer" });
    }

    /// <summary>
    /// Account Officer approves and forwards to Audit Officer
    /// </summary>
    [HttpPost("bills/{id}/account-officer-approve")]
    public async Task<ActionResult> AccountOfficerApprove(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("AccountOfficer");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "PendingAccountOfficer")
            return BadRequest(new { message = "Bill is not pending Account Officer approval" });

        bill.AccountOfficerId = userId;
        bill.AccountOfficerApproved = true;
        bill.AccountOfficerApprovalDate = DateTime.UtcNow;
        bill.AccountOfficerRemarks = dto?.Remarks;
        bill.Status = "PendingAuditOfficer";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill forwarded to Audit Officer" });
    }

    /// <summary>
    /// Audit Officer approves and forwards to Senior Budget Officer
    /// </summary>
    [HttpPost("bills/{id}/audit-officer-approve")]
    public async Task<ActionResult> AuditOfficerApprove(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("AuditOfficer");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "PendingAuditOfficer")
            return BadRequest(new { message = "Bill is not pending Audit Officer approval" });

        bill.AuditOfficerId = userId;
        bill.AuditOfficerApproved = true;
        bill.AuditOfficerApprovalDate = DateTime.UtcNow;
        bill.AuditOfficerRemarks = dto?.Remarks;
        bill.Status = "PendingSeniorBudgetOfficer";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill forwarded to Senior Budget & Account Officer" });
    }

    /// <summary>
    /// Senior Budget Officer approves and forwards to Director Finance
    /// </summary>
    [HttpPost("bills/{id}/senior-budget-officer-approve")]
    public async Task<ActionResult> SeniorBudgetOfficerApprove(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("SeniorBudgetOfficer");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "PendingSeniorBudgetOfficer")
            return BadRequest(new { message = "Bill is not pending Senior Budget Officer approval" });

        bill.SeniorBudgetOfficerId = userId;
        bill.SeniorBudgetOfficerApproved = true;
        bill.SeniorBudgetOfficerApprovalDate = DateTime.UtcNow;
        bill.SeniorBudgetOfficerRemarks = dto?.Remarks;
        bill.Status = "PendingDirectorFinance";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill forwarded to Director Finance" });
    }

    /// <summary>
    /// Director Finance gives final approval
    /// </summary>
    [HttpPost("bills/{id}/director-finance-approve")]
    public async Task<ActionResult> DirectorFinanceApprove(int id, [FromBody] WorkflowActionDto? dto)
    {
        var roleCheck = EnsureRole("DirectorFinance");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();
        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        if (bill.Status != "PendingDirectorFinance")
            return BadRequest(new { message = "Bill is not pending Director Finance approval" });

        bill.DirectorFinanceId = userId;
        bill.DirectorFinanceApproved = true;
        bill.DirectorFinanceApprovalDate = DateTime.UtcNow;
        bill.DirectorFinanceRemarks = dto?.Remarks;
        bill.Status = "Approved";
        bill.WorkflowStatus = "Completed";
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill approved by Director Finance" });
    }

    /// <summary>
    /// Reject bill at any stage (with reason)
    /// </summary>
    [HttpPost("bills/{id}/reject")]
    public async Task<ActionResult> RejectBill(int id, [FromBody] WorkflowRejectDto dto)
    {
        var roleCheck = EnsureRole("Accountant", "AccountOfficer", "AuditOfficer", "SeniorBudgetOfficer", "DirectorFinance");
        if (roleCheck != null)
            return roleCheck;

        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        var user = await GetCurrentUserAsync();
        if (user == null)
            return Unauthorized();

        // Store rejection info based on who is rejecting
        switch (user.Role)
        {
            case "Accountant":
                bill.AccountantRemarks = $"REJECTED: {dto.Reason}";
                break;
            case "AccountOfficer":
                bill.AccountOfficerRemarks = $"REJECTED: {dto.Reason}";
                break;
            case "AuditOfficer":
                bill.AuditOfficerRemarks = $"REJECTED: {dto.Reason}";
                break;
            case "SeniorBudgetOfficer":
                bill.SeniorBudgetOfficerRemarks = $"REJECTED: {dto.Reason}";
                break;
            case "DirectorFinance":
                bill.DirectorFinanceRemarks = $"REJECTED: {dto.Reason}";
                break;
        }

        bill.Status = "Rejected";
        bill.WorkflowStatus = "Rejected";
        bill.DisallowanceReason = dto.Reason;
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Bill rejected" });
    }

    /// <summary>
    /// Return bill to previous stage for correction
    /// </summary>
    [HttpPost("bills/{id}/return")]
    public async Task<ActionResult> ReturnBill(int id, [FromBody] WorkflowActionDto dto)
    {
        var roleCheck = EnsureRole("Accountant", "AccountOfficer", "AuditOfficer", "SeniorBudgetOfficer", "DirectorFinance");
        if (roleCheck != null)
            return roleCheck;

        var bill = await _context.ContingentBills.FindAsync(id);
        
        if (bill == null)
            return NotFound();

        var user = await GetCurrentUserAsync();
        if (user == null)
            return Unauthorized();

        // Determine previous status based on current status
        var previousStatus = bill.Status switch
        {
            "PendingAccountant" => "Draft",
            "PendingAccountOfficer" => "PendingAccountant",
            "PendingAuditOfficer" => "PendingAccountOfficer",
            "PendingSeniorBudgetOfficer" => "PendingAuditOfficer",
            "PendingDirectorFinance" => "PendingSeniorBudgetOfficer",
            _ => bill.Status
        };

        bill.Status = previousStatus;
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Bill returned to previous stage: {previousStatus}" });
    }

    // ==================== PO Search ====================

    /// <summary>
    /// Search Purchase Orders from eProcurement system
    /// </summary>
    [HttpGet("search-po")]
    public async Task<ActionResult> SearchPurchaseOrders([FromQuery] string? query)
    {
        try
        {
            var eprocBaseUrl = _configuration["eProcurement:BaseUrl"] ?? "http://localhost:6100";
            
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync($"{eprocBaseUrl}/api/purchase-orders/public");
            
            if (!response.IsSuccessStatusCode)
                return Ok(new List<object>()); // Return empty if eProcurement not available

            var root = await response.Content.ReadFromJsonAsync<JsonElement>();
            JsonElement items = root;

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("purchaseOrders", out var wrapped))
                items = wrapped;

            if (items.ValueKind != JsonValueKind.Array)
                return Ok(new List<object>());

            var purchaseOrders = new List<POSearchResult>();

            foreach (var item in items.EnumerateArray())
            {
                purchaseOrders.Add(new POSearchResult
                {
                    Id = GetInt(item, "id"),
                    PONumber = GetString(item, "poNumber", "po_number"),
                    SONumber = GetString(item, "soNumber", "so_number"),
                    SupplierName = GetString(item, "supplierName", "supplier_name", "business_name"),
                    TenderTitle = GetString(item, "tenderTitle", "tender_title", "tender_number", "tender_item_name"),
                    LetterOfAwardNumber = GetString(item, "letterOfAwardNumber", "award_letter_id", "awardLetterId"),
                    TotalAmount = GetDecimal(item, "totalAmount", "total_amount"),
                    CreatedAt = GetDate(item, "createdAt", "created_at")
                });
            }

            // Filter by query if provided
            if (!string.IsNullOrWhiteSpace(query))
            {
                purchaseOrders = purchaseOrders.Where(po =>
                    (po.PONumber?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (po.SONumber?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (po.SupplierName?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (po.TenderTitle?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false)
                ).ToList();
            }

            return Ok(purchaseOrders);
        }
        catch (Exception)
        {
            return Ok(new List<object>()); // Return empty on error
        }
    }

    /// <summary>
    /// Create bill from selected PO
    /// </summary>
    [HttpPost("bills/create-from-po")]
    public async Task<ActionResult> CreateBillFromPO([FromBody] CreateFromPODto dto)
    {
        var roleCheck = EnsureRole("ComputerOperator");
        if (roleCheck != null)
            return roleCheck;

        var userId = GetCurrentUserId();

        // Generate bill number
        var count = await _context.ContingentBills.CountAsync() + 1;
        var billNumber = $"CB-{DateTime.Now:yyyyMMdd}-{count:D4}";

        var bill = new ContingentBill
        {
            BillNumber = billNumber,
            BillDate = DateTime.UtcNow,
            PONumber = dto.PONumber,
            SONumber = dto.SONumber,
            SupplierName = dto.SupplierName,
            TenderTitle = dto.TenderTitle,
            LetterOfAwardNumber = dto.LetterOfAwardNumber,
            AmountOfBill = dto.TotalAmount,
            GrandTotal = dto.TotalAmount,
            NetPayment = dto.TotalAmount,
            Status = "Draft",
            WorkflowStatus = "Draft",
            IsDraft = true,
            CreatedById = userId,
            CreatedByComputerOperatorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContingentBills.Add(bill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBillDetails), new { id = bill.Id }, bill);
    }

    /// <summary>
    /// Get detailed bill info for viewing/printing
    /// </summary>
    [HttpGet("bills/{id}/details")]
    public async Task<ActionResult> GetBillDetails(int id)
    {
        var bill = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .Include(b => b.ScheduleOfPayments)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null)
            return NotFound();

        return Ok(bill);
    }

    /// <summary>
    /// Get workflow history/audit trail for a bill
    /// </summary>
    [HttpGet("bills/{id}/history")]
    public async Task<ActionResult> GetBillHistory(int id)
    {
        var bill = await _context.ContingentBills
            .Include(b => b.CreatedBy)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null)
            return NotFound();

        var history = new List<object>();

        // Build history from workflow timestamps
        if (bill.CreatedAt != default)
        {
            history.Add(new
            {
                Step = "Created",
                By = bill.CreatedBy?.FullName ?? "System",
                Date = bill.CreatedAt,
                Status = "Draft"
            });
        }

        if (bill.ComputerOperatorSubmittedAt.HasValue)
        {
            history.Add(new
            {
                Step = "Submitted by Computer Operator",
                By = await GetUserNameById(bill.CreatedByComputerOperatorId),
                Date = bill.ComputerOperatorSubmittedAt.Value,
                Status = "PendingAccountant"
            });
        }

        if (bill.AccountantApprovalDate.HasValue)
        {
            history.Add(new
            {
                Step = "Verified by Accountant",
                By = await GetUserNameById(bill.AccountantId),
                Date = bill.AccountantApprovalDate.Value,
                Remarks = bill.AccountantRemarks,
                Status = "PendingAccountOfficer"
            });
        }

        if (bill.AccountOfficerApprovalDate.HasValue)
        {
            history.Add(new
            {
                Step = "Approved by Account Officer",
                By = await GetUserNameById(bill.AccountOfficerId),
                Date = bill.AccountOfficerApprovalDate.Value,
                Remarks = bill.AccountOfficerRemarks,
                Status = "PendingAuditOfficer"
            });
        }

        if (bill.AuditOfficerApprovalDate.HasValue)
        {
            history.Add(new
            {
                Step = "Audited by Audit Officer",
                By = await GetUserNameById(bill.AuditOfficerId),
                Date = bill.AuditOfficerApprovalDate.Value,
                Remarks = bill.AuditOfficerRemarks,
                Status = "PendingSeniorBudgetOfficer"
            });
        }

        if (bill.SeniorBudgetOfficerApprovalDate.HasValue)
        {
            history.Add(new
            {
                Step = "Verified by Senior Budget & Account Officer",
                By = await GetUserNameById(bill.SeniorBudgetOfficerId),
                Date = bill.SeniorBudgetOfficerApprovalDate.Value,
                Remarks = bill.SeniorBudgetOfficerRemarks,
                Status = "PendingDirectorFinance"
            });
        }

        if (bill.DirectorFinanceApprovalDate.HasValue)
        {
            history.Add(new
            {
                Step = "Final Approval by Director Finance",
                By = await GetUserNameById(bill.DirectorFinanceId),
                Date = bill.DirectorFinanceApprovalDate.Value,
                Remarks = bill.DirectorFinanceRemarks,
                Status = "Approved"
            });
        }

        return Ok(history);
    }

    // ==================== Dashboard Stats ====================

    /// <summary>
    /// Get workflow statistics for dashboard
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetWorkflowStats()
    {
        var user = await GetCurrentUserAsync();
        
        var stats = new
        {
            Draft = await _context.ContingentBills.CountAsync(b => b.Status == "Draft"),
            PendingAccountant = await _context.ContingentBills.CountAsync(b => b.Status == "PendingAccountant"),
            PendingAccountOfficer = await _context.ContingentBills.CountAsync(b => b.Status == "PendingAccountOfficer"),
            PendingAuditOfficer = await _context.ContingentBills.CountAsync(b => b.Status == "PendingAuditOfficer"),
            PendingSeniorBudgetOfficer = await _context.ContingentBills.CountAsync(b => b.Status == "PendingSeniorBudgetOfficer"),
            PendingDirectorFinance = await _context.ContingentBills.CountAsync(b => b.Status == "PendingDirectorFinance"),
            Approved = await _context.ContingentBills.CountAsync(b => b.Status == "Approved"),
            Rejected = await _context.ContingentBills.CountAsync(b => b.Status == "Rejected"),
            MyQueueCount = user != null ? await GetMyQueueCount(user) : 0
        };

        return Ok(stats);
    }

    // ==================== Helper Methods ====================

    private async Task<int> GetMyQueueCount(User user)
    {
        return user.Role switch
        {
            "ComputerOperator" => await _context.ContingentBills.CountAsync(b => b.CreatedById == user.Id || b.Status == "Draft"),
            "Accountant" => await _context.ContingentBills.CountAsync(b => b.Status == "PendingAccountant"),
            "AccountOfficer" => await _context.ContingentBills.CountAsync(b => b.Status == "PendingAccountOfficer"),
            "AuditOfficer" => await _context.ContingentBills.CountAsync(b => b.Status == "PendingAuditOfficer"),
            "SeniorBudgetOfficer" => await _context.ContingentBills.CountAsync(b => b.Status == "PendingSeniorBudgetOfficer"),
            "DirectorFinance" => await _context.ContingentBills.CountAsync(b => b.Status == "PendingDirectorFinance"),
            "Admin" => await _context.ContingentBills.CountAsync(),
            _ => 0
        };
    }

    private async Task<string> GetUserNameById(int? userId)
    {
        if (!userId.HasValue) return "Unknown";
        var user = await _context.Users.FindAsync(userId.Value);
        return user?.FullName ?? "Unknown";
    }

    private static string? GetString(JsonElement element, params string[] names)
    {
        foreach (var name in names)
        {
            if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.String) return prop.GetString();
                if (prop.ValueKind != JsonValueKind.Null && prop.ValueKind != JsonValueKind.Undefined)
                    return prop.ToString();
            }
        }
        return null;
    }

    private static int GetInt(JsonElement element, params string[] names)
    {
        var str = GetString(element, names);
        if (int.TryParse(str, out var value)) return value;
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var name in names)
            {
                if (element.TryGetProperty(name, out var prop) && prop.TryGetInt32(out var num)) return num;
            }
        }
        return 0;
    }

    private static decimal GetDecimal(JsonElement element, params string[] names)
    {
        var str = GetString(element, names);
        if (decimal.TryParse(str, out var value)) return value;
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var name in names)
            {
                if (element.TryGetProperty(name, out var prop) && prop.TryGetDecimal(out var num)) return num;
            }
        }
        return 0m;
    }

    private static DateTime? GetDate(JsonElement element, params string[] names)
    {
        var str = GetString(element, names);
        if (DateTime.TryParse(str, out var value)) return value;
        return null;
    }

    private static WorkflowBillResponseDto MapToWorkflowResponse(ContingentBill b)
    {
        return new WorkflowBillResponseDto
        {
            Id = b.Id,
            BillNumber = b.BillNumber,
            BillDate = b.BillDate,
            SupplierName = b.SupplierName,
            TenderTitle = b.TenderTitle,
            PONumber = b.PONumber,
            SONumber = b.SONumber,
            AmountOfBill = b.AmountOfBill,
            NetPayment = b.NetPayment,
            Status = b.Status,
            WorkflowStatus = b.WorkflowStatus,
            IsDraft = b.IsDraft,
            ObjectCode = b.ObjectCode?.Code,
            HeadTitle = b.HeadTitle,
            CreatedAt = b.CreatedAt,
            CreatedByName = b.CreatedBy?.FullName,
            ComputerOperatorSubmittedAt = b.ComputerOperatorSubmittedAt,
            AccountantApprovalDate = b.AccountantApprovalDate,
            AccountOfficerApprovalDate = b.AccountOfficerApprovalDate,
            AuditOfficerApprovalDate = b.AuditOfficerApprovalDate,
            SeniorBudgetOfficerApprovalDate = b.SeniorBudgetOfficerApprovalDate,
            DirectorFinanceApprovalDate = b.DirectorFinanceApprovalDate,
            AccountantRemarks = b.AccountantRemarks,
            AccountOfficerRemarks = b.AccountOfficerRemarks,
            AuditOfficerRemarks = b.AuditOfficerRemarks,
            SeniorBudgetOfficerRemarks = b.SeniorBudgetOfficerRemarks,
            DirectorFinanceRemarks = b.DirectorFinanceRemarks
        };
    }
}

// DTOs for this controller
public class WorkflowActionDto
{
    public string? Remarks { get; set; }
}

public class WorkflowRejectDto
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}

public class WorkflowBillResponseDto
{
    public int Id { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? PONumber { get; set; }
    public string? SONumber { get; set; }
    public decimal AmountOfBill { get; set; }
    public decimal NetPayment { get; set; }
    public string Status { get; set; } = string.Empty;
    public string WorkflowStatus { get; set; } = string.Empty;
    public bool IsDraft { get; set; }
    public string? ObjectCode { get; set; }
    public string? HeadTitle { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime? ComputerOperatorSubmittedAt { get; set; }
    public DateTime? AccountantApprovalDate { get; set; }
    public DateTime? AccountOfficerApprovalDate { get; set; }
    public DateTime? AuditOfficerApprovalDate { get; set; }
    public DateTime? SeniorBudgetOfficerApprovalDate { get; set; }
    public DateTime? DirectorFinanceApprovalDate { get; set; }
    public string? AccountantRemarks { get; set; }
    public string? AccountOfficerRemarks { get; set; }
    public string? AuditOfficerRemarks { get; set; }
    public string? SeniorBudgetOfficerRemarks { get; set; }
    public string? DirectorFinanceRemarks { get; set; }
}

public class CreateFromPODto
{
    public string? PONumber { get; set; }
    public string? SONumber { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? LetterOfAwardNumber { get; set; }
    public decimal TotalAmount { get; set; }
}

public class POSearchResult
{
    public int Id { get; set; }
    public string? PONumber { get; set; }
    public string? SONumber { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? LetterOfAwardNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime? CreatedAt { get; set; }
}
