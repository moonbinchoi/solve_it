const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.STRING(30),
                allowNull: false,
                primaryKey: true,
            },
            password: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            nickname: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            experience: { // ??
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            point: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            categories: {
                type: Sequelize.STRING(30),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'User',
            tableName: 'user',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.User.belongsTo(db.Tier, { foreignKey: 'tier_id', targetKey: 'id' })
    }
};