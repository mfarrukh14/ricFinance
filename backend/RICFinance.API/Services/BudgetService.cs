using Microsoft.EntityFrameworkCore;
using RICFinance.API.Data;
using RICFinance.API.DTOs;
using RICFinance.API.Models;
using System.Text.RegularExpressions;

namespace RICFinance.API.Services;

public interface IBudgetService
{
    // Object Codes
    Task<List<ObjectCodeDto>> GetAllObjectCodesAsync();
    Task<ObjectCodeDto?> GetObjectCodeByIdAsync(int id);
    Task<ObjectCodeDto> CreateObjectCodeAsync(CreateObjectCodeDto dto);
    Task<ObjectCodeDto?> UpdateObjectCodeAsync(int id, UpdateObjectCodeDto dto);
    Task<bool> DeleteObjectCodeAsync(int id);

    Task<ObjectCodeImportResultDto> ImportObjectCodesAsync(ObjectCodeImportRequestDto request);

    // Object Code Levels
    Task<List<ObjectCodeLevelDto>> GetAllObjectCodeLevelsAsync();
    Task<ObjectCodeLevelDto> CreateObjectCodeLevelAsync(CreateObjectCodeLevelDto dto);
    Task<ObjectCodeLevelDto?> UpdateObjectCodeLevelAsync(int id, UpdateObjectCodeLevelDto dto);
    Task<bool> DeleteObjectCodeLevelAsync(int id);

    // Fiscal Years
    Task<List<FiscalYearDto>> GetAllFiscalYearsAsync();
    Task<FiscalYearDto?> GetCurrentFiscalYearAsync();
    Task<FiscalYearDto> CreateFiscalYearAsync(CreateFiscalYearDto dto);
    Task<FiscalYearDto?> SetCurrentFiscalYearAsync(int id);

    // Budget Entries
    Task<List<BudgetEntryDto>> GetAllBudgetEntriesAsync(int? fiscalYearId = null);
    Task<BudgetEntryDto?> GetBudgetEntryByIdAsync(int id);
    Task<BudgetEntryDto> CreateBudgetEntryAsync(CreateBudgetEntryDto dto, int userId);
    Task<BudgetEntryDto?> UpdateBudgetEntryAsync(int id, UpdateBudgetEntryDto dto, int userId);
    Task<bool> DeleteBudgetEntryAsync(int id);
    
    // Releases
    Task<BudgetEntryDto?> UpdateReleasesAsync(int budgetEntryId, UpdateReleasesDto dto, int userId);
    
    // Expense History
    Task<List<ExpenseHistoryDto>> GetExpenseHistoryAsync(int budgetEntryId);
    Task<ExpenseHistoryDto> AddExpenseAsync(CreateExpenseDto dto, int userId);

    // Dashboard
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? fiscalYearId = null);
}

public class BudgetService : IBudgetService
{
    private readonly ApplicationDbContext _context;

    public BudgetService(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Object Codes

    public async Task<List<ObjectCodeDto>> GetAllObjectCodesAsync()
    {
        return await _context.ObjectCodes
            .Include(o => o.Level)
            .Where(o => o.IsActive)
            .OrderBy(o => o.Code)
            .Select(o => new ObjectCodeDto
            {
                Id = o.Id,
                Code = o.Code,
                HeadOfAccount = o.HeadOfAccount,
                Description = o.Description,
                IsActive = o.IsActive,
                LevelId = o.LevelId,
                LevelName = o.Level != null ? o.Level.Name : null
            })
            .ToListAsync();
    }

    public async Task<ObjectCodeDto?> GetObjectCodeByIdAsync(int id)
    {
        var obj = await _context.ObjectCodes
            .Include(o => o.Level)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (obj == null) return null;

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive,
            LevelId = obj.LevelId,
            LevelName = obj.Level != null ? obj.Level.Name : null
        };
    }

    public async Task<ObjectCodeDto> CreateObjectCodeAsync(CreateObjectCodeDto dto)
    {
        if (dto.LevelId.HasValue)
        {
            var levelExists = await _context.ObjectCodeLevels.AnyAsync(l => l.Id == dto.LevelId.Value && l.IsActive);
            if (!levelExists)
                throw new InvalidOperationException("Selected level does not exist.");
        }

        var obj = new ObjectCode
        {
            Code = dto.Code,
            HeadOfAccount = dto.HeadOfAccount,
            Description = dto.Description,
            LevelId = dto.LevelId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.ObjectCodes.Add(obj);
        await _context.SaveChangesAsync();

        await _context.Entry(obj).Reference(o => o.Level).LoadAsync();

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive,
            LevelId = obj.LevelId,
            LevelName = obj.Level != null ? obj.Level.Name : null
        };
    }

    public async Task<ObjectCodeDto?> UpdateObjectCodeAsync(int id, UpdateObjectCodeDto dto)
    {
        var obj = await _context.ObjectCodes
            .Include(o => o.Level)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (obj == null) return null;

        if (dto.Code != null) obj.Code = dto.Code;
        if (dto.HeadOfAccount != null) obj.HeadOfAccount = dto.HeadOfAccount;
        if (dto.Description != null) obj.Description = dto.Description;
        if (dto.LevelId.HasValue)
        {
            var levelExists = await _context.ObjectCodeLevels.AnyAsync(l => l.Id == dto.LevelId.Value && l.IsActive);
            if (!levelExists)
                throw new InvalidOperationException("Selected level does not exist.");
            obj.LevelId = dto.LevelId.Value;
        }
        if (dto.IsActive.HasValue) obj.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        await _context.Entry(obj).Reference(o => o.Level).LoadAsync();

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive,
            LevelId = obj.LevelId,
            LevelName = obj.Level != null ? obj.Level.Name : null
        };
    }

    public async Task<bool> DeleteObjectCodeAsync(int id)
    {
        var obj = await _context.ObjectCodes.FindAsync(id);
        if (obj == null) return false;

        obj.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ObjectCodeImportResultDto> ImportObjectCodesAsync(ObjectCodeImportRequestDto request)
    {
        var result = new ObjectCodeImportResultDto();

        if (string.IsNullOrWhiteSpace(request.Text))
        {
            result.Skipped = 1;
            result.Errors.Add("Import text is empty.");
            return result;
        }

        var rawLines = request.Text
            .Split(new[] { "\r\n", "\n", "\r" }, StringSplitOptions.None)
            .ToList();

        var lines = rawLines
            .Select(l => l?.TrimEnd() ?? string.Empty)
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .ToList();

        if (lines.Count == 0)
        {
            result.Skipped = 1;
            result.Errors.Add("No importable lines found.");
            return result;
        }

        var existingEntities = await _context.ObjectCodes.ToListAsync();
        var byCode = existingEntities
            .GroupBy(o => o.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        // Code token examples:
        // - A01, A01101, A0121N
        // - A011-1 (some sheets include hyphenated groupings)
        // - 001, 002, 037 (some are numeric)
        var codeAndNameRegex = new Regex(@"^([^\s,\t]+)\s+(.+)$", RegexOptions.Compiled);
        var codeOnlyRegex = new Regex(@"^[A-Za-z0-9][A-Za-z0-9-]*$", RegexOptions.Compiled);

        // Build parsed rows first so we can support continuation lines.
        var imported = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        string? lastCode = null;

        string NormalizeText(string value)
        {
            var v = value.Trim();
            if (v.StartsWith('"') && v.EndsWith('"') && v.Length >= 2)
                v = v.Substring(1, v.Length - 2);
            v = v.Replace('“', '"').Replace('”', '"').Trim();
            if (v.StartsWith('"')) v = v.TrimStart('"').Trim();
            if (v.EndsWith('"')) v = v.TrimEnd('"').Trim();
            return Regex.Replace(v, @"\s+", " ");
        }

        foreach (var lineRaw in lines)
        {
            var line = lineRaw.Trim();

            if (line.Equals("Object Code", StringComparison.OrdinalIgnoreCase) ||
                line.Equals("Head of Account", StringComparison.OrdinalIgnoreCase) ||
                line.StartsWith("Object Code\t", StringComparison.OrdinalIgnoreCase) ||
                line.StartsWith("Object Code,", StringComparison.OrdinalIgnoreCase))
            {
                result.Skipped++;
                continue;
            }

            string? code = null;
            string? head = null;

            // Prefer TSV (Excel copy/paste)
            var tsvParts = line.Split('\t', 2);
            if (tsvParts.Length == 2)
            {
                code = tsvParts[0].Trim();
                head = tsvParts[1].Trim();
            }
            else
            {
                // CSV fallback
                var csvParts = line.Split(',', 2);
                if (csvParts.Length == 2)
                {
                    code = csvParts[0].Trim();
                    head = csvParts[1].Trim();
                }
                else
                {
                    // Space-separated fallback
                    var match = codeAndNameRegex.Match(line);
                    if (match.Success)
                    {
                        code = match.Groups[1].Value.Trim();
                        head = match.Groups[2].Value.Trim();
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(head))
            {
                // If we couldn't parse but we have a previous code, treat this as a continuation line.
                if (lastCode != null)
                {
                    var append = NormalizeText(line);
                    if (append.Length > 0)
                    {
                        imported[lastCode] = imported[lastCode] + " " + append;
                        result.Updated++; // counts as enrichment of the parsed text
                    }
                    else
                    {
                        result.Skipped++;
                    }
                    continue;
                }

                result.Skipped++;
                result.Errors.Add($"Skipped: could not parse line '{line}'. Expected: CODE<TAB>HEAD or CODE,HEAD.");
                continue;
            }

            code = NormalizeText(code);
            head = NormalizeText(head);

            if (!codeOnlyRegex.IsMatch(code))
            {
                // If the code is invalid but we have a previous code, treat as continuation.
                if (lastCode != null)
                {
                    imported[lastCode] = imported[lastCode] + " " + NormalizeText(line);
                    result.Updated++;
                    continue;
                }

                result.Skipped++;
                result.Errors.Add($"Skipped: invalid code '{code}' on line '{line}'.");
                continue;
            }

            imported[code] = head;
            lastCode = code;
        }

        // Apply upserts
        foreach (var (code, head) in imported)
        {
            if (byCode.TryGetValue(code, out var existing))
            {
                var changed = false;

                if (!string.Equals(existing.HeadOfAccount, head, StringComparison.Ordinal))
                {
                    existing.HeadOfAccount = head;
                    changed = true;
                }

                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    changed = true;
                }

                if (changed)
                    result.Updated++;
                else
                    result.Skipped++;
            }
            else
            {
                var entity = new ObjectCode
                {
                    Code = code,
                    HeadOfAccount = head,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };
                _context.ObjectCodes.Add(entity);
                byCode[code] = entity;
                result.Created++;
            }
        }

        await _context.SaveChangesAsync();
        return result;
    }

    #endregion

    #region Object Code Levels

    public async Task<List<ObjectCodeLevelDto>> GetAllObjectCodeLevelsAsync()
    {
        return await _context.ObjectCodeLevels
            .Include(l => l.Parent)
            .Where(l => l.IsActive)
            .OrderBy(l => l.ParentId)
            .ThenBy(l => l.Name)
            .Select(l => new ObjectCodeLevelDto
            {
                Id = l.Id,
                Name = l.Name,
                ParentId = l.ParentId,
                ParentName = l.Parent != null ? l.Parent.Name : null,
                IsActive = l.IsActive
            })
            .ToListAsync();
    }

    public async Task<ObjectCodeLevelDto> CreateObjectCodeLevelAsync(CreateObjectCodeLevelDto dto)
    {
        if (dto.ParentId.HasValue)
        {
            var parentExists = await _context.ObjectCodeLevels.AnyAsync(l => l.Id == dto.ParentId.Value && l.IsActive);
            if (!parentExists)
                throw new InvalidOperationException("Selected parent level does not exist.");
        }

        var level = new ObjectCodeLevel
        {
            Name = dto.Name.Trim(),
            ParentId = dto.ParentId,
            IsActive = true
        };

        _context.ObjectCodeLevels.Add(level);
        await _context.SaveChangesAsync();

        await _context.Entry(level).Reference(l => l.Parent).LoadAsync();

        return new ObjectCodeLevelDto
        {
            Id = level.Id,
            Name = level.Name,
            ParentId = level.ParentId,
            ParentName = level.Parent != null ? level.Parent.Name : null,
            IsActive = level.IsActive
        };
    }

    public async Task<ObjectCodeLevelDto?> UpdateObjectCodeLevelAsync(int id, UpdateObjectCodeLevelDto dto)
    {
        var level = await _context.ObjectCodeLevels
            .Include(l => l.Parent)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (level == null) return null;

        if (dto.ParentId.HasValue)
        {
            if (dto.ParentId.Value == id)
                throw new InvalidOperationException("A level cannot be its own parent.");

            var parentExists = await _context.ObjectCodeLevels.AnyAsync(l => l.Id == dto.ParentId.Value && l.IsActive);
            if (!parentExists)
                throw new InvalidOperationException("Selected parent level does not exist.");

            level.ParentId = dto.ParentId.Value;
        }

        if (dto.Name != null)
            level.Name = dto.Name.Trim();

        if (dto.IsActive.HasValue)
            level.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        await _context.Entry(level).Reference(l => l.Parent).LoadAsync();

        return new ObjectCodeLevelDto
        {
            Id = level.Id,
            Name = level.Name,
            ParentId = level.ParentId,
            ParentName = level.Parent != null ? level.Parent.Name : null,
            IsActive = level.IsActive
        };
    }

    public async Task<bool> DeleteObjectCodeLevelAsync(int id)
    {
        var level = await _context.ObjectCodeLevels.FindAsync(id);
        if (level == null) return false;

        var hasChildren = await _context.ObjectCodeLevels.AnyAsync(l => l.ParentId == id && l.IsActive);
        if (hasChildren)
            throw new InvalidOperationException("Cannot delete a level that has sublevels.");

        var inUse = await _context.ObjectCodes.AnyAsync(o => o.LevelId == id && o.IsActive);
        if (inUse)
            throw new InvalidOperationException("Cannot delete a level that is assigned to object codes.");

        level.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Fiscal Years

    public async Task<List<FiscalYearDto>> GetAllFiscalYearsAsync()
    {
        return await _context.FiscalYears
            .Where(f => f.IsActive)
            .OrderByDescending(f => f.StartDate)
            .Select(f => new FiscalYearDto
            {
                Id = f.Id,
                Year = f.Year,
                StartDate = f.StartDate,
                EndDate = f.EndDate,
                IsActive = f.IsActive,
                IsCurrent = f.IsCurrent
            })
            .ToListAsync();
    }

    public async Task<FiscalYearDto?> GetCurrentFiscalYearAsync()
    {
        var fy = await _context.FiscalYears.FirstOrDefaultAsync(f => f.IsCurrent && f.IsActive);
        if (fy == null) return null;

        return new FiscalYearDto
        {
            Id = fy.Id,
            Year = fy.Year,
            StartDate = fy.StartDate,
            EndDate = fy.EndDate,
            IsActive = fy.IsActive,
            IsCurrent = fy.IsCurrent
        };
    }

    public async Task<FiscalYearDto> CreateFiscalYearAsync(CreateFiscalYearDto dto)
    {
        if (dto.IsCurrent)
        {
            var currentFy = await _context.FiscalYears.Where(f => f.IsCurrent).ToListAsync();
            foreach (var fy in currentFy)
            {
                fy.IsCurrent = false;
            }
        }

        var fiscalYear = new FiscalYear
        {
            Year = dto.Year,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true,
            IsCurrent = dto.IsCurrent
        };

        _context.FiscalYears.Add(fiscalYear);
        await _context.SaveChangesAsync();

        return new FiscalYearDto
        {
            Id = fiscalYear.Id,
            Year = fiscalYear.Year,
            StartDate = fiscalYear.StartDate,
            EndDate = fiscalYear.EndDate,
            IsActive = fiscalYear.IsActive,
            IsCurrent = fiscalYear.IsCurrent
        };
    }

    public async Task<FiscalYearDto?> SetCurrentFiscalYearAsync(int id)
    {
        var fiscalYear = await _context.FiscalYears.FindAsync(id);
        if (fiscalYear == null) return null;

        var allFiscalYears = await _context.FiscalYears.ToListAsync();
        foreach (var fy in allFiscalYears)
        {
            fy.IsCurrent = fy.Id == id;
        }

        await _context.SaveChangesAsync();

        return new FiscalYearDto
        {
            Id = fiscalYear.Id,
            Year = fiscalYear.Year,
            StartDate = fiscalYear.StartDate,
            EndDate = fiscalYear.EndDate,
            IsActive = fiscalYear.IsActive,
            IsCurrent = fiscalYear.IsCurrent
        };
    }

    #endregion

    #region Budget Entries

    public async Task<List<BudgetEntryDto>> GetAllBudgetEntriesAsync(int? fiscalYearId = null)
    {
        var query = _context.BudgetEntries
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .AsQueryable();

        if (fiscalYearId.HasValue)
        {
            query = query.Where(b => b.FiscalYearId == fiscalYearId.Value);
        }
        else
        {
            var currentFy = await _context.FiscalYears.FirstOrDefaultAsync(f => f.IsCurrent);
            if (currentFy != null)
            {
                query = query.Where(b => b.FiscalYearId == currentFy.Id);
            }
        }

        return await query
            .OrderBy(b => b.ObjectCode.Code)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BudgetEntryDto?> GetBudgetEntryByIdAsync(int id)
    {
        var entry = await _context.BudgetEntries
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .FirstOrDefaultAsync(b => b.Id == id);

        return entry == null ? null : MapToDto(entry);
    }

    public async Task<BudgetEntryDto> CreateBudgetEntryAsync(CreateBudgetEntryDto dto, int userId)
    {
        var entry = new BudgetEntry
        {
            ObjectCodeId = dto.ObjectCodeId,
            FiscalYearId = dto.FiscalYearId,
            TotalBudgetAllocation = dto.TotalBudgetAllocation,
            FirstReleased = dto.FirstReleased,
            SecondReleased = dto.SecondReleased,
            ThirdReleased = dto.ThirdReleased,
            FourthReleased = dto.FourthReleased,
            SupplementaryBudget = dto.SupplementaryBudget,
            AdditionalSurrender = dto.AdditionalSurrender,
            ExcessReallocation = dto.ExcessReallocation,
            AAAReApp = dto.AAAReApp,
            BudgetWithheldLapse = dto.BudgetWithheldLapse,
            AAAExpenditure = dto.AAAExpenditure,
            DevelopmentBudgetAllocated = dto.DevelopmentBudgetAllocated,
            DevelopmentReApp = dto.DevelopmentReApp,
            DevelopmentExpenditure = dto.DevelopmentExpenditure,
            PLABudgetAllocated = dto.PLABudgetAllocated,
            PLAReApp = dto.PLAReApp,
            PLAExpenditure = dto.PLAExpenditure,
            UHIBudgetAllocated = dto.UHIBudgetAllocated,
            UHIReApp = dto.UHIReApp,
            UHIExpenditure = dto.UHIExpenditure,
            CreatedAt = DateTime.UtcNow,
            CreatedById = userId
        };

        entry.CalculateTotals();

        _context.BudgetEntries.Add(entry);
        await _context.SaveChangesAsync();

        await _context.Entry(entry).Reference(e => e.ObjectCode).LoadAsync();
        await _context.Entry(entry).Reference(e => e.FiscalYear).LoadAsync();

        return MapToDto(entry);
    }

    public async Task<BudgetEntryDto?> UpdateBudgetEntryAsync(int id, UpdateBudgetEntryDto dto, int userId)
    {
        var entry = await _context.BudgetEntries
            .Include(b => b.ObjectCode)
            .Include(b => b.FiscalYear)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (entry == null) return null;

        if (dto.TotalBudgetAllocation.HasValue) entry.TotalBudgetAllocation = dto.TotalBudgetAllocation.Value;
        if (dto.FirstReleased.HasValue) entry.FirstReleased = dto.FirstReleased.Value;
        if (dto.SecondReleased.HasValue) entry.SecondReleased = dto.SecondReleased.Value;
        if (dto.ThirdReleased.HasValue) entry.ThirdReleased = dto.ThirdReleased.Value;
        if (dto.FourthReleased.HasValue) entry.FourthReleased = dto.FourthReleased.Value;
        if (dto.SupplementaryBudget.HasValue) entry.SupplementaryBudget = dto.SupplementaryBudget.Value;
        if (dto.AdditionalSurrender.HasValue) entry.AdditionalSurrender = dto.AdditionalSurrender.Value;
        if (dto.ExcessReallocation.HasValue) entry.ExcessReallocation = dto.ExcessReallocation.Value;
        if (dto.AAAReApp.HasValue) entry.AAAReApp = dto.AAAReApp.Value;
        if (dto.BudgetWithheldLapse.HasValue) entry.BudgetWithheldLapse = dto.BudgetWithheldLapse.Value;
        if (dto.AAAExpenditure.HasValue) entry.AAAExpenditure = dto.AAAExpenditure.Value;
        if (dto.DevelopmentBudgetAllocated.HasValue) entry.DevelopmentBudgetAllocated = dto.DevelopmentBudgetAllocated.Value;
        if (dto.DevelopmentReApp.HasValue) entry.DevelopmentReApp = dto.DevelopmentReApp.Value;
        if (dto.DevelopmentExpenditure.HasValue) entry.DevelopmentExpenditure = dto.DevelopmentExpenditure.Value;
        if (dto.PLABudgetAllocated.HasValue) entry.PLABudgetAllocated = dto.PLABudgetAllocated.Value;
        if (dto.PLAReApp.HasValue) entry.PLAReApp = dto.PLAReApp.Value;
        if (dto.PLAExpenditure.HasValue) entry.PLAExpenditure = dto.PLAExpenditure.Value;
        if (dto.UHIBudgetAllocated.HasValue) entry.UHIBudgetAllocated = dto.UHIBudgetAllocated.Value;
        if (dto.UHIReApp.HasValue) entry.UHIReApp = dto.UHIReApp.Value;
        if (dto.UHIExpenditure.HasValue) entry.UHIExpenditure = dto.UHIExpenditure.Value;

        entry.CalculateTotals();
        entry.UpdatedAt = DateTime.UtcNow;
        entry.UpdatedById = userId;

        await _context.SaveChangesAsync();

        return MapToDto(entry);
    }

    public async Task<bool> DeleteBudgetEntryAsync(int id)
    {
        var entry = await _context.BudgetEntries.FindAsync(id);
        if (entry == null) return false;

        _context.BudgetEntries.Remove(entry);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Dashboard

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? fiscalYearId = null)
    {
        FiscalYear? fiscalYear;
        
        if (fiscalYearId.HasValue)
        {
            fiscalYear = await _context.FiscalYears.FindAsync(fiscalYearId.Value);
        }
        else
        {
            fiscalYear = await _context.FiscalYears.FirstOrDefaultAsync(f => f.IsCurrent);
        }

        if (fiscalYear == null)
        {
            return new DashboardSummaryDto();
        }

        var entries = await _context.BudgetEntries
            .Include(b => b.ObjectCode)
            .Include(b => b.CreatedBy)
            .Where(b => b.FiscalYearId == fiscalYear.Id)
            .ToListAsync();

        var aaaBudget = entries.Sum(e => e.TotalAAABudget);
        var aaaExpenditure = entries.Sum(e => e.AAAExpenditure);
        var developmentBudget = entries.Sum(e => e.DevelopmentTotalBudget);
        var developmentExpenditure = entries.Sum(e => e.DevelopmentExpenditure);
        var plaBudget = entries.Sum(e => e.PLATotalBudget);
        var plaExpenditure = entries.Sum(e => e.PLAExpenditure);
        var uhiBudget = entries.Sum(e => e.UHITotalBudget);
        var uhiExpenditure = entries.Sum(e => e.UHIExpenditure);

        var totalBudget = aaaBudget + developmentBudget + plaBudget + uhiBudget;
        var totalExpenditure = aaaExpenditure + developmentExpenditure + plaExpenditure + uhiExpenditure;

        var departmentSummaries = entries
            .GroupBy(e => string.IsNullOrWhiteSpace(e.CreatedBy?.Department) ? "Unassigned" : e.CreatedBy!.Department!)
            .Select(g => new DepartmentSummaryDto
            {
                Department = g.Key,
                TotalBudget = g.Sum(e => e.ConsolidatedTotalBudget),
                TotalExpenditure = g.Sum(e => e.ConsolidatedTotalExpenditure),
                Remaining = g.Sum(e => e.ConsolidatedRemainingBudget),
                UtilizationPercentage = g.Sum(e => e.ConsolidatedTotalBudget) > 0
                    ? Math.Round((g.Sum(e => e.ConsolidatedTotalExpenditure) / g.Sum(e => e.ConsolidatedTotalBudget)) * 100, 2)
                    : 0
            })
            .OrderByDescending(d => d.TotalExpenditure)
            .ToList();

        return new DashboardSummaryDto
        {
            FiscalYear = fiscalYear.Year,
            TotalBudgetAllocated = totalBudget,
            TotalExpenditure = totalExpenditure,
            TotalRemaining = totalBudget - totalExpenditure,
            UtilizationPercentage = totalBudget > 0 ? Math.Round((totalExpenditure / totalBudget) * 100, 2) : 0,
            
            AAABudget = new BudgetCategorySummaryDto
            {
                Category = "Non-Development (AAA)",
                TotalBudget = aaaBudget,
                TotalExpenditure = aaaExpenditure,
                Remaining = aaaBudget - aaaExpenditure,
                UtilizationPercentage = aaaBudget > 0 ? Math.Round((aaaExpenditure / aaaBudget) * 100, 2) : 0
            },

            DevelopmentBudget = new BudgetCategorySummaryDto
            {
                Category = "Development (AAA)",
                TotalBudget = developmentBudget,
                TotalExpenditure = developmentExpenditure,
                Remaining = developmentBudget - developmentExpenditure,
                UtilizationPercentage = developmentBudget > 0 ? Math.Round((developmentExpenditure / developmentBudget) * 100, 2) : 0
            },
            
            PLABudget = new BudgetCategorySummaryDto
            {
                Category = "PLA Budget",
                TotalBudget = plaBudget,
                TotalExpenditure = plaExpenditure,
                Remaining = plaBudget - plaExpenditure,
                UtilizationPercentage = plaBudget > 0 ? Math.Round((plaExpenditure / plaBudget) * 100, 2) : 0
            },
            
            UHIBudget = new BudgetCategorySummaryDto
            {
                Category = "UHI Budget",
                TotalBudget = uhiBudget,
                TotalExpenditure = uhiExpenditure,
                Remaining = uhiBudget - uhiExpenditure,
                UtilizationPercentage = uhiBudget > 0 ? Math.Round((uhiExpenditure / uhiBudget) * 100, 2) : 0
            },
            
            TopExpenditures = entries
                .OrderByDescending(e => e.ConsolidatedTotalExpenditure)
                .Take(5)
                .Select(e => new TopExpenditureDto
                {
                    ObjectCode = e.ObjectCode.Code,
                    HeadOfAccount = e.ObjectCode.HeadOfAccount,
                    Expenditure = e.ConsolidatedTotalExpenditure,
                    Budget = e.ConsolidatedTotalBudget,
                    UtilizationPercentage = e.ConsolidatedTotalBudget > 0 
                        ? Math.Round((e.ConsolidatedTotalExpenditure / e.ConsolidatedTotalBudget) * 100, 2) 
                        : 0
                })
                .ToList(),

            DepartmentSummaries = departmentSummaries
        };
    }

    #endregion

    #region Releases

    public async Task<BudgetEntryDto?> UpdateReleasesAsync(int budgetEntryId, UpdateReleasesDto dto, int userId)
    {
        var entry = await _context.BudgetEntries
            .Include(e => e.ObjectCode)
            .Include(e => e.FiscalYear)
            .FirstOrDefaultAsync(e => e.Id == budgetEntryId);

        if (entry == null) return null;

        if (dto.FirstReleased.HasValue) entry.FirstReleased = dto.FirstReleased.Value;
        if (dto.SecondReleased.HasValue) entry.SecondReleased = dto.SecondReleased.Value;
        if (dto.ThirdReleased.HasValue) entry.ThirdReleased = dto.ThirdReleased.Value;
        if (dto.FourthReleased.HasValue) entry.FourthReleased = dto.FourthReleased.Value;
        if (dto.SupplementaryBudget.HasValue) entry.SupplementaryBudget = dto.SupplementaryBudget.Value;

        entry.CalculateTotals();
        entry.UpdatedAt = DateTime.UtcNow;
        entry.UpdatedById = userId;

        await _context.SaveChangesAsync();
        return MapToDto(entry);
    }

    #endregion

    #region Expense History

    public async Task<List<ExpenseHistoryDto>> GetExpenseHistoryAsync(int budgetEntryId)
    {
        return await _context.ExpenseHistories
            .Include(e => e.CreatedBy)
            .Where(e => e.BudgetEntryId == budgetEntryId)
            .OrderByDescending(e => e.ExpenseDate)
            .Select(e => new ExpenseHistoryDto
            {
                Id = e.Id,
                BudgetEntryId = e.BudgetEntryId,
                ExpenseName = e.ExpenseName,
                Amount = e.Amount,
                BudgetType = e.BudgetType,
                Description = e.Description,
                ExpenseDate = e.ExpenseDate,
                CreatedAt = e.CreatedAt,
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.FullName : null
            })
            .ToListAsync();
    }

    public async Task<ExpenseHistoryDto> AddExpenseAsync(CreateExpenseDto dto, int userId)
    {
        var entry = await _context.BudgetEntries
            .Include(e => e.ObjectCode)
            .Include(e => e.FiscalYear)
            .FirstOrDefaultAsync(e => e.Id == dto.BudgetEntryId);

        if (entry == null)
            throw new InvalidOperationException("Budget entry not found.");

        // Add expense to history
        var expense = new ExpenseHistory
        {
            BudgetEntryId = dto.BudgetEntryId,
            ExpenseName = dto.ExpenseName,
            Amount = dto.Amount,
            BudgetType = dto.BudgetType.ToUpper(),
            Description = dto.Description,
            ExpenseDate = dto.ExpenseDate ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedById = userId
        };

        _context.ExpenseHistories.Add(expense);

        // Update the appropriate expenditure field
        switch (dto.BudgetType.ToUpper())
        {
            case "AAA":
                entry.AAAExpenditure += dto.Amount;
                break;
            case "DEV":
                entry.DevelopmentExpenditure += dto.Amount;
                break;
            case "PLA":
                entry.PLAExpenditure += dto.Amount;
                break;
            case "UHI":
                entry.UHIExpenditure += dto.Amount;
                break;
            default:
                throw new InvalidOperationException("Invalid budget type. Must be AAA, DEV, PLA, or UHI.");
        }

        entry.CalculateTotals();
        entry.UpdatedAt = DateTime.UtcNow;
        entry.UpdatedById = userId;

        await _context.SaveChangesAsync();

        // Load created by user
        await _context.Entry(expense).Reference(e => e.CreatedBy).LoadAsync();

        return new ExpenseHistoryDto
        {
            Id = expense.Id,
            BudgetEntryId = expense.BudgetEntryId,
            ExpenseName = expense.ExpenseName,
            Amount = expense.Amount,
            BudgetType = expense.BudgetType,
            Description = expense.Description,
            ExpenseDate = expense.ExpenseDate,
            CreatedAt = expense.CreatedAt,
            CreatedByName = expense.CreatedBy?.FullName
        };
    }

    #endregion

    private static BudgetEntryDto MapToDto(BudgetEntry entry) => new()
    {
        Id = entry.Id,
        ObjectCodeId = entry.ObjectCodeId,
        ObjectCode = entry.ObjectCode.Code,
        HeadOfAccount = entry.ObjectCode.HeadOfAccount,
        FiscalYearId = entry.FiscalYearId,
        FiscalYear = entry.FiscalYear.Year,
        TotalBudgetAllocation = entry.TotalBudgetAllocation,
        FirstReleased = entry.FirstReleased,
        SecondReleased = entry.SecondReleased,
        ThirdReleased = entry.ThirdReleased,
        FourthReleased = entry.FourthReleased,
        SupplementaryBudget = entry.SupplementaryBudget,
        AdditionalSurrender = entry.AdditionalSurrender,
        ExcessReallocation = entry.ExcessReallocation,
        SumOfReleased = entry.SumOfReleased,
        AAAReApp = entry.AAAReApp,
        TotalAAABudget = entry.TotalAAABudget,
        BudgetWithheldLapse = entry.BudgetWithheldLapse,
        AAAExpenditure = entry.AAAExpenditure,
        AAARemainingBudget = entry.AAARemainingBudget,
        DevelopmentBudgetAllocated = entry.DevelopmentBudgetAllocated,
        DevelopmentReApp = entry.DevelopmentReApp,
        DevelopmentTotalBudget = entry.DevelopmentTotalBudget,
        DevelopmentExpenditure = entry.DevelopmentExpenditure,
        DevelopmentRemainingBudget = entry.DevelopmentRemainingBudget,
        PLABudgetAllocated = entry.PLABudgetAllocated,
        PLAReApp = entry.PLAReApp,
        PLATotalBudget = entry.PLATotalBudget,
        PLAExpenditure = entry.PLAExpenditure,
        PLARemainingBudget = entry.PLARemainingBudget,
        UHIBudgetAllocated = entry.UHIBudgetAllocated,
        UHIReApp = entry.UHIReApp,
        UHITotalBudget = entry.UHITotalBudget,
        UHIExpenditure = entry.UHIExpenditure,
        UHIRemainingBudget = entry.UHIRemainingBudget,
        ConsolidatedTotalBudget = entry.ConsolidatedTotalBudget,
        ConsolidatedTotalExpenditure = entry.ConsolidatedTotalExpenditure,
        ConsolidatedRemainingBudget = entry.ConsolidatedRemainingBudget,
        CreatedAt = entry.CreatedAt,
        UpdatedAt = entry.UpdatedAt
    };
}
