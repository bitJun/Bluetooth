import Taro from "@tarojs/taro";
import { Toast } from "@nutui/nutui-react-taro";
import { requestInfo } from "@config";
import { queryRefreshToken } from "@api/user";
import { setStorageSync, getStorageSync, clearStroageSync } from "@utils/util";
const CODE_SUCCESS = "00000";
const CODE_AUTH_EXPIRED = ["A0325"]; //登录失效
const systemInfo = Taro.getSystemInfoSync();
import { weappConfig } from "../config";

Taro.isNeedLogin = false; // 登录状态

/**
 * 目前浏览器端暂时不用做，只做微信H5和小程序
 * 客户端请求参数
 * @param {*} options
 */
export function baseRequest(options) {
  const {
    url,
    data,
    method = "GET",
    showToast = true,
    router,
    contentType,
  } = options;
  const token = getStorageSync("accessToken");
  const header = token ? { Authorization: `Bearer ${token}` } : {};
  if (["POST", "PUT", "DELETE"].indexOf(method) != -1 && contentType) {
    header["content-type"] = contentType;
  } else {
    header["content-type"] = "application/x-www-form-urlencoded";
  }
  header["version"] = weappConfig.version;
  const getEnv = Taro.getEnv();
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${requestInfo.BaseUrl}${url}`,
      method,
      data: data,
      header,
    })
      .then((res) => {
        if (res.data.code == CODE_SUCCESS) {
          resolve(res.data.data);
        } else {
          if (res.data.code == "00000") {
            reject(res.data);
          } else {
            if (res.data.code == "A0325") {
              clearStroageSync();
              Taro.showToast({
                title: "登录失效,请重新登录",
                icon: "none",
                duration: 2000,
              });
              setTimeout(() => {
                Taro.redirectTo({
                  url: "/pages/subpages/login/index",
                });
              }, 1000);
            }
            if (res.data.code == "A0304") {
              setTimeout(() => {
                clearStroageSync();
                Taro.redirectTo({
                  url: "/pages/subpages/login/index",
                });
              }, 2000);
            }
            if (res.data.code == "A0402") {
              setTimeout(() => {
                clearStroageSync();
                Taro.redirectTo({
                  url: "/pages/subpages/register/index",
                });
              }, 2000);
            } else {
              if (res.data.code != "A0100") {
                console.log(3123123);
                Taro.showToast({
                  title: res.data.message,
                  icon: "none",
                  duration: 2000,
                });
                reject(res.data);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.code === CODE_AUTH_EXPIRED) {
          if (getEnv === "WEAPP") {
            Taro.removeStorageSync("HP_TOKEN");
          } else {
            Taro.reLaunch({
              url: `/pages/login/register`,
            });
          }
        }
        reject(err);
      });
  });
}

/**
 * 目前浏览器端暂时不用做，只做微信H5和小程序
 * 客户端请求参数
 * @param {*} options
 */
export function operateRequest(options) {
  const {
    url,
    data,
    method = "GET",
    showToast = true,
    router,
    contentType,
  } = options;
  const token = getStorageSync("accessToken");
  const header = token ? { Authorization: `Bearer ${token}` } : {};
  if (["POST", "PUT", "DELETE"].indexOf(method) != -1 && contentType) {
    header["content-type"] = contentType;
  } else {
    header["content-type"] = "application/x-www-form-urlencoded";
  }
  header["version"] = weappConfig.version;
  const getEnv = Taro.getEnv();
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${requestInfo.BaseUrl}${url}`,
      method,
      data: data,
      header,
    })
      .then((res) => {
        if (res.data.code == CODE_SUCCESS) {
          resolve(res.data.data);
        } else if (res.data.code == "A0325") {
          resolve(res.data);
        } else {
          if (res.data.code == "A0304") {
            setTimeout(() => {
              clearStroageSync();
              Taro.redirectTo({
                url: "/pages/subpages/login/index",
              });
            }, 2000);
          }
          if (res.data.code == "A0402") {
            setTimeout(() => {
              clearStroageSync();
              Taro.redirectTo({
                url: "/pages/subpages/register/index",
              });
            }, 2000);
          } else {
            reject(res.data);
          }
        }
      })
      .catch((err) => {
        if (err.code === CODE_AUTH_EXPIRED) {
          if (getEnv === "WEAPP") {
            Taro.removeStorageSync("HP_TOKEN");
          } else {
            Taro.reLaunch({
              url: `/pages/login/register`,
            });
          }
        }
        reject(err);
      });
  });
}
