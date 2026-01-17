using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RICFinance.API.Data;
using RICFinance.API.Models;

namespace RICFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContingentBillController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public ContingentBillController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private int GetCurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    private static void RecalculateBill(ContingentBill bill)
    {
        // If GrandTotal wasn't explicitly set, fall back to AmountOfBill.
        // (eProc-created bills often only set AmountOfBill.)
        if (bill.GrandTotal == 0 && bill.AmountOfBill != 0)
            bill.GrandTotal = bill.AmountOfBill;

        // Keep derived totals consistent
        bill.TotalUptoDate = bill.TotalPreviousBills + bill.AmountOfBill;
        bill.AvailableBalance = bill.BudgetAllotment - bill.TotalUptoDate;

        // Net = Gross - deductions
        bill.NetPayment = bill.GrandTotal - bill.StampDuty - bill.GST - bill.IncomeTax - bill.LaborDuty;
    }

    private async Task ApplyBudgetDefaultsFromEntryAsync(
        ContingentBill bill,
        bool shouldFillBudgetAllotment,
        bool shouldFillTotalPreviousBills)
    {
        if (!bill.ObjectCodeId.HasValue || !bill.FiscalYearId.HasValue)
            return;

        var budgetEntry = await _context.BudgetEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(be =>
                be.ObjectCodeId == bill.ObjectCodeId.Value &&
                be.FiscalYearId == bill.FiscalYearId.Value);

        if (budgetEntry == null)
            return;

        // "Releases" = released tranches; "Expenditure" = AAA expenditure tracked in BudgetEntry.
        var totalReleased = budgetEntry.FirstReleased + budgetEntry.SecondReleased + budgetEntry.ThirdReleased + budgetEntry.FourthReleased;
        var totalExpenditure = budgetEntry.AAAExpenditure;

        if (shouldFillBudgetAllotment && bill.BudgetAllotment == 0)
            bill.BudgetAllotment = totalReleased;

        if (shouldFillTotalPreviousBills && bill.TotalPreviousBills == 0)
            bill.TotalPreviousBills = totalExpenditure;
    }

    // ==================== Contingent Bills ====================

    [HttpGet("contingent-bills")]
    [Authorize]
    public async Task<ActionResult<List<ContingentBill>>> GetContingentBills()
    {
        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .Include(b => b.CreatedBy)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(bills);
    }

    [HttpGet("contingent-bills/{id}")]
    [Authorize]
    public async Task<ActionResult<ContingentBill>> GetContingentBill(int id)
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

    // Endpoint for eProcurement to create contingent bill
    [HttpPost("contingent-bills/from-eproc")]
    public async Task<ActionResult<ContingentBill>> CreateFromEproc([FromBody] EprocContingentBillDto dto)
    {
        // Generate bill number
        var count = await _context.ContingentBills.CountAsync() + 1;
        var billNumber = $"CB-{DateTime.Now:yyyyMMdd}-{count:D4}";

        var bill = new ContingentBill
        {
            BillNumber = billNumber,
            BillDate = DateTime.UtcNow,
            EprocTenderId = dto.TenderId,
            SupplierName = dto.SupplierName,
            TenderTitle = dto.TenderTitle,
            LetterOfAwardNumber = dto.LetterOfAwardNumber,
            AmountOfBill = dto.TotalAmount,
            GrandTotal = dto.TotalAmount,
            NetPayment = dto.TotalAmount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        RecalculateBill(bill);

        _context.ContingentBills.Add(bill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContingentBill), new { id = bill.Id }, bill);
    }

    [HttpPost("contingent-bills")]
    [Authorize]
    public async Task<ActionResult<ContingentBill>> CreateContingentBill([FromBody] ContingentBillCreateDto dto)
    {
        var userId = GetCurrentUserId();

        // Generate bill number
        var count = await _context.ContingentBills.CountAsync() + 1;
        var billNumber = $"CB-{DateTime.Now:yyyyMMdd}-{count:D4}";

        var bill = new ContingentBill
        {
            BillNumber = billNumber,
            BillDate = dto.BillDate ?? DateTime.UtcNow,
            SupplierName = dto.SupplierName,
            TenderTitle = dto.TenderTitle,
            LetterOfAwardNumber = dto.LetterOfAwardNumber,
            ObjectCodeId = dto.ObjectCodeId,
            FiscalYearId = dto.FiscalYearId,
            HeadCode = dto.HeadCode,
            HeadTitle = dto.HeadTitle,
            BudgetAllotment = dto.BudgetAllotment,
            AmountOfBill = dto.AmountOfBill,
            TotalPreviousBills = dto.TotalPreviousBills,
            GrandTotal = dto.GrandTotal,
            StampDuty = dto.StampDuty,
            GST = dto.GST,
            IncomeTax = dto.IncomeTax,
            LaborDuty = dto.LaborDuty,
            AmountInWords = dto.AmountInWords,
            Status = "Pending",
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        // If caller didn't provide budget figures (common for eProc/manual quick entry), fill from BudgetEntry.
        await ApplyBudgetDefaultsFromEntryAsync(
            bill,
            shouldFillBudgetAllotment: dto.BudgetAllotment == 0,
            shouldFillTotalPreviousBills: dto.TotalPreviousBills == 0);

        // Calculate derived totals server-side (don't rely on client-provided NetPayment)
        RecalculateBill(bill);

        _context.ContingentBills.Add(bill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContingentBill), new { id = bill.Id }, bill);
    }

    [HttpPut("contingent-bills/{id}")]
    [Authorize]
    public async Task<ActionResult<ContingentBill>> UpdateContingentBill(int id, [FromBody] ContingentBillUpdateDto dto)
    {
        var bill = await _context.ContingentBills.FindAsync(id);
        if (bill == null)
            return NotFound();

        var isDraft = string.Equals(bill.Status, "Draft", StringComparison.OrdinalIgnoreCase);
        var isPendingAccountOfficer = string.Equals(bill.Status, "PendingAccountOfficer", StringComparison.OrdinalIgnoreCase);

        if (!isDraft && !isPendingAccountOfficer)
            return BadRequest(new { message = "Only Draft or Pending Account Officer bills can be edited." });

        if (isPendingAccountOfficer && !User.IsInRole("AccountOfficer"))
            return Forbid();

        if (dto.BillDate.HasValue)
            bill.BillDate = dto.BillDate.Value;

        if (!string.IsNullOrWhiteSpace(dto.SupplierName))
            bill.SupplierName = dto.SupplierName;

        if (!string.IsNullOrWhiteSpace(dto.TenderTitle))
            bill.TenderTitle = dto.TenderTitle;

        if (!string.IsNullOrWhiteSpace(dto.LetterOfAwardNumber))
            bill.LetterOfAwardNumber = dto.LetterOfAwardNumber;

        // Update object code and fiscal year
        if (dto.ObjectCodeId.HasValue)
            bill.ObjectCodeId = dto.ObjectCodeId.Value;
        if (dto.FiscalYearId.HasValue)
            bill.FiscalYearId = dto.FiscalYearId.Value;
        if (!string.IsNullOrEmpty(dto.HeadCode))
            bill.HeadCode = dto.HeadCode;
        if (!string.IsNullOrEmpty(dto.HeadTitle))
            bill.HeadTitle = dto.HeadTitle;

        bill.BudgetAllotment = dto.BudgetAllotment ?? bill.BudgetAllotment;
        bill.AmountOfBill = dto.AmountOfBill ?? bill.AmountOfBill;
        bill.TotalPreviousBills = dto.TotalPreviousBills ?? bill.TotalPreviousBills;
        bill.GrandTotal = dto.GrandTotal ?? bill.GrandTotal;
        bill.StampDuty = dto.StampDuty ?? bill.StampDuty;
        bill.GST = dto.GST ?? bill.GST;
        bill.IncomeTax = dto.IncomeTax ?? bill.IncomeTax;
        bill.LaborDuty = dto.LaborDuty ?? bill.LaborDuty;
        bill.AmountInWords = dto.AmountInWords ?? bill.AmountInWords;

        // Auto-fill budget figures from BudgetEntry if still zero and client didn't explicitly set them.
        await ApplyBudgetDefaultsFromEntryAsync(
            bill,
            shouldFillBudgetAllotment: !dto.BudgetAllotment.HasValue,
            shouldFillTotalPreviousBills: !dto.TotalPreviousBills.HasValue);

        // Recalculate derived totals server-side
        RecalculateBill(bill);

        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(bill);
    }

    [HttpPost("contingent-bills/{id}/approve")]
    [Authorize]
    public async Task<ActionResult<ContingentBill>> ApproveContingentBill(int id, [FromBody] ApprovalDto dto)
    {
        var bill = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null)
            return NotFound();

        // Ensure totals are up-to-date before any deductions/schedule creation
        RecalculateBill(bill);

        // Handle different approval types
        switch (dto.ApprovalType?.ToLower())
        {
            case "medical_superintendent":
                bill.MedicalSuperintendentApproved = true;
                bill.MedicalSuperintendentApprovalDate = DateTime.UtcNow;
                break;
            case "executive_director":
                bill.ExecutiveDirectorApproved = true;
                bill.ExecutiveDirectorApprovalDate = DateTime.UtcNow;
                break;
            case "pre_audit":
                bill.PreAuditPassed = true;
                bill.PreAuditDate = DateTime.UtcNow;
                break;
        }

        // If all approvals are complete, mark as approved and deduct from budget
        if (bill.MedicalSuperintendentApproved && bill.ExecutiveDirectorApproved && bill.PreAuditPassed)
        {
            bill.Status = "Approved";

            // Deduct from budget expenditure
            if (bill.ObjectCodeId.HasValue && bill.FiscalYearId.HasValue)
            {
                var budgetEntry = await _context.BudgetEntries
                    .FirstOrDefaultAsync(be =>
                        be.ObjectCodeId == bill.ObjectCodeId.Value &&
                        be.FiscalYearId == bill.FiscalYearId.Value);

                if (budgetEntry != null)
                {
                    budgetEntry.AAAExpenditure += bill.NetPayment;
                    budgetEntry.CalculateTotals();
                    budgetEntry.UpdatedAt = DateTime.UtcNow;

                    // Create expense history record
                    var expenseHistory = new ExpenseHistory
                    {
                        BudgetEntryId = budgetEntry.Id,
                        ExpenseName = $"Contingent Bill: {bill.BillNumber}",
                        Amount = bill.NetPayment,
                        BudgetType = "AAA",
                        Description = $"Supplier: {bill.SupplierName}, Tender: {bill.TenderTitle}",
                        ExpenseDate = DateTime.UtcNow,
                        CreatedById = GetCurrentUserId()
                    };
                    _context.ExpenseHistories.Add(expenseHistory);
                }
            }

            // Schedule of Payment is created manually by Account Officer via batch selection.
        }

        bill.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(bill);
    }

    [HttpPost("contingent-bills/{id}/reject")]
    [Authorize]
    public async Task<ActionResult<ContingentBill>> RejectContingentBill(int id, [FromBody] RejectDto dto)
    {
        var bill = await _context.ContingentBills.FindAsync(id);
        if (bill == null)
            return NotFound();

        bill.Status = "Rejected";
        bill.DisallowanceReason = dto.Reason;
        bill.AmountLessDrawn = dto.AmountLessDrawn ?? 0;
        bill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(bill);
    }

    [HttpPost("schedule-of-payments/batch")]
    [Authorize]
    public async Task<ActionResult<ScheduleOfPayment>> CreateScheduleOfPaymentBatch([FromBody] ScheduleBatchDto dto)
    {
        if (dto.BillIds == null || dto.BillIds.Count == 0)
            return BadRequest(new { message = "No bills selected." });

        var bills = await _context.ContingentBills
            .Include(b => b.ObjectCode)
            .Where(b => dto.BillIds.Contains(b.Id))
            .ToListAsync();

        if (bills.Count != dto.BillIds.Count)
            return BadRequest(new { message = "One or more bills not found." });

        if (bills.Any(b => b.Status != "Approved"))
            return BadRequest(new { message = "All bills must be Approved before scheduling payments." });

        var firstBill = bills.First();
        var totalGross = bills.Sum(b => b.GrandTotal);
        var totalStamp = bills.Sum(b => b.StampDuty);
        var totalIncomeTax = bills.Sum(b => b.IncomeTax);
        var totalGst = bills.Sum(b => b.GST);
        var totalNet = bills.Sum(b => b.NetPayment);

        var billNumbers = string.Join(", ", bills.Select(b => b.BillNumber));

        var createdById = GetCurrentUserId();

        var scheduleOfPayment = new ScheduleOfPayment
        {
            ContingentBillId = firstBill.Id,
            SheetNumber = 1,
            SerialNumber = 1,
            BillMonth = DateTime.Now.ToString("MMMM yyyy"),
            PaymentDate = DateTime.UtcNow,
            Particulars = $"Batch Bills: {billNumbers}",
            HeadCode = firstBill.HeadCode,
            GrossAmount = totalGross,
            StampDuty = totalStamp,
            IncomeTax = totalIncomeTax,
            GST = totalGst,
            NetAmount = totalNet,
            Status = "Pending",
            CreatedById = createdById > 0 ? createdById : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.ScheduleOfPayments.Add(scheduleOfPayment);
        await _context.SaveChangesAsync();

        return Ok(scheduleOfPayment);
    }

    // ==================== Schedule of Payments ====================

    [HttpGet("schedule-of-payments")]
    [Authorize]
    public async Task<ActionResult<List<ScheduleOfPayment>>> GetScheduleOfPayments()
    {
        var schedules = await _context.ScheduleOfPayments
            .Include(s => s.ContingentBill)
            .Include(s => s.CreatedBy)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(schedules);
    }

    [HttpGet("schedule-of-payments/{id}")]
    [Authorize]
    public async Task<ActionResult<ScheduleOfPayment>> GetScheduleOfPayment(int id)
    {
        var schedule = await _context.ScheduleOfPayments
            .Include(s => s.ContingentBill)
            .Include(s => s.CreatedBy)
            .Include(s => s.AsaanCheques)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (schedule == null)
            return NotFound();

        return Ok(schedule);
    }

    [HttpPut("schedule-of-payments/{id}")]
    [Authorize]
    public async Task<ActionResult<ScheduleOfPayment>> UpdateScheduleOfPayment(int id, [FromBody] ScheduleOfPaymentUpdateDto dto)
    {
        var schedule = await _context.ScheduleOfPayments.FindAsync(id);
        if (schedule == null)
            return NotFound();

        schedule.BillMonth = dto.BillMonth ?? schedule.BillMonth;
        schedule.PaymentDate = dto.PaymentDate ?? schedule.PaymentDate;
        schedule.Particulars = dto.Particulars ?? schedule.Particulars;
        schedule.HeadCode = dto.HeadCode ?? schedule.HeadCode;
        schedule.GrossAmount = dto.GrossAmount ?? schedule.GrossAmount;
        schedule.StampDuty = dto.StampDuty ?? schedule.StampDuty;
        schedule.IncomeTax = dto.IncomeTax ?? schedule.IncomeTax;
        schedule.GST = dto.GST ?? schedule.GST;
        schedule.PST = dto.PST ?? schedule.PST;
        schedule.NetAmount = dto.NetAmount ?? schedule.NetAmount;
        schedule.ChequeNumberAndDate = dto.ChequeNumberAndDate ?? schedule.ChequeNumberAndDate;
        schedule.ChequeAmount = dto.ChequeAmount ?? schedule.ChequeAmount;

        schedule.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(schedule);
    }

    [HttpPost("schedule-of-payments/{id}/approve")]
    [Authorize]
    public async Task<ActionResult<ScheduleOfPayment>> ApproveScheduleOfPayment(int id, [FromBody] ApprovalDto dto)
    {
        var schedule = await _context.ScheduleOfPayments
            .Include(s => s.ContingentBill)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (schedule == null)
            return NotFound();

        switch (dto.ApprovalType?.ToLower())
        {
            case "accountant":
                schedule.AccountantApproved = true;
                break;
            case "budget_officer":
                schedule.BudgetOfficerApproved = true;
                break;
            case "audit_officer":
                schedule.AuditOfficerApproved = true;
                break;
            case "accounts_officer":
                schedule.AccountsOfficerApproved = true;
                break;
            case "director_finance":
                schedule.DirectorFinanceApproved = true;
                break;
            case "executive_director":
                schedule.ExecutiveDirectorApproved = true;
                break;
        }

        // If all approvals are complete
        if (schedule.AccountantApproved && schedule.BudgetOfficerApproved &&
            schedule.AuditOfficerApproved && schedule.AccountsOfficerApproved &&
            schedule.DirectorFinanceApproved && schedule.ExecutiveDirectorApproved)
        {
            schedule.Status = "Approved";

            // Create pending Asaan Cheque
            var asaanCheque = new AsaanCheque
            {
                ScheduleOfPaymentId = schedule.Id,
                SheetNumber = 2,
                ScheduleSerialNumber = await _context.AsaanCheques.CountAsync() + 1,
                ScheduleDate = DateTime.UtcNow,
                DDOName = "Executive Director & Rawalpindi Institute of Cardiology, Rawalpindi",
                DepartmentName = "Rawalpindi Institute of Cardiology",
                AsaanAccountTitle = "Executive Director RIC",
                CostCentre = "RI-4546",
                ProjectDescription = "Rawalpindi Institute of Cardiology, Rawalpindi",
                SubDetailedFunction = "073101-General Hospital Services",
                GrantNumber = "PC21016(076)",
                PayeeName = schedule.ContingentBill?.SupplierName,
                Amount = schedule.NetAmount,
                ObjectCodeDetail = schedule.HeadCode,
                Status = "Pending",
                CreatedById = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow
            };
            _context.AsaanCheques.Add(asaanCheque);
        }

        schedule.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(schedule);
    }

    // ==================== Asaan Cheques ====================

    [HttpGet("asaan-cheques")]
    [Authorize]
    public async Task<ActionResult<List<AsaanCheque>>> GetAsaanCheques()
    {
        var cheques = await _context.AsaanCheques
            .Include(c => c.ScheduleOfPayment)
                .ThenInclude(s => s.ContingentBill)
            .Include(c => c.CreatedBy)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(cheques);
    }

    [HttpGet("asaan-cheques/{id}")]
    [Authorize]
    public async Task<ActionResult<AsaanCheque>> GetAsaanCheque(int id)
    {
        var cheque = await _context.AsaanCheques
            .Include(c => c.ScheduleOfPayment)
                .ThenInclude(s => s.ContingentBill)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cheque == null)
            return NotFound();

        return Ok(cheque);
    }

    [HttpPut("asaan-cheques/{id}")]
    [Authorize]
    public async Task<ActionResult<AsaanCheque>> UpdateAsaanCheque(int id, [FromBody] AsaanChequeUpdateDto dto)
    {
        var cheque = await _context.AsaanCheques.FindAsync(id);
        if (cheque == null)
            return NotFound();

        cheque.DDOName = dto.DDOName ?? cheque.DDOName;
        cheque.DepartmentName = dto.DepartmentName ?? cheque.DepartmentName;
        cheque.AsaanAccountTitle = dto.AsaanAccountTitle ?? cheque.AsaanAccountTitle;
        cheque.AsaanAccountNumber = dto.AsaanAccountNumber ?? cheque.AsaanAccountNumber;
        cheque.CostCentre = dto.CostCentre ?? cheque.CostCentre;
        cheque.ProjectDescription = dto.ProjectDescription ?? cheque.ProjectDescription;
        cheque.SubDetailedFunction = dto.SubDetailedFunction ?? cheque.SubDetailedFunction;
        cheque.GrantNumber = dto.GrantNumber ?? cheque.GrantNumber;
        cheque.ChequeNumber = dto.ChequeNumber ?? cheque.ChequeNumber;
        cheque.ChequeDate = dto.ChequeDate ?? cheque.ChequeDate;
        cheque.PayeeName = dto.PayeeName ?? cheque.PayeeName;
        cheque.Amount = dto.Amount ?? cheque.Amount;
        cheque.ObjectCodeDetail = dto.ObjectCodeDetail ?? cheque.ObjectCodeDetail;
        cheque.CertificateConfirmed = dto.CertificateConfirmed ?? cheque.CertificateConfirmed;

        cheque.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(cheque);
    }

    [HttpPost("asaan-cheques/{id}/approve")]
    [Authorize]
    public async Task<ActionResult<AsaanCheque>> ApproveAsaanCheque(int id, [FromBody] ApprovalDto dto)
    {
        var cheque = await _context.AsaanCheques
            .Include(c => c.ScheduleOfPayment)
                .ThenInclude(s => s.ContingentBill)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cheque == null)
            return NotFound();

        switch (dto.ApprovalType?.ToLower())
        {
            case "director_finance":
                cheque.DirectorFinanceApproved = true;
                cheque.DirectorFinanceApprovalDate = DateTime.UtcNow;
                break;
            case "executive_director":
                cheque.ExecutiveDirectorApproved = true;
                cheque.ExecutiveDirectorApprovalDate = DateTime.UtcNow;
                break;
        }

        if (cheque.DirectorFinanceApproved && cheque.ExecutiveDirectorApproved)
        {
            cheque.Status = "Approved";
        }

        cheque.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Finance -> eProc callback: finalize sending Letter of Award after Asaan Cheque is fully approved.
        // This is best-effort and idempotent on the eProc side (it will no-op if already sent).
        if (cheque.Status == "Approved")
        {
            try
            {
                var contingentBill = cheque.ScheduleOfPayment?.ContingentBill;
                var eprocTenderId = contingentBill?.EprocTenderId;
                var loaNumber = contingentBill?.LetterOfAwardNumber;

                var baseUrl = _configuration["Eproc:BaseUrl"]?.TrimEnd('/');
                var token = _configuration["Eproc:CallbackToken"];

                if (!string.IsNullOrWhiteSpace(baseUrl) && !string.IsNullOrWhiteSpace(token) &&
                    eprocTenderId.HasValue && !string.IsNullOrWhiteSpace(loaNumber))
                {
                    using var http = new HttpClient();
                    http.Timeout = TimeSpan.FromSeconds(10);

                    var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/letters/award/finalize-from-finance");
                    req.Headers.Add("x-finance-token", token);
                    req.Content = JsonContent.Create(new
                    {
                        tenderId = eprocTenderId.Value,
                        letterOfAwardNumber = loaNumber
                    });

                    var resp = await http.SendAsync(req);
                    if (!resp.IsSuccessStatusCode)
                    {
                        var body = await resp.Content.ReadAsStringAsync();
                        Response.Headers["X-Eproc-Notify"] = $"failed:{(int)resp.StatusCode}";
                        Console.WriteLine($"eProc callback failed: {(int)resp.StatusCode} {body}");
                    }
                    else
                    {
                        Response.Headers["X-Eproc-Notify"] = "ok";
                    }
                }
                else
                {
                    Response.Headers["X-Eproc-Notify"] = "skipped";
                }
            }
            catch (Exception ex)
            {
                Response.Headers["X-Eproc-Notify"] = "error";
                Console.WriteLine($"eProc callback error: {ex.Message}");
            }
        }

        return Ok(cheque);
    }

    [HttpPost("asaan-cheques/{id}/forward")]
    [Authorize]
    public async Task<ActionResult<AsaanCheque>> ForwardAsaanCheque(int id, [FromBody] ForwardDto dto)
    {
        var cheque = await _context.AsaanCheques.FindAsync(id);
        if (cheque == null)
            return NotFound();

        cheque.Status = "Forwarded";
        cheque.ForwardedToBank = dto.BankDetails;
        cheque.ReferenceNumber = dto.ReferenceNumber;
        cheque.ForwardedDate = DateTime.UtcNow;

        cheque.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(cheque);
    }
}

// ==================== DTOs ====================

public class EprocContingentBillDto
{
    public int TenderId { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? LetterOfAwardNumber { get; set; }
    public decimal TotalAmount { get; set; }
}

public class ContingentBillCreateDto
{
    public DateTime? BillDate { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? LetterOfAwardNumber { get; set; }
    public int? ObjectCodeId { get; set; }
    public int? FiscalYearId { get; set; }
    public string? HeadCode { get; set; }
    public string? HeadTitle { get; set; }
    public decimal BudgetAllotment { get; set; }
    public decimal AmountOfBill { get; set; }
    public decimal TotalPreviousBills { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal StampDuty { get; set; }
    public decimal GST { get; set; }
    public decimal IncomeTax { get; set; }
    public decimal LaborDuty { get; set; }
    public decimal NetPayment { get; set; }
    public string? AmountInWords { get; set; }
}

public class ContingentBillUpdateDto
{
    public DateTime? BillDate { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? LetterOfAwardNumber { get; set; }
    public int? ObjectCodeId { get; set; }
    public int? FiscalYearId { get; set; }
    public string? HeadCode { get; set; }
    public string? HeadTitle { get; set; }
    public decimal? BudgetAllotment { get; set; }
    public decimal? AmountOfBill { get; set; }
    public decimal? TotalPreviousBills { get; set; }
    public decimal? GrandTotal { get; set; }
    public decimal? StampDuty { get; set; }
    public decimal? GST { get; set; }
    public decimal? IncomeTax { get; set; }
    public decimal? LaborDuty { get; set; }
    public decimal? NetPayment { get; set; }
    public string? AmountInWords { get; set; }
}

public class ApprovalDto
{
    public string? ApprovalType { get; set; }
}

public class ScheduleBatchDto
{
    public List<int> BillIds { get; set; } = new();
}

public class RejectDto
{
    public string? Reason { get; set; }
    public decimal? AmountLessDrawn { get; set; }
}

public class ScheduleOfPaymentUpdateDto
{
    public string? BillMonth { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Particulars { get; set; }
    public string? HeadCode { get; set; }
    public decimal? GrossAmount { get; set; }
    public decimal? StampDuty { get; set; }
    public decimal? IncomeTax { get; set; }
    public decimal? GST { get; set; }
    public decimal? PST { get; set; }
    public decimal? NetAmount { get; set; }
    public string? ChequeNumberAndDate { get; set; }
    public decimal? ChequeAmount { get; set; }
}

public class AsaanChequeUpdateDto
{
    public string? DDOName { get; set; }
    public string? DepartmentName { get; set; }
    public string? AsaanAccountTitle { get; set; }
    public string? AsaanAccountNumber { get; set; }
    public string? CostCentre { get; set; }
    public string? ProjectDescription { get; set; }
    public string? SubDetailedFunction { get; set; }
    public string? GrantNumber { get; set; }
    public string? ChequeNumber { get; set; }
    public DateTime? ChequeDate { get; set; }
    public string? PayeeName { get; set; }
    public decimal? Amount { get; set; }
    public string? ObjectCodeDetail { get; set; }
    public bool? CertificateConfirmed { get; set; }
}

public class ForwardDto
{
    public string? BankDetails { get; set; }
    public string? ReferenceNumber { get; set; }
}
