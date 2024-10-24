"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("games", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("LIVE", "DRAW", "ENDED"),
        allowNull: false,
      },
      winner: { type: Sequelize.STRING, allowNull: true },
      blackPlayer: { type: Sequelize.STRING, allowNull: false },
      whitePlayer: { type: Sequelize.STRING, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("moves", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "games", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      figure: {
        type: Sequelize.ENUM(
          "PAWN1",
          "PAWN2",
          "PAWN3",
          "PAWN4",
          "PAWN5",
          "PAWN6",
          "PAWN7",
          "PAWN8",
          "ROOK1",
          "ROOK2",
          "KNIGHT1",
          "KNIGHT2",
          "BISHOP1",
          "BISHOP2",
          "QUEEN",
          "KING"
        ),
        allowNull: false,
      },
      position: { type: Sequelize.STRING, allowNull: false },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("moves");
    await queryInterface.dropTable("games");
    await queryInterface.dropTable("users");
  },
};
