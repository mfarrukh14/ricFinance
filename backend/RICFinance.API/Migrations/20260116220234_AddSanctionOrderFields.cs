using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSanctionOrderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LateDeliveryCharges",
                table: "ContingentBills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OtherDeductionAmount",
                table: "ContingentBills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "OtherDeductionName",
                table: "ContingentBills",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PST",
                table: "ContingentBills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "RiskPurchase",
                table: "ContingentBills",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ShelfLife",
                table: "ContingentBills",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LateDeliveryCharges",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "OtherDeductionAmount",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "OtherDeductionName",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "PST",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "RiskPurchase",
                table: "ContingentBills");

            migrationBuilder.DropColumn(
                name: "ShelfLife",
                table: "ContingentBills");
        }
    }
}
