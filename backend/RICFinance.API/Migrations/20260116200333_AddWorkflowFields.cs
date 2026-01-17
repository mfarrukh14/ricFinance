using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ContingentBills",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountOfficerApprovalDate",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AccountOfficerApproved",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AccountOfficerId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountOfficerRemarks",
                table: "ContingentBills",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AccountantApprovalDate",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AccountantApproved",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AccountantId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountantRemarks",
                table: "ContingentBills",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AuditOfficerApprovalDate",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AuditOfficerApproved",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AuditOfficerId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AuditOfficerRemarks",
                table: "ContingentBills",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ComputerOperatorSubmittedAt",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByComputerOperatorId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DirectorFinanceApprovalDate",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DirectorFinanceApproved",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DirectorFinanceId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DirectorFinanceRemarks",
                table: "ContingentBills",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PONumber",
                table: "ContingentBills",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SONumber",
                table: "ContingentBills",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SeniorBudgetOfficerApprovalDate",
                table: "ContingentBills",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SeniorBudgetOfficerApproved",
                table: "ContingentBills",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SeniorBudgetOfficerId",
                table: "ContingentBills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeniorBudgetOfficerRemarks",
                table: "ContingentBills",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowStatus",
                table: "ContingentBills",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountOfficerApprovalDate",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountOfficerApproved",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountOfficerId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountOfficerRemarks",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountantApprovalDate",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountantApproved",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountantId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AccountantRemarks",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AuditOfficerApprovalDate",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AuditOfficerApproved",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AuditOfficerId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "AuditOfficerRemarks",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "ComputerOperatorSubmittedAt",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "CreatedByComputerOperatorId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "DirectorFinanceApprovalDate",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "DirectorFinanceApproved",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "DirectorFinanceId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "DirectorFinanceRemarks",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "PONumber",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "SONumber",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "SeniorBudgetOfficerApprovalDate",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "SeniorBudgetOfficerApproved",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "SeniorBudgetOfficerId",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "SeniorBudgetOfficerRemarks",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "WorkflowStatus",
                table: "ContingentBills");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ContingentBills",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
