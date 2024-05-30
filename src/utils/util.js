/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
import Taro from "@tarojs/taro";
import TextDecoder from 'miniprogram-text-decoder'

/**
 * 从缓存中获取用户信息,注意key和value
 * @param {*} key
 */
export function getStorageSync(key) {
  return Taro.getStorageSync(key);
}

export function clearStroageSync() {
  return Taro.clearStorageSync();
}
/**
 * 写入缓存信息
 * @param {*} data
 */
// eslint-disable-next-line no-unused-vars
export function setStorageSync(key, value) {
  return Taro.setStorageSync(key, value || "");
}

/**
 * 清楚缓存信息
 * @param {*} data
 */
// eslint-disable-next-line no-unused-vars
export function removeStorageSync(key) {
  return Taro.removeStorageSync(key);
}

/**
 * 截取url字符串
 * @param {*} name
 * @param {*} url
 */
export function getQueryString(name, url = "") {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = url.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/**
 * 判断是否是微信环境
 */
export function getIsWxClient() {
  let ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  }
  return false;
}

/**
 * 判断是否苹果移动设备访问
 */
export function isAppleMobileDevice() {
  return /iphone|ipod|ipad|Macintosh/i.test(navigator.userAgent.toLowerCase());
}

/**
 * 判断是否在app
 */
export function isBwMobileDevice() {
  return /bluewhale/i.test(navigator.userAgent.toLowerCase());
}

/**
 * 判断是否安卓移动设备访问
 */
export function isAndroidMobileDevice() {
  return /android/i.test(navigator.userAgent.toLowerCase());
}

/**
 * 是否为对象
 * @param value
 * @returns {boolean}
 */
export function isObject(value) {
  const type = typeof value;
  return value !== null && (type == "function" || type == "object");
}

/**
 * 格式化字符串中的空格和换行符
 * @param str 字符串
 * @returns {*}
 */
export function formatString(str) {
  if (typeof str !== "string") {
    return;
  }
  str = str.replace(/\ +/g, "");
  str = str.replace(/[\r\n]/g, "");
  return str;
}

/**
 * 函数防抖
 * @param func
 * @param wait
 * @param options  leading 延迟前调用   trailing 延迟后调用  maxWait 延迟最大时间
 * @returns {debounced}
 */
export function debounce(func, wait, options) {
  let lastArgs, lastThis, maxWait, result, timerId, lastCallTime;

  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF =
    !wait && wait !== 0 && typeof root.requestAnimationFrame === "function";

  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  wait = +wait || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      root.cancelAnimationFrame(timerId);
      return root.requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id);
    }
    clearTimeout(id);
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;
    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}

/**
 * 函数节流
 * @param func
 * @param wait
 * @param options
 * @returns {debounced}
 */

export function throttle(func, wait) {
  let last = 0;
  return () => {
    const current_time = +new Date();
    if (current_time - last > wait) {
      func.apply(this, arguments);
      last = +new Date();
    }
  };
}

export function GetQueryString(url, name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = url.match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/**
 * 获取参数 a=dada&b=dada
 * @param {*} name
 * @param {*} url
 */
export function getRouterName(name, url) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = url.match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

/**
 * {a:1,b:2} => a=1&b=2
 * @param obj
 * @returns {string}
 */
export const objToParmas = (obj) => {
  let str = "";
  let arr = [];
  if (Object.prototype.toString.call(obj) === "[object Object]") {
    for (let item in obj) {
      arr.push(`${item}=${obj[item]}`);
    }
    str = arr.join("&");
    return str;
  }
};

/**
 * 获取页面
 * @returns {Promise<*>}
 */

export function filterPage() {
  let pageData = {};
  let data = Taro.getCurrentPages();
  let pagesLength = data.length;
  if (pagesLength) {
    if (pagesLength > 1) {
      let prepage = data[pagesLength - 2].route;
      pageData.prePage = {
        path: prepage,
        id: pageToId(prepage),
      };
    }
    let currentPage = data[pagesLength - 1].route;
    let parmas = data[pagesLength - 1].options;
    let pageParmas = objToParmas(parmas);
    pageData.current = {
      path: pageParmas.length ? currentPage + "?" + pageParmas : currentPage,
      id: pageToId(currentPage),
    };
  }
  return pageData;
}

/**
 *
 * @param path
 * @returns {number}
 */
export const pageToId = (path) => {
  switch (path) {
    case "pages/home/index":
      return 1;
    case "pages/goods/detail":
      return 3;
    case "pages/subject/index":
      return 5;
    case "pages/redpacket/goods/index":
      return 7;
    default:
      return 0;
  }
};
/**
 *  过滤scene
 * @param code
 * @returns {string}
 */
export const secneToId = (code) => {
  let codeArr = [
    {
      list: [1007, 1008, 1036, 1044], // 分享小程序卡片
      id: "1156043043950850146",
    },
    {
      list: [1011, 1012, 1013, 1047, 1048, 1049], // 二维码
      id: "1156043309941026907",
    },
    {
      list: [1005, 1006, 1042, 1053, 1026], // 搜索
      id: "1156043401506877472",
    },
    {
      list: [1035, 1058, 1074, 1073], // 公众号
      id: "1156043440673288198",
    },
  ];
  for (let i = 0; i < codeArr.length; i++) {
    if (codeArr[i].list.indexOf(code) > -1) {
      return codeArr[i].id;
    }
  }
};

/**
 * 分转元
 * @param {*} fen
 * @returns
 */
export const regFenToYuan = (fen) => {
  var num = fen;
  num = fen * 0.01;
  num += "";
  var reg =
    num.indexOf(".") > -1
      ? /(\d{1,3})(?=(?:\d{3})+\.)/g
      : /(\d{1,3})(?=(?:\d{3})+$)/g;
  num = num.replace(reg, "$1");
  num = toDecimal2(num);
  return num;
};

export const toDecimal2 = (x) => {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf(".");
  if (rs < 0) {
    rs = s.length;
    s += ".";
  }
  while (s.length <= rs + 2) {
    s += "0";
  }
  return s;
};

/**
 * 判断传值是否为空、[]、{}
 * @param {*} param 
 * @returns 
 */
export const isEmptyInfo = (param) => {
  if (param == null) {
    return true;
  } else if (typeof param === 'string') {
    return param == '';
  } else if (typeof param === 'object') {
    return JSON.stringify(param) == '[]' || JSON.stringify(param) == '{}';
  }
  return false;
}

/**
 * 将字符串转换成ArrayBufer
 */
export function string2buffer(str) {
  if (!str) return;
  var val = "";
  for (var i = 0; i < str.length; i++) {
    val += str.charCodeAt(i).toString(16);
  }
  console.log(val);
  str = val;
  val = "";
  let length = str.length;
  let index = 0;
  let array = []
  while (index < length) {
    array.push(str.substring(index, index + 2));
    index = index + 2;
  }
  val = array.join(",");
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}


/**
 * 判断传值是否为空、[]、{}
 * @param {*} param 
 * @returns 
 */
export const isEmpty = (param) => {
  if (param == null) {
    return true;
  } else if (typeof param === 'string') {
    return param == '';
  } else if (typeof param === 'object') {
    return JSON.stringify(param) == '[]' || JSON.stringify(param) == '{}';
  }
  return false;
}

  
export const stringToHex = (str) => {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    result += ('00' + str.charCodeAt(i).toString(16)).slice(-2);
  }
  return result;
}

export const hexStringToBytes = (hexString) => {
  if (!/^[0-9a-fA-F]+$/.test(hexString)) {
    throw 'Invalid hexadecimal string';
  }
  // 确保字符串长度为偶数，如果不是，则在前面补0
  if (hexString.length % 2 !== 0) {
    hexString = '0' + hexString;
  }
  // 将每两个字符视为一个字节，并转换为对应的字节值
  let byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  // 返回ArrayBuffer
  return byteArray.buffer;
}

export const arrayBufferToHex = (arrayBuffer) => {
  let byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    hexString += ('0' + byteArray[i].toString(16)).slice(-2);
  }
  console.log('hexString', hexString)
  return hexString;
}

export const hexToString =(hex) => {
  let arr = hex.match(/[\dA-F]{2}/gi); // 分割每两个字符一组
  let bytes = arr.map(function(h) {
      return parseInt(h, 16);
  });
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}

export const arrayBufferToUtf8String = (arrayBuffer) => {
  const decoder = new TextDecoder('utf-8'); // 创建TextDecoder实例，指定编码为UTF-8
  return decoder.decode(arrayBuffer); // 解码ArrayBuffer为字符串
}

export const stringToBuffer = (hex) => {
  let typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  return typedArray.buffer;
}

// ArrayBuffer转16进度字符串示例
export function ab2hex(buffer) {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

// 将16进制的内容转成我们看得懂的字符串内容
export function hexCharCodeToStr(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
      Taro.showToast({
        title: '存在非法字符',
        icon: 'none'
      })
      return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
}
