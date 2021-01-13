const {User} = require('booking-db');

const {ErrorResponse} = require('../utils/errorResponse');
const {asyncHandler} = require('../middlewares/asyncHandler');
const {getUserProperties, createUserAndSendEmail, updateUserAndSendEmail} = require('../utils/util');

// @desc  Admin invites the user
// @route /api/v1/auth/invite
// @access Private (Admin)

module.exports = asyncHandler(async (req, res) => {
  const userProperties = getUserProperties(req);
  const user = await User.findOne({email: userProperties.email})
    .lean()
    .exec();
  if (!user) {
    const created_user = await createUserAndSendEmail(userProperties);
    return res.status(201).json({data: created_user.toJSON()});
  }
  if (user.accepted) {
    throw new ErrorResponse('User has already accepted the invitation', 409);
  }
  const updated_user = await updateUserAndSendEmail(userProperties, user._id);

  return res.status(202).json({data: updated_user});
});
