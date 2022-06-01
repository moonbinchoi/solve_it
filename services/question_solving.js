const questionSolvingService = {};
const Like = require('../models/like');
const Question = require('../models/question');
const AnswerSheet = require('../models/answer_sheet');
const AnswerRecord = require('../models/answer_record');
const TestQuestion = require('../models/test_question');
const QuestionDifficulty = require('../models/question_difficulty');
const Asking = require('../models/asking');
const Reply = require('../models/reply');

questionSolvingService.contributeDifficulty = async (question_id, difficulty_id, user_id) => {
    try {
        const result = await QuestionDifficulty.findOrCreate({
            attributes: ['question_id'],
            where: {
                question_id: question_id,
                creator_id: user_id,
            },
            defaults: {
                question_id: question_id,
                difficulty_id: difficulty_id,
                creator_id: user_id
            }
        });
        return result[1];
    } catch (e) {
        console.error(e);
    }
}

questionSolvingService.getTestLikesCount = async (test_id) => {
    try {
        return await Like.count({
            where: {
                test_id: test_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.likeTest = async (test_id, user_id) => {
    try {
        return await Like.create({
            test_id: test_id,
            creator_id: user_id
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.unlikeTest = async (test_id, user_id) => {
    try {
        return await Like.destroy({
            where: {
                test_id: test_id,
                creator_id: user_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
},

    questionSolvingService.getTestQuestion = async (question_id) => {
        try {
            return await TestQuestion.findOne({
                attribute: [id, number, test_id],
                where: {
                    question_id: question_id
                }
            })
        } catch (e) {
            console.error(e);
            return null;
        }
    }

questionSolvingService.submitAnswer = async (question_id, answers, user_id) => {
    try {
        const testQuestion = await this.getTestQuestion(question_id)

        await AnswerSheet.create({
            test_id: test_id,
            creator_id: user_id
        });

        const answer_sheet = await AnswerSheet.findOne({
            attribute: [id, created_at, update_at, test_id, creator_id],
            where: {
                test_id: test_id
            }
        });

        for (let i of answers) {
            await AnswerRecord.create({
                answer: i,
                answer_sheet_id: answer_sheet.id,
                test_question_id: testQuestion.id,
                question_id: question_id
            })
        }
        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}

questionSolvingService.isAskingCreator = async (asking_id, user_id) => {
    try {
        const asking = await Asking.findOne({
            attributes: ['creator_id'],
            where: {
                id: asking_id,
            }
        });
        return asking.creator_id === user_id;
    } catch (e) {
        console.error(e);
        return false;
    }
}

questionSolvingService.createAsking = async (question_id, title, content, creator_id) => {
    try {
        await Asking.create({
            title: title,
            content: content,
            question_id: question_id,
            creator_id: creator_id
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

questionSolvingService.deleteAsking = async (asking_id) => {
    try {
        await Asking.destroy({
            where: {
                id: asking_id
            }
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

questionSolvingService.getAskingsByQuestionId = async (question_id) => {
    try {
        return await Asking.findAll({
            attributes: ['id', 'title', 'created_at', 'question_id', 'creator_id']
        });
    } catch (e) {
        console.error(e);
        return null
    }
}

questionSolvingService.getAsking = async (asking_id) => {
    try {
        return await Asking.findOne({
            attributes: ['id', 'title', 'content', 'created_at', 'question_id', 'creator_id']
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.getRepliesByAskingId = async (asking_id) => {
    try {
        return await Reply.findAll({
            attributes: ['id', 'content', 'created_at', 'creator_id', 'asking_id'],
            where: {
                asking_id: asking_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = questionSolvingService;