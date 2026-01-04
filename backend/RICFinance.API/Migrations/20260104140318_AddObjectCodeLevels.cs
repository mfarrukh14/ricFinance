using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RICFinance.API.Migrations
{
    /// <inheritdoc />
    public partial class AddObjectCodeLevels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LevelId",
                table: "ObjectCodes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ObjectCodeLevels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectCodeLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ObjectCodeLevels_ObjectCodeLevels_ParentId",
                        column: x => x.ParentId,
                        principalTable: "ObjectCodeLevels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$KilIsS23lIjFOdYdbr6jredow9KzaURfWTgZnWxxyKau/DFGb.xai");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectCodes_LevelId",
                table: "ObjectCodes",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectCodeLevels_Name_ParentId",
                table: "ObjectCodeLevels",
                columns: new[] { "Name", "ParentId" },
                unique: true,
                filter: "[ParentId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ObjectCodeLevels_ParentId",
                table: "ObjectCodeLevels",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ObjectCodes_ObjectCodeLevels_LevelId",
                table: "ObjectCodes",
                column: "LevelId",
                principalTable: "ObjectCodeLevels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ObjectCodes_ObjectCodeLevels_LevelId",
                table: "ObjectCodes");

            migrationBuilder.DropTable(
                name: "ObjectCodeLevels");

            migrationBuilder.DropIndex(
                name: "IX_ObjectCodes_LevelId",
                table: "ObjectCodes");

            migrationBuilder.DropColumn(
                name: "LevelId",
                table: "ObjectCodes");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$rBNrkhL8hPZq3.VhVYPZUOQMTVZjXXL9dGE3fCHN1SXKx6JJqhzGK");
        }
    }
}
