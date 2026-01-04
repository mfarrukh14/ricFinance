using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using RICFinance.API.Data;

namespace RICFinance.API.Services;

public interface IReportService
{
    Task<(byte[] Content, string FileName)> GenerateConsolidatedBudgetReportAsync(int? fiscalYearId);
}

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(byte[] Content, string FileName)> GenerateConsolidatedBudgetReportAsync(int? fiscalYearId)
    {
        var fiscalYear = fiscalYearId.HasValue
            ? await _context.FiscalYears.AsNoTracking().FirstOrDefaultAsync(f => f.Id == fiscalYearId.Value)
            : await _context.FiscalYears.AsNoTracking().FirstOrDefaultAsync(f => f.IsCurrent);

        if (fiscalYear == null)
            throw new InvalidOperationException("Fiscal year not found.");

        var objectCodes = await _context.ObjectCodes
            .AsNoTracking()
            .Where(o => o.IsActive)
            .OrderBy(o => o.Code)
            .Select(o => new { o.Id, o.Code, o.HeadOfAccount })
            .ToListAsync();

        var entries = await _context.BudgetEntries
            .AsNoTracking()
            .Where(e => e.FiscalYearId == fiscalYear.Id)
            .OrderByDescending(e => e.UpdatedAt ?? e.CreatedAt)
            .ToListAsync();

        // Prefer one row per object code; pick the newest entry if duplicates exist.
        var latestByObjectCodeId = new Dictionary<int, Models.BudgetEntry>();
        foreach (var e in entries)
        {
            if (!latestByObjectCodeId.ContainsKey(e.ObjectCodeId))
                latestByObjectCodeId[e.ObjectCodeId] = e;
        }

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Finance");

        // Column layout (1-based):
        // 1 Sr. No.
        // 2 Object Code
        // 3 Head of Account
        // 4..20 Non development Budget
        // 21..26 PLA Budget
        // 27..32 UHI Budget
        // 33..35 Consolidated Budget
        const int totalColumns = 35;

        // Row 1: Finance (merged)
        ws.Range(1, 1, 1, totalColumns).Merge().Value = "Finance";
        ws.Row(1).Height = 22;

        // Row 2: Group headers
        ws.Range(2, 4, 2, 20).Merge().Value = "Non development Budget";
        ws.Range(2, 21, 2, 26).Merge().Value = "PLA Budget";
        ws.Range(2, 27, 2, 32).Merge().Value = "UHI Budget";
        ws.Range(2, 33, 2, 35).Merge().Value = "Consolidated Budget";
        ws.Row(2).Height = 18;

        // Row 3: Consolidated subheader
        ws.Cell(3, 33).Value = "AAA+PLA+UHI";
        ws.Cell(3, 34).Value = "AAA+PLA+UHI";
        ws.Cell(3, 35).Value = "AAA+PLA+UHI";
        ws.Row(3).Height = 18;

        // Row 4: Column headers
        var headers = new (int Col, string Text)[]
        {
            (1, "Sr. No."),
            (2, "Object Code"),
            (3, "Head of Account"),

            // Non development (AAA)
            (4, "Total Budget Allocation"),
            (5, "First Released"),
            (6, "2nd released"),
            (7, "3rd released"),
            (8, "4th released"),
            (9, "Additional/  Supplementary budget"),
            (10, "Sum of released"),
            (11, "Excess  (1st Statement)"),
            (12, "Surrender (1st Statement)"),
            (13, "Re-aap(+)"),
            (14, "Re-aap(-)"),
            (15, "Budget withheld"),
            (16, "Excess  (2nd Statement)"),
            (17, "Surrender (2nd Statement)"),
            (18, "Total AAA  budget"),
            (19, "AAA expenditure"),
            (20, "Remaining Budget"),

            // PLA
            (21, "Budget Allocated"),
            (22, "Re-app (+)"),
            (23, "Re-app (-)"),
            (24, "Total Budget"),
            (25, "PLA Expenditure"),
            (26, "Remaning PLA Budget"),

            // UHI
            (27, "Budget Allocated"),
            (28, "Re-app (+)"),
            (29, "Re-app (-)"),
            (30, "Total Budget"),
            (31, "UHI  Expenditure"),
            (32, "Remaning UHI Budget"),

            // Consolidated
            (33, "Total Budget"),
            (34, "Total Expenditure"),
            (35, "Remaining Budget"),
        };

        foreach (var (col, text) in headers)
            ws.Cell(4, col).Value = text;

        ws.Row(4).Height = 36;

        // Styles for header rows (approx. like the provided template)
        var headerFill = XLColor.FromHtml("#F4B183");
        ws.Range(1, 1, 3, totalColumns).Style.Fill.BackgroundColor = headerFill;
        ws.Range(1, 1, 4, totalColumns).Style.Font.Bold = true;
        ws.Range(1, 1, 4, totalColumns).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Range(1, 1, 4, totalColumns).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        ws.Range(4, 1, 4, totalColumns).Style.Alignment.WrapText = true;

        // Freeze header rows
        ws.SheetView.FreezeRows(4);

        // Data rows
        var row = 5;
        var sr = 1;

        foreach (var oc in objectCodes)
        {
            latestByObjectCodeId.TryGetValue(oc.Id, out var entry);

            WriteRow(ws, row++, sr++, oc.Code, oc.HeadOfAccount, entry);
        }

        // Borders + formatting
        var used = ws.RangeUsed();
        if (used != null)
        {
            used.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            used.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            used.SetAutoFilter();
        }

        ws.Column(1).Width = 7;
        ws.Column(2).Width = 14;
        ws.Column(3).Width = 38;
        ws.Columns(4, totalColumns).Width = 14;
        ws.Column(3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        ws.Columns(4, totalColumns).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Columns(4, totalColumns).Style.NumberFormat.Format = "#,##0.00";

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var safeFy = string.Join("_", fiscalYear.Year.Split(Path.GetInvalidFileNameChars()));
        var fileName = $"ConsolidatedBudgetReport_{safeFy}_{DateTime.UtcNow:yyyy-MM-dd}.xlsx";

        return (stream.ToArray(), fileName);
    }

    private static void WriteRow(IXLWorksheet ws, int row, int srNo, string code, string head, Models.BudgetEntry? entry)
    {
        void Set(int col, decimal value) => ws.Cell(row, col).Value = value;
        void SetDash(int col) => ws.Cell(row, col).Value = "-";

        ws.Cell(row, 1).Value = srNo;
        ws.Cell(row, 2).Value = code;
        ws.Cell(row, 3).Value = head;

        if (entry == null)
        {
            for (var col = 4; col <= 35; col++)
                SetDash(col);
            return;
        }

        // Non development Budget (AAA)
        Set(4, entry.TotalBudgetAllocation);
        Set(5, entry.FirstReleased);
        Set(6, entry.SecondReleased);
        Set(7, entry.ThirdReleased);
        Set(8, entry.FourthReleased);
        Set(9, entry.SupplementaryBudget);
        Set(10, entry.SumOfReleased);
        Set(11, entry.ExcessReallocation);
        Set(12, entry.AdditionalSurrender);
        Set(13, entry.AAAReApp);
        SetDash(14); // No separate (-) field in the current model
        Set(15, entry.BudgetWithheldLapse);
        SetDash(16); // Not available
        SetDash(17); // Not available
        Set(18, entry.TotalAAABudget);
        Set(19, entry.AAAExpenditure);
        Set(20, entry.AAARemainingBudget);

        // PLA Budget
        Set(21, entry.PLABudgetAllocated);
        Set(22, entry.PLAReApp);
        SetDash(23);
        Set(24, entry.PLATotalBudget);
        Set(25, entry.PLAExpenditure);
        Set(26, entry.PLARemainingBudget);

        // UHI Budget
        Set(27, entry.UHIBudgetAllocated);
        Set(28, entry.UHIReApp);
        SetDash(29);
        Set(30, entry.UHITotalBudget);
        Set(31, entry.UHIExpenditure);
        Set(32, entry.UHIRemainingBudget);

        // Consolidated
        Set(33, entry.ConsolidatedTotalBudget);
        Set(34, entry.ConsolidatedTotalExpenditure);
        Set(35, entry.ConsolidatedRemainingBudget);
    }
}
