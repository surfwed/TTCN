const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const BaseController = require('./BaseController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class UsersController extends BaseController {
	static async getUserById(req, res) {
		try {
			const schema = Joi.object({
				id: Joi.string().regex(/user_[a-zA-Z0-9]{10}/),
			});
			const { error } = schema.validate({ id: req.params.id });
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid User Id');

			const result = await super.getById(req, 'TaUser');
			return requestHandler.sendSuccess(res, 'User Data Extracted')(
				_.omit(result.dataValues, ['Password'])
			);
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

	static async deleteById(req, res) {
		try {
			const result = await super.deleteById(req, 'Users');
			return requestHandler.sendSuccess(res, 'User Deleted Successfully')({ result });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getProfile(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			const options = {
				where: { id: user.payload.id },
			};
			const userProfile = await super.getByCustomOptions(req, 'Users', options);
			const profile = _.omit(userProfile.dataValues, ['createdAt', 'updatedAt', 'last_login_date', 'password']);
			return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')({ profile });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}
}

module.exports = UsersController;