import { baseRequest, operateRequest } from "@utils/request";

/**
 * 小程序用户登录接口
 * @param {*} data
 * @returns
 */
const postMiniLogin = (data) => {
  return baseRequest({
    url: `/miniLogin`,
    method: "POST",
    contentType: 'application/json',
    data,
  });
};

/**
 * 小程序用户修改密码接口
 * @param {*} data
 * @returns
 */
const postUpdatePassword = (data) => {
  return baseRequest({
    url: `/updatePassword`,
    method: "PUT",
    contentType: 'application/json',
    data,
  });
};

/**
 * 校验 token 是否有效接口
 * @param {*} data
 * @returns
 */
const queryVerifyToken = (data) => {
  return baseRequest({
    url: `/verifyToken`,
    method: "GET",
    data,
  });
};

/**
 * 操作日志上传接口
 * @param {*} data
 * @returns
 */
const postLog = (data) => {
  return baseRequest({
    url: `/verifyToken`,
    method: "POST",
    contentType: 'application/json',
    data,
  });
};

export {
  postMiniLogin,
  postUpdatePassword,
  queryVerifyToken,
  postLog
}
