using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBillType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillType",
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
                name: "BillType",
                table: "ContingentBills");
        }
    }
}
