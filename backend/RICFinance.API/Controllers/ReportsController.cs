using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RICFinance.API.Services;

namespace RICFinance.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("consolidated-budget")]
    [Authorize(Roles = "Admin,FinanceOfficer")]
    public async Task<IActionResult> GetConsolidatedBudgetReport([FromQuery] int? fiscalYearId)
    {
        try
        {
            var (content, fileName) = await _reportService.GenerateConsolidatedBudgetReportAsync(fiscalYearId);
            return File(
                fileContents: content,
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileDownloadName: fileName);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
