const User = require("../models/user");
const SkillMaster = require("../models/skill_master");
const UserDevice = require("../models/user_device");
const UserReview = require("../models/user_review");
const JobApplication = require("../models/job_application");
const JobMaster = require("../models/job_master");
const sequelize = require("../config/database").MAIN_DATABASE;
const Sequelize = require("sequelize");
const { Op, QueryTypes } = require("sequelize");
const Applicant = require("../models/applicant");
const Staff = require("../models/staffModal");
const userServices = {
  /**
   * This function used to get user By ID
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getUser: async (userId) => {
    return User.findOne({
      where: { idUser: userId, status: 1 },
      raw: true,
    });
  },
  /**
   * This function used to get user By Email
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getUserByEmail: async (email) => {
    return User.findOne({ where: { email: email, status: 1 }, raw: true });
  },
  /**
   * This function used to get STaff by Mobile
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getStaffById: async (id) => {
    return await Staff.findOne({
      where: { id: id },
    });
  },
  /**
   * This function used to get STaff by Mobile
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getStaffByMobile: async (phone) => {
    return await Staff.findOne({
      where: { mobileNumber: phone },
    });
  },
  /**
   * This function used to get User by Mobile
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getUserByMobile: async (phone) => {
    const staff = await userServices.getStaffByMobile(phone);

    if (!staff?.EmployeeID) {
      return await Applicant.findOne({
        where: { phoneNumber: phone?.toString(), status: 1 },
      });
    } else {
      return "STAFF";
    }
  },
  /**
   * This function used to Update user
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  updateUser: async (data, idUser) => {
    let userUpdateModel = {};
    let user = await User.findOne({ where: { id: idUser } });
    const { profileStatus } = user.dataValues;
    if (data.firstName && data.lastName) {
      userUpdateModel.firstName = data.firstName;
      userUpdateModel.lastName = data.lastName;
      userUpdateModel.profileStatus = `${profileStatus + "name"}`;
    } else if (data.location) {
      const point = {
        type: "Point",
        coordinates: [data.location.long, data.location.lat],
      };
      userUpdateModel.location = point;
      userUpdateModel.profileStatus = `${profileStatus + "location"}`;
    } else if (data.phone) {
      userUpdateModel.phone = data.phone;
    } else if (data.userImage) {
      userUpdateModel.userImage = data.userImage;
      userUpdateModel.profileStatus = `${profileStatus + "picture"}`;
    } else if (data.ssn) {
      userUpdateModel.ssn = data.ssn;
      userUpdateModel.profileStatus = `${profileStatus + "ssn"}`;
    } else if (data.driverLicenseUrlFront) {
      userUpdateModel.driverLicenseUrlFront = data.driverLicenseUrlFront;
      userUpdateModel.profileStatus = `${profileStatus + "license"}`;
    } else if (data.email) {
      userUpdateModel.email = data.email;
    }
    try {
      return await User.update(userUpdateModel, {
        where: { idUser: idUser, status: 1 },
      });
    } catch (error) {
      console.log(error);
    }
  },
  /**
   * This function used to get user Profile
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getProfile: async (idUser) => {
    const attributes = [
      "id",
      "phone",
      "firstName",
      "lastName",
      "email",
      "emailVerifyStatus",
      "userType",
      "userImage",
      "rating",
      "positiveFeedbackTotal",
      "ssn",
      "notificationStatus",
      "status",
      "profileStatus",
      "firstJobCreatedDate",
    ];
    const user = await User.findOne({
      attributes,
      where: { idUser: idUser, status: "1" },
      raw: true,
    });

    const jobCounts = await sequelize?.query(
      `select count(id) as total_jobs, sum(CASE WHEN status = 'completed' THEN 1 else 0 end) as completed_job, sum(CASE WHEN status = 'completed' THEN price else 0 end) as total_spent from tbl_kjobs_job_master where poster_id=${idUser};`,
      { type: QueryTypes.SELECT }
    );

    user.reviewCounts = 10;
    user.totalPostedJobs = jobCounts[0].total_jobs || 0;
    user.totalSpentMoney = jobCounts[0].total_spent || 0;
    return user;
  },
  /**
   * This function used to delete user
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  deleteUser: async (user) => {
    const res = await User.update(
      {
        status: "0",
      },
      { where: { id: user.idUser } }
    );

    if (res && user.userType === 1) {
      return await JobApplication.update(
        {
          status: "deleted",
        },
        {
          where: {
            applicantId: user.idUser,
          },
        }
      );
    } else if (res && user.userType === 2) {
      return await JobMaster.update(
        { status: "deleted" },
        { where: { posterId: user.idUser } }
      );
    }
  },
  /**
   * This function used to Update user notification status
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  updateUserNotificationStatus: async (data, idUser) => {
    return await User.update(data, { where: { idUser: idUser } });
  },
  /**
   * This function used to Get All skills
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getAllSkill: async () => {
    let skills = await SkillMaster.findAll({
      attributes: [
        "id",
        "parentId",
        "title",
        "shortDesc",
        "type",
        "multi_select",
      ],
      where: { status: 1 },
      raw: true,
    });

    let modules = [];
    [...skills].map((item) => {
      if (!item.parentId) {
        modules.push(item);
      }
    });
    skills = skills.map((item) => {
      item.skill = skills.filter((_item) => _item.parentId === item.id);
      return item;
    });
    modules = modules.map((item) => {
      item.skill = skills.filter((_item) => _item.parentId === item.id);
      return item;
    });
    return modules;
  },
  /**
   * This function used to Update Device Token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  updateDeviceToken: async (data, idUser) => {
    data.idUser = idUser;
    data.status = 1;
    const attributes = ["id", "deviceId", "fcmToken", "idUser", "status"];
    const device = await UserDevice.create(data);
    return await UserDevice.findOne({
      attributes,
      where: { id: device.id },
    });
  },
  /**
   * This function used to Delete Device Token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  deleteUserToken: async (deviceId) => {
    return await UserDevice.destroy({ where: { id: deviceId } });
  },
  /**
   * This function used to fetch service provider counts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getServiceProviderCount: async (user) => {
    let lat = user.location.coordinates[1];
    let long = user.location.coordinates[0];
    const radius = 10;
    const disKm = radius * 1.60934;
    const degree = disKm / 110.571;
    try {
      const location = sequelize?.literal(
        `ST_GeomFromText('POINT(${long} ${lat})', 4326)`
      );
      const distance = sequelize?.fn(
        "ST_Distance",
        sequelize?.literal("location"),
        location
      );
      const serviceProviders = await User.findAll({
        attributes: [
          "id",
          [
            sequelize?.fn(
              "ST_Distance",
              sequelize?.literal("location"),
              location
            ),
            "distance",
          ],
          "location",
          "userType",
        ],
        where: sequelize?.where(distance, { [Op.lte]: degree }),
        order: [["location", "ASC"]],
        order: distance,
        limit: 10,
        logging: console.log,
      });
      const count = serviceProviders.filter((item) => {
        // console.log(item);
        return item.userType === 1;
      });
      return count.length;
    } catch (error) {
      console.log(error);
    }
  },
  /**
   * This function used to fetch Job Poster counts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getJobPosterCount: async (user) => {
    let lat = user.location.coordinates[1];
    let long = user.location.coordinates[0];
    const radius = 10;
    const disKm = radius * 1.60934;
    const degree = disKm / 110.571;
    const location = sequelize?.literal(
      `ST_GeomFromText('POINT(${long} ${lat})', 4326)`
    );
    const distance = sequelize?.fn(
      "ST_Distance",
      sequelize?.literal("location"),
      location
    );
    const serviceProviders = await User.findAll({
      attributes: [
        "id",
        [
          sequelize?.fn(
            "ST_Distance",
            sequelize?.literal("location"),
            location
          ),
          "distance",
        ],
        "location",
        "userType",
      ],
      where: sequelize?.where(distance, { [Op.lte]: degree }),
      order: [["location", "ASC"]],
      order: distance,
      limit: 10,
      logging: console.log,
    });
    const count = serviceProviders.filter((item) => {
      return item.userType === 2;
    });
    return count.length;
  },
};

module.exports = userServices;
