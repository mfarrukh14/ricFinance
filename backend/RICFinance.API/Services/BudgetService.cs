using Microsoft.EntityFrameworkCore;
using RICFinance.API.Data;
using RICFinance.API.DTOs;
using RICFinance.API.Models;

namespace RICFinance.API.Services;

public interface IBudgetService
{
    // Object Codes
    Task<List<ObjectCodeDto>> GetAllObjectCodesAsync();
    Task<ObjectCodeDto?> GetObjectCodeByIdAsync(int id);
    Task<ObjectCodeDto> CreateObjectCodeAsync(CreateObjectCodeDto dto);
    Task<ObjectCodeDto?> UpdateObjectCodeAsync(int id, UpdateObjectCodeDto dto);
    Task<bool> DeleteObjectCodeAsync(int id);

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
            .Where(o => o.IsActive)
            .OrderBy(o => o.Code)
            .Select(o => new ObjectCodeDto
            {
                Id = o.Id,
                Code = o.Code,
                HeadOfAccount = o.HeadOfAccount,
                Description = o.Description,
                IsActive = o.IsActive
            })
            .ToListAsync();
    }

    public async Task<ObjectCodeDto?> GetObjectCodeByIdAsync(int id)
    {
        var obj = await _context.ObjectCodes.FindAsync(id);
        if (obj == null) return null;

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive
        };
    }

    public async Task<ObjectCodeDto> CreateObjectCodeAsync(CreateObjectCodeDto dto)
    {
        var obj = new ObjectCode
        {
            Code = dto.Code,
            HeadOfAccount = dto.HeadOfAccount,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.ObjectCodes.Add(obj);
        await _context.SaveChangesAsync();

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive
        };
    }

    public async Task<ObjectCodeDto?> UpdateObjectCodeAsync(int id, UpdateObjectCodeDto dto)
    {
        var obj = await _context.ObjectCodes.FindAsync(id);
        if (obj == null) return null;

        if (dto.Code != null) obj.Code = dto.Code;
        if (dto.HeadOfAccount != null) obj.HeadOfAccount = dto.HeadOfAccount;
        if (dto.Description != null) obj.Description = dto.Description;
        if (dto.IsActive.HasValue) obj.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        return new ObjectCodeDto
        {
            Id = obj.Id,
            Code = obj.Code,
            HeadOfAccount = obj.HeadOfAccount,
            Description = obj.Description,
            IsActive = obj.IsActive
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
            .Where(b => b.FiscalYearId == fiscalYear.Id)
            .ToListAsync();

        var aaaBudget = entries.Sum(e => e.TotalAAABudget);
        var aaaExpenditure = entries.Sum(e => e.AAAExpenditure);
        var plaBudget = entries.Sum(e => e.PLATotalBudget);
        var plaExpenditure = entries.Sum(e => e.PLAExpenditure);
        var uhiBudget = entries.Sum(e => e.UHITotalBudget);
        var uhiExpenditure = entries.Sum(e => e.UHIExpenditure);

        var totalBudget = aaaBudget + plaBudget + uhiBudget;
        var totalExpenditure = aaaExpenditure + plaExpenditure + uhiExpenditure;

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
                .ToList()
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
