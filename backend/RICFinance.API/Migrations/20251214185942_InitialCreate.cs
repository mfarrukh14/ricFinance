using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FiscalYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsCurrent = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FiscalYears", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ObjectCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    HeadOfAccount = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BudgetEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ObjectCodeId = table.Column<int>(type: "int", nullable: false),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    TotalBudgetAllocation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FirstReleased = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SecondReleased = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ThirdReleased = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FourthReleased = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SupplementaryBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdditionalSurrender = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExcessReallocation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SumOfReleased = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AAAReApp = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAAABudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BudgetWithheldLapse = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AAAExpenditure = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AAARemainingBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PLABudgetAllocated = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PLAReApp = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PLATotalBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PLAExpenditure = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PLARemainingBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UHIBudgetAllocated = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UHIReApp = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UHITotalBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UHIExpenditure = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UHIRemainingBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ConsolidatedTotalBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ConsolidatedTotalExpenditure = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ConsolidatedRemainingBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: true),
                    UpdatedById = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetEntries_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BudgetEntries_ObjectCodes_ObjectCodeId",
                        column: x => x.ObjectCodeId,
                        principalTable: "ObjectCodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BudgetEntries_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BudgetEntries_Users_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "FiscalYears",
                columns: new[] { "Id", "EndDate", "IsActive", "IsCurrent", "StartDate", "Year" },
                values: new object[] { 1, new DateTime(2025, 6, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), true, true, new DateTime(2024, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "2024-25" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "FullName", "IsActive", "LastLogin", "PasswordHash", "Role", "Username" },
                values: new object[] { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "IT", "admin@ric.gov.pk", "System Administrator", true, null, "$2a$11$rBNrkhL8hPZq3.VhVYPZUOQMTVZjXXL9dGE3fCHN1SXKx6JJqhzGK", "Admin", "admin" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetEntries_CreatedById",
                table: "BudgetEntries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetEntries_FiscalYearId",
                table: "BudgetEntries",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetEntries_ObjectCodeId_FiscalYearId",
                table: "BudgetEntries",
                columns: new[] { "ObjectCodeId", "FiscalYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetEntries_UpdatedById",
                table: "BudgetEntries",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_Year",
                table: "FiscalYears",
                column: "Year",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ObjectCodes_Code",
                table: "ObjectCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "BudgetEntries");

            migrationBuilder.DropTable(
                name: "FiscalYears");

            migrationBuilder.DropTable(
                name: "ObjectCodes");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
