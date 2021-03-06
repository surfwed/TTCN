const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');

const logger = new Logger();
const errHandler = new RequestHandler(logger);

const limit = 10;

class BaseController {
	/**
	* Get an element by it's id .
	*
	*
	* @return a Promise
	* @return an err if an error occur
	*/
	static async getById(req, modelName) {
		// req:
		// - body
		// - params
		// - query
		let result;
		try {
			result = await req.app.get('db')[modelName].findByPk(req.params.Id).then(
				errHandler.throwIf(r => !r, 404, 'not found', 'Resource not found'),
				errHandler.throwError(500, 'sequelize error ,some thing wrong with either the data base connection or schema'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async getByCustomOptions(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findOne(options);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async deleteById(req, modelName) {
		let result;
		try {
			result = await req.app.get('db')[modelName].destroy({
				where: {
					Id: req.params.Id,
				},
			}).then(
				errHandler.throwIf(r => r < 1, 404, 'not found', 'No record matches the Id provided'),
				errHandler.throwError(500, 'sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async create(req, modelName) {
		let result;
		try {
			result = await req.app.get('db')[modelName].build(req.body).save().then(
				errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt save data'),
				errHandler.throwError(500, 'sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}


	static async updateById(req, modelName, data) {
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(
					data,
					{
						where: {
							Id: req.params.Id || req.decoded.Id,
						},
					}
				).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error')
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async updateByCustomWhere(req, modelName, data, options) {
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(
					data,
					{
						where: options,
					}
				).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error'),

				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async getList(req, modelName, options) {
		let results;
		try {
			if (_.isUndefined(options)) {
				options = {};
			}
			if (req.query.page = parseInt(req.query.page, 10)) {
				if (req.query.page === 0) {
					options = {}
				} else {
					options = _.extend(
						{},
						options,
						{
							offset: limit * (req.query.page - 1),
							limit: limit,
						}
					);
				}
			} else {
				options = _.extend({}, options, {}); // extend it so we can't mutate
			}

			results = await req.app.get('db')[modelName]
				.findAll(options)
				.then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong while fetching data'),
					errHandler.throwError(500, 'sequelize error'),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return results;
	}
}
module.exports = BaseController;
