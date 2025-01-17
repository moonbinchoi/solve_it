const questionSolvingService = {};
const AnswerSheet = require('../models/answer_sheet');
const AnswerRecord = require('../models/answer_record');
const Test = require('../models/test');
const TestQuestion = require('../models/test_question');
const QuestionDifficulty = require('../models/question_difficulty');
const Asking = require('../models/asking');
const Reply = require('../models/reply');
const User = require('../models/user');
const {sequelize} = require("../models/index");
const Category = require("../models/category");
const Question = require("../models/question");
const Difficulty = require("../models/difficulty");
const CodingQuestionTestCases = require('../models/coding_question_test_case');
const axios = require('axios');

questionSolvingService.contributeDifficulty = async (question_id, difficulty_id, user_id) => {
    try {
        const user = await User.findOne({
            attributes: ['id', 'tier_id'],
            where: {
                id: user_id
            }
        });
        if (user.tier_id < 3) {
            return false;
        }
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
        const difficulty = await QuestionDifficulty.findOne({
            attributes: [[sequelize.fn('round', sequelize.fn('avg', sequelize.col('difficulty_id')), 0), 'difficulty']],
            where: {
                question_id: question_id
            },
            group: ['question_id'],
        });
        await Question.update({
            difficulty_id: difficulty.dataValues.difficulty
        }, {
            where: {
                id: question_id
            }
        });
        return true;
    } catch (e) {
        console.error(e);
    }
}

questionSolvingService.getTestLikesCount = async (test_id) => {
    try {
        const test = await Test.findOne({
            attributes: ['id'],
            where: {
                id: test_id
            }
        });

        return await test.countUsers();
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.likeTest = async (test_id, user_id) => {
    try {
        const test = await Test.findOne({
            attributes: ['id'],
            where: {
                id: test_id
            }
        });

        await test.addUser(user_id);
        return 1;
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.unlikeTest = async (test_id, user_id) => {
    try {
        const test = await Test.findOne({
            attributes: ['id'],
            where: {
                id: test_id,
                creator_id: user_id
            }
        });

        await test.removeUser(user_id);
        return 1;
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.getTestQuestion = async (question_id) => {
    try {
        return await TestQuestion.findOne({
            attribute: ['id', 'number', 'test_id'],
            where: {
                question_id: question_id
            }
        })
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.getAnswerSheet = async (test_id, user_id) => {
    try {
        return await AnswerSheet.findOne({
            attribute: ['id', 'created_at', 'update_at', 'test_id', 'creator_id'],
            where: {
                test_id: test_id,
                creator_id: user_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.getTestQuestion = async (test_id, question_id) => {
    try {
        return await TestQuestion.findOne({
            attribute: ['id', 'number'],
            where: {
                test_id: test_id,
                question_id: question_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.getAllTestQuestion = async (test_id) => {
    try {
        return await TestQuestion.findAll({
            attribute: ['id', 'number', 'question_id'],
            where: {
                test_id: test_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.submitAnswer = async (test_id, question_id, answers, user_id) => {
    try {
        const answer_sheet = await questionSolvingService.getAnswerSheet(test_id, user_id);
        if (answer_sheet == null) {
            await AnswerSheet.create({
                test_id: test_id,
                creator_id: user_id
            });
        } else {
            await AnswerSheet.update({
                test_id: test_id,
                creator_id: user_id,
            }, {
                where: {
                    id: answer_sheet.id
                }
            });
        }

        const test_question = await questionSolvingService.getTestQuestion(test_id, question_id);

        await AnswerRecord.upsert({
            answer: answers,
            answer_sheet_id: answer_sheet.id,
            test_question_id: test_question.id,
            question_id: question_id
        });
        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}

questionSolvingService.getAnswerRecord = async (test_id, question_id, user_id) => {
    try {
        const answer_sheet = await questionSolvingService.getAnswerSheet(test_id, user_id);
        const test_question = await questionSolvingService.getTestQuestion(test_id, question_id);

        return await AnswerRecord.findOne({
            attributes: ['id', 'answer', 'is_correct'],
            where: {
                answer_sheet_id: answer_sheet.id,
                test_question_id: test_question.id
            }
        });
    } catch (e) {
        console.error(e)
        return null;
    }
}

questionSolvingService.getAnswerRecords = async (test_id, user_id) => {
    try {
        const answer_sheet = await questionSolvingService.getAnswerSheet(test_id, user_id);
        const test_questions = await questionSolvingService.getAllTestQuestion(test_id);

        let answer_record_list = [];

        for (let test_question of test_questions) {
            answer_record_list.push(
                await AnswerRecord.findOne({
                    attributes: ['id', 'answer', 'is_correct', 'question_id', 'language'],
                    where: {
                        answer_sheet_id: answer_sheet.id,
                        test_question_id: test_question.id
                    }
                })
            );
        }

        return answer_record_list;
    } catch (e) {
        console.error(e)
        return null;
    }
}

questionSolvingService.getAllAsking = async (page) => {
    try {
        return await Asking.findAll({
            attributes: ['id', 'title', 'content', 'created_at', 'question_id', 'creator_id'],
            limit: 10,
            offset: (page - 1) * 10,
            order: [['created_at', 'DESC']]
        });
    } catch (e) {
        console.error(e);
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

questionSolvingService.getAskingByQuestionId = async (question_id) => {
    try {
        return await Asking.findAll({
            attributes: ['id', 'title', 'content', 'created_at', 'question_id', 'creator_id'],
            where: {
                question_id: question_id
            }
        });
    } catch (e) {
        console.error(e);
        return null
    }
}

questionSolvingService.getAsking = async (asking_id) => {
    try {
        return await Asking.findOne({
            attributes: ['id', 'title', 'content', 'created_at', 'question_id', 'creator_id'],
            where: {
                id: asking_id
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.updateJudgeResult = async (answer_record_id, is_correct) => {
    try {
        await AnswerRecord.update({
            is_correct: is_correct
        }, {
            where: {
                id: answer_record_id
            }
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

questionSolvingService.getSolvingTests = async (user_id) => {
    try {
        return await Test.findAll({
            attributes: ['id', 'title', 'try_count', 'is_private', 'created_at', 'creator_id', [
                sequelize.literal('(SELECT count(*) FROM `like` WHERE `test_id` = `Test`.`id`)'), 'like'
            ]],
            include: [{
                model: AnswerSheet,
                where: {
                    creator_id: user_id
                },
                order: [
                    ['updated_at', 'DESC']
                ]
            }, {
                model: Category,
                attributes: ['id', 'name']
            }]
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

questionSolvingService.isReplyCreator = async (reply_id, user_id) => {
    try {
        const reply = await Reply.findOne({
            attributes: ['creator_id'],
            where: {
                id: reply_id,
            }
        });
        return reply.creator_id === user_id;
    } catch (e) {
        console.error(e);
        return false;
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

questionSolvingService.createReply = async (asking_id, content, creator_id) => {
    try {
        await Reply.create({
            asking_id: asking_id,
            content: content,
            creator_id: creator_id
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

questionSolvingService.deleteReply = async (reply_id) => {
    try {
        await Reply.destroy({
            where: {
                id: reply_id
            }
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

const isSupportedLanguage = (language) => {
    return language === 'java' || language === 'python' || language === 'c' || language === 'cpp'
}

questionSolvingService.submitCodingTestAnswer = async (test_id, question_id, source_code, language, user_id) => {
    if (!isSupportedLanguage(language))
        return false;
    try {
        const answer_sheet = await questionSolvingService.getAnswerSheet(test_id, user_id);
        if (answer_sheet == null) {
            await AnswerSheet.create({
                test_id: test_id,
                creator_id: user_id
            });
        } else {
            await AnswerSheet.update({
                test_id: test_id,
                creator_id: user_id,
            }, {
                where: {
                    id: answer_sheet.id
                }
            });
        }

        const test_question = await questionSolvingService.getTestQuestion(test_id, question_id);

        await AnswerRecord.upsert({
            answer: source_code,
            answer_sheet_id: answer_sheet.id,
            test_question_id: test_question.id,
            question_id: question_id,
            language: language
        });
        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}

const languageToLanguageId = (language) => {
    let language_id;
    switch (language) {
        case 'java':
            language_id = 62;
            break;
        case 'c':
            language_id = 50;
            break;
        case 'c++':
            language_id = 54;
            break;
        case 'python':
            language_id = 71;
            break;
    }
    return language_id;
}

questionSolvingService.judgeCodingTestQuestion = async (source_code, language, user_id, question_id) => {
    let token;
    const language_id = languageToLanguageId(language);
    const test_cases = await CodingQuestionTestCases.findAll({
        attributes: ['input', 'output'],
        where: {
            question_id: question_id
        }
    });
    for (let i = 0; i < test_cases.length; i++) {
        const test_case = test_cases[i];
        await axios.post(process.env.JUDGE_SERVER_URL + '/submissions', {
            source_code: source_code,
            language_id: language_id,
            stdin: test_case.input
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            if (response.status === 201) {
                token = response.data.token;
            }
        }).catch(function (error) {
            console.error(error);
        });
        let stdout;
        await sleep(3000);
        while(true)
        {
            await axios.get(process.env.JUDGE_SERVER_URL + '/submissions/' + token, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status === 200) {
                    stdout = response.data.stdout;
                }
            }).catch(function (error) {
                console.error(error);
            });
            if (stdout !== null) {
                if (stdout.endsWith('\n')) {
                    stdout = stdout.substring(0, stdout.length - 1);
                    break;
                }
            }
            await sleep(500);
        }
        return test_case.output === stdout;
    }
}

questionSolvingService.getExperience = async (question_id) => {
    try {
        const question = await Question.findOne({
            attributes: ['difficulty_id'],
            where: {
                id: question_id
            }
        });
        const difficulty = await Difficulty.findOne({
            attributes: ['experience'],
            where: {
                id: question.difficulty_id
            }
        });
        return difficulty.experience;
    } catch (e) {
        console.error(e);
    }
}

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

module.exports = questionSolvingService;