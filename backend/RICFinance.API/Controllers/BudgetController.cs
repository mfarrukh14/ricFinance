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
        var objectCode = await _budgetService.CreateObjectCodeAsync(dto);
        return CreatedAtAction(nameof(GetObjectCode), new { id = objectCode.Id }, objectCode);
    }

    [HttpPut("object-codes/{id}")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<ActionResult<ObjectCodeDto>> UpdateObjectCode(int id, [FromBody] UpdateObjectCodeDto dto)
    {
        var objectCode = await _budgetService.UpdateObjectCodeAsync(id, dto);
        if (objectCode == null)
            return NotFound();

        return Ok(objectCode);
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
