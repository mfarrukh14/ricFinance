using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddContingentBillEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContingentBills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BillNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EprocTenderId = table.Column<int>(type: "int", nullable: true),
                    SupplierName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TenderTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LetterOfAwardNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ObjectCodeId = table.Column<int>(type: "int", nullable: true),
                    FiscalYearId = table.Column<int>(type: "int", nullable: true),
                    HeadCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    HeadTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BudgetAllotment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountOfBill = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPreviousBills = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalUptoDate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AvailableBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StampDuty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GST = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IncomeTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LaborDuty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetPayment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountInWords = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MedicalSuperintendentApproved = table.Column<bool>(type: "bit", nullable: false),
                    MedicalSuperintendentApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutiveDirectorApproved = table.Column<bool>(type: "bit", nullable: false),
                    ExecutiveDirectorApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PreAuditPassed = table.Column<bool>(type: "bit", nullable: false),
                    PreAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisallowanceReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AmountLessDrawn = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContingentBills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContingentBills_FiscalYears_FiscalYearId",
                        column: x => x.FiscalYearId,
                        principalTable: "FiscalYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ContingentBills_ObjectCodes_ObjectCodeId",
                        column: x => x.ObjectCodeId,
                        principalTable: "ObjectCodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ContingentBills_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ScheduleOfPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContingentBillId = table.Column<int>(type: "int", nullable: false),
                    SheetNumber = table.Column<int>(type: "int", nullable: false),
                    SerialNumber = table.Column<int>(type: "int", nullable: false),
                    BillMonth = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Particulars = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    HeadCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GrossAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StampDuty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IncomeTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GST = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PST = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ChequeNumberAndDate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ChequeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AccountantApproved = table.Column<bool>(type: "bit", nullable: false),
                    BudgetOfficerApproved = table.Column<bool>(type: "bit", nullable: false),
                    AuditOfficerApproved = table.Column<bool>(type: "bit", nullable: false),
                    AccountsOfficerApproved = table.Column<bool>(type: "bit", nullable: false),
                    DirectorFinanceApproved = table.Column<bool>(type: "bit", nullable: false),
                    ExecutiveDirectorApproved = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleOfPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduleOfPayments_ContingentBills_ContingentBillId",
                        column: x => x.ContingentBillId,
                        principalTable: "ContingentBills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScheduleOfPayments_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AsaanCheques",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleOfPaymentId = table.Column<int>(type: "int", nullable: false),
                    SheetNumber = table.Column<int>(type: "int", nullable: false),
                    ScheduleSerialNumber = table.Column<int>(type: "int", nullable: false),
                    ScheduleDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DDOName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AsaanAccountTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AsaanAccountNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CostCentre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProjectDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SubDetailedFunction = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GrantNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ChequeSerialNumber = table.Column<int>(type: "int", nullable: false),
                    ChequeNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ChequeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PayeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ObjectCodeDetail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CertificateConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DirectorFinanceApproved = table.Column<bool>(type: "bit", nullable: false),
                    DirectorFinanceApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutiveDirectorApproved = table.Column<bool>(type: "bit", nullable: false),
                    ExecutiveDirectorApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ForwardedToBank = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ForwardedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AsaanCheques", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AsaanCheques_ScheduleOfPayments_ScheduleOfPaymentId",
                        column: x => x.ScheduleOfPaymentId,
                        principalTable: "ScheduleOfPayments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AsaanCheques_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AsaanCheques_CreatedById",
                table: "AsaanCheques",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AsaanCheques_ScheduleOfPaymentId",
                table: "AsaanCheques",
                column: "ScheduleOfPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_ContingentBills_BillNumber",
                table: "ContingentBills",
                column: "BillNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContingentBills_CreatedById",
                table: "ContingentBills",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ContingentBills_FiscalYearId",
                table: "ContingentBills",
                column: "FiscalYearId");

            migrationBuilder.CreateIndex(
                name: "IX_ContingentBills_ObjectCodeId",
                table: "ContingentBills",
                column: "ObjectCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOfPayments_ContingentBillId",
                table: "ScheduleOfPayments",
                column: "ContingentBillId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOfPayments_CreatedById",
                table: "ScheduleOfPayments",
                column: "CreatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AsaanCheques");

            migrationBuilder.DropTable(
                name: "ScheduleOfPayments");

            migrationBuilder.DropTable(
                name: "ContingentBills");
        }
    }
}
