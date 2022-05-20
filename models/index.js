const Sequelize = require('sequelize');
const AnswerRecord = require('./answer_record');
const AnswerSheet = require('./answer_sheet');
const Asking = require('./asking');
const Category = require('./category');
const CodingQuestionTestCase = require('./coding_question_test_case');
const Coupon = require('./coupon');
const Difficulty = require('./difficulty');
const Question = require('./question');
const Reply = require('./reply');
const Report = require('./report');
const ReviewNote = require('./review_note');
const Test = require('./test');
const TestQuestion = require('./test_question');
const TestTag = require('./test_tag');
const Tier = require('./tier');
const User = require('./user');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.AnswerRecord = AnswerRecord;
db.AnswerSheet = AnswerSheet;
db.Asking = Asking;
db.Category = Category;
db.CodingQuestionTestCase = CodingQuestionTestCase;
db.Coupon = Coupon;
db.Difficulty = Difficulty;
db.Question = Question;
db.Reply = Reply;
db.Report = Report;
db.ReviewNote = ReviewNote;
db.Test = Test;
db.TestTag = TestTag;
db.TestQuestion = TestQuestion;
db.Tier = Tier;
db.User = User;

AnswerRecord.init(sequelize);
AnswerSheet.init(sequelize);
Asking.init(sequelize);
CodingQuestionTestCase.init(sequelize);
Category.init(sequelize);
Coupon.init(sequelize);
Difficulty.init(sequelize);
Question.init(sequelize);
Reply.init(sequelize);
Report.init(sequelize);
ReviewNote.init(sequelize);
Test.init(sequelize);
TestTag.init(sequelize);
TestQuestion.init(sequelize);
Tier.init(sequelize);
User.init(sequelize);

AnswerRecord.associate(db);
AnswerSheet.associate(db);
Asking.associate(db);
Category.associate(db);
CodingQuestionTestCase.associate(db);
Coupon.associate(db);
Difficulty.associate(db);
Question.associate(db);
Reply.associate(db);
Report.associate(db);
ReviewNote.associate(db);
Test.associate(db);
TestTag.associate(db);
TestQuestion.associate(db);
Tier.associate(db);
User.associate(db);

module.exports = db;