using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RICFinance.API.DTOs;
using RICFinance.API.Services;

namespace RICFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    #region Object Codes

    [HttpGet("object-codes")]
    public async Task<ActionResult<List<ObjectCodeDto>>> GetObjectCodes()
    {
        var objectCodes = await _budgetService.GetAllObjectCodesAsync();
        return Ok(objectCodes);
    }

    [HttpGet("object-codes/{id}")]
    public async Task<ActionResult<ObjectCodeDto>> GetObjectCode(int id)
    {
        var objectCode = await _budgetService.GetObjectCodeByIdAsync(id);
        if (objectCode == null)
            return NotFound();

        return Ok(objectCode);
    }

    [HttpPost("object-codes")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ObjectCodeDto>> CreateObjectCode([FromBody] CreateObjectCodeDto dto)
    {
        try
        {
            var objectCode = await _budgetService.CreateObjectCodeAsync(dto);
            return CreatedAtAction(nameof(GetObjectCode), new { id = objectCode.Id }, objectCode);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

    }

    [HttpPut("object-codes/{id}")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ObjectCodeDto>> UpdateObjectCode(int id, [FromBody] UpdateObjectCodeDto dto)
    {
        try
        {
            var objectCode = await _budgetService.UpdateObjectCodeAsync(id, dto);
            if (objectCode == null)
                return NotFound();

            return Ok(objectCode);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("object-codes/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteObjectCode(int id)
    {
        var result = await _budgetService.DeleteObjectCodeAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("object-codes/import")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ObjectCodeImportResultDto>> ImportObjectCodes([FromBody] ObjectCodeImportRequestDto request)
    {
        var result = await _budgetService.ImportObjectCodesAsync(request);
        return Ok(result);
    }

    #endregion

    #region Object Code Levels

    [HttpGet("object-code-levels")]
    public async Task<ActionResult<List<ObjectCodeLevelDto>>> GetObjectCodeLevels()
    {
        var levels = await _budgetService.GetAllObjectCodeLevelsAsync();
        return Ok(levels);
    }

    [HttpPost("object-code-levels")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ObjectCodeLevelDto>> CreateObjectCodeLevel([FromBody] CreateObjectCodeLevelDto dto)
    {
        try
        {
            var level = await _budgetService.CreateObjectCodeLevelAsync(dto);
            return CreatedAtAction(nameof(GetObjectCodeLevels), level);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("object-code-levels/{id}")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ObjectCodeLevelDto>> UpdateObjectCodeLevel(int id, [FromBody] UpdateObjectCodeLevelDto dto)
    {
        try
        {
            var level = await _budgetService.UpdateObjectCodeLevelAsync(id, dto);
            if (level == null)
                return NotFound();

            return Ok(level);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("object-code-levels/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteObjectCodeLevel(int id)
    {
        try
        {
            var result = await _budgetService.DeleteObjectCodeLevelAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Fiscal Years

    [HttpGet("fiscal-years")]
    public async Task<ActionResult<List<FiscalYearDto>>> GetFiscalYears()
    {
        var fiscalYears = await _budgetService.GetAllFiscalYearsAsync();
        return Ok(fiscalYears);
    }

    [HttpGet("fiscal-years/current")]
    public async Task<ActionResult<FiscalYearDto>> GetCurrentFiscalYear()
    {
        var fiscalYear = await _budgetService.GetCurrentFiscalYearAsync();
        if (fiscalYear == null)
            return NotFound();

        return Ok(fiscalYear);
    }

    [HttpPost("fiscal-years")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FiscalYearDto>> CreateFiscalYear([FromBody] CreateFiscalYearDto dto)
    {
        var fiscalYear = await _budgetService.CreateFiscalYearAsync(dto);
        return CreatedAtAction(nameof(GetCurrentFiscalYear), fiscalYear);
    }

    [HttpPut("fiscal-years/{id}/set-current")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FiscalYearDto>> SetCurrentFiscalYear(int id)
    {
        var fiscalYear = await _budgetService.SetCurrentFiscalYearAsync(id);
        if (fiscalYear == null)
            return NotFound();

        return Ok(fiscalYear);
    }

    #endregion

    #region Budget Entries

    [HttpGet("entries")]
    public async Task<ActionResult<List<BudgetEntryDto>>> GetBudgetEntries([FromQuery] int? fiscalYearId)
    {
        var entries = await _budgetService.GetAllBudgetEntriesAsync(fiscalYearId);
        return Ok(entries);
    }

    [HttpGet("entries/{id}")]
    public async Task<ActionResult<BudgetEntryDto>> GetBudgetEntry(int id)
    {
        var entry = await _budgetService.GetBudgetEntryByIdAsync(id);
        if (entry == null)
            return NotFound();

        return Ok(entry);
    }

    [HttpPost("entries")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<BudgetEntryDto>> CreateBudgetEntry([FromBody] CreateBudgetEntryDto dto)
    {
        var entry = await _budgetService.CreateBudgetEntryAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetBudgetEntry), new { id = entry.Id }, entry);
    }

    [HttpPut("entries/{id}")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<BudgetEntryDto>> UpdateBudgetEntry(int id, [FromBody] UpdateBudgetEntryDto dto)
    {
        var entry = await _budgetService.UpdateBudgetEntryAsync(id, dto, GetUserId());
        if (entry == null)
            return NotFound();

        return Ok(entry);
    }

    [HttpDelete("entries/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteBudgetEntry(int id)
    {
        var result = await _budgetService.DeleteBudgetEntryAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPut("entries/{id}/releases")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<BudgetEntryDto>> UpdateReleases(int id, [FromBody] UpdateReleasesDto dto)
    {
        var entry = await _budgetService.UpdateReleasesAsync(id, dto, GetUserId());
        if (entry == null)
            return NotFound();

        return Ok(entry);
    }

    [HttpGet("entries/{id}/expenses")]
    public async Task<ActionResult<List<ExpenseHistoryDto>>> GetExpenseHistory(int id)
    {
        var expenses = await _budgetService.GetExpenseHistoryAsync(id);
        return Ok(expenses);
    }

    [HttpPost("entries/{id}/expenses")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ExpenseHistoryDto>> AddExpense(int id, [FromBody] CreateExpenseDto dto)
    {
        try
        {
            dto.BudgetEntryId = id;
            var expense = await _budgetService.AddExpenseAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetExpenseHistory), new { id }, expense);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Dashboard

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] int? fiscalYearId)
    {
        var summary = await _budgetService.GetDashboardSummaryAsync(fiscalYearId);
        return Ok(summary);
    }

    #endregion
}
