"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adds a foreign key constraint to the 'classes' table
    // to link it to the 'schools' table via the 'schoolCode' column.
    // This also ensures that if a school's 'code' is updated or a school
    // is deleted, the corresponding classes are handled accordingly.
    await queryInterface.addConstraint("classes", {
      fields: ["schoolCode"],
      type: "foreign key",
      name: "fk_classes_schoolCode_schools_code",
      references: {
        table: "schools",
        field: "code",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removes the foreign key constraint from the 'classes' table.
    // This function is for rolling back the migration.
    await queryInterface.removeConstraint(
      "classes",
      "fk_classes_schoolCode_schools_code"
    );
  },
};
