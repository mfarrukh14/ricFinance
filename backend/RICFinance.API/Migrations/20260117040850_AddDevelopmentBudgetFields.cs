using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDevelopmentBudgetFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DevelopmentBudgetAllocated",
                table: "BudgetEntries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DevelopmentExpenditure",
                table: "BudgetEntries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DevelopmentReApp",
                table: "BudgetEntries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DevelopmentRemainingBudget",
                table: "BudgetEntries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DevelopmentTotalBudget",
                table: "BudgetEntries",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DevelopmentBudgetAllocated",
                table: "BudgetEntries");

            migrationBuilder.DropColumn(
                name: "DevelopmentExpenditure",
                table: "BudgetEntries");

            migrationBuilder.DropColumn(
                name: "DevelopmentReApp",
                table: "BudgetEntries");

            migrationBuilder.DropColumn(
                name: "DevelopmentRemainingBudget",
                table: "BudgetEntries");

            migrationBuilder.DropColumn(
                name: "DevelopmentTotalBudget",
                table: "BudgetEntries");
        }
    }
}
