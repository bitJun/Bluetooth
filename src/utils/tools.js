import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    // 添加键盘高度变化监听器
    const onKeyboardHeightChange = (e) => {
      setKeyboardHeight(e.height)
    }
    Taro.onKeyboardHeightChange(onKeyboardHeightChange)
    // 清理函数，在组件卸载时移除监听器
    return () => {
      Taro.offKeyboardHeightChange(onKeyboardHeightChange)
    }
  }, [])

  return keyboardHeight
}

/**
 * getCurrentTime('Y-m-d')==>2018年01月20日
 * getCurrentTime('h-m-s')==>20时08分53秒
 * 默认  //20160614134947
 * 获取当前时间
 * @returns {string}
 */

function getCurrentTime(type = '') {
	var keep = ''
	var date = new Date()
	var y = date.getFullYear()
	var m = date.getMonth() + 1
	m = m < 10 ? '0' + m : m
	var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
	var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
	var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
	var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
	var rand = Math.round(Math.random() * 899 + 100)
	if (type == 'Y-m-d') {
		keep = y + '年' + m + '月' + d + '日'
		return keep// 2016年06月14日
	} else if (type == 'h-m-s') {
		keep = d + '时' + f + '分' + s + '秒'
		return keep
	} else if (type == 'Y-m-d h:f') {
		keep = `${y}-${m}-${d}  ${h}:${f}`
		return keep
	} else if (type == 'h:m') {
		return `${h}:${f}`
	}
	keep = y + type + m + type + d + type + h + type + f + type + s
	return keep // 20160614134947
}

/**
 * 默认  //毫秒数
 * @returns {string}
 */
function formatTime(ms, type = '') {
	let days = Math.floor(ms / (1000 * 60 * 60 * 24)),
		hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
		minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
		seconds = Math.floor((ms % (1000 * 60)) / 1000)

	if (days < 10) days = `0${days}`
	if (hours < 10) hours = `0${hours}`
	if (minutes < 10) minutes = `0${minutes}`
	if (seconds < 10) seconds = `0${seconds}`
	if (days > 0) {
		switch (type) {
		case 'HH':
			let nowHours = String(hours)
			let nowDay = String(days)
			if (nowHours && nowHours.indexOf('0') === 0) {
			nowHours = nowHours.substr(1, 1)
			}
			if (nowDay && nowDay.indexOf('0') === 0) {
			nowDay = nowDay.substr(1, 1)
			}
			return `${Number(nowHours) + Number(nowDay) * 24}:${minutes}:${seconds}`
		default :
			return `${days}天 ${hours}:${minutes}:${seconds}`
		}
	} else {
		return `${hours}:${minutes}:${seconds}`
	}
}

/**
 * 获取对象的长度
 * @param input
 * @returns {number}
 */
function objLength(input) {
	var length = 0
	if (typeof (input) !== 'object') {
	} else {
		for (var key in input) {
		if (typeof (key) !== 'number') {
			length++
		}
		}
	}
	return length
}

// 验证是否是手机号码
function vailPhone(number) {
	let flag = false
	let myreg = /^1[3-9][0-9]{9}$/
	if (!myreg.test(number)) {
		flag = false
	} else {
		flag = true
	}
	return flag
}

// 过滤金钱currency(100, '￥', 3)==>￥100.000
function currency(value, _currency, decimals) {
	value = parseFloat(value)
	if (!isFinite(value) || !value && value !== 0) return ''
	_currency = _currency != null ? _currency : '$'// 默认金钱符号
	decimals = decimals != null ? decimals : 2
	var stringified = Math.abs(value).toFixed(decimals)
	var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified
	var i = _int.length % 3
	var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : ''
	var _float = decimals ? stringified.slice(-1 - decimals) : ''
	var sign = value < 0 ? '-' : ''
	var digitsRE = /(\d{3})(?=\d)/g
	return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float
}

// 浮点型减
function sub(a, b) {
	var c, d, e;
	try {
		c = a.toString().split(".")[1].length;
	} catch (f) {
		c = 0;
	}
	try {
		d = b.toString().split(".")[1].length;
	} catch (f) {
		d = 0;
	}
	return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
}

// 浮点型除法
function div(a, b) {
	var c, d, e = 0,
		f = 0
	try {
		e = a.toString().split('.')[1].length
	} catch (g) {
	}
	try {
		f = b.toString().split('.')[1].length
	} catch (g) {
	}
	return c = Number(a.toString().replace('.', '')), d = Number(b.toString().replace('.', '')), mul(c / d, Math.pow(10, f - e))
}

// 浮点型加法函数
function accAdd(arg1, arg2) {
	var r1, r2, m
	try {
		r1 = arg1.toString().split('.')[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split('.')[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2))
	return ((arg1 * m + arg2 * m) / m).toFixed(2)
}

// 浮点型乘法
function mul(a, b) {
	var c = 0,
		d = a.toString(),
		e = b.toString()
	try {
		c += d.split('.')[1].length
	} catch (f) {
	}
	try {
		c += e.split('.')[1].length
	} catch (f) {
	}
	return Number(d.replace('.', '')) * Number(e.replace('.', '')) / Math.pow(10, c)
}

// 遍历对象属性和值
function displayProp(obj) {
	var names = ''
	for (var name in obj) {
		names += name + obj[name]
	}
	return names
}

// 去除字符串所有空格
function sTrim(text) {
	return text.replace(/\s/ig, '')
}

// 去除所有:
function replaceMaohao(txt) {
	return txt.replace(/\:/ig, '')
}

// 显示限定得字符串
function cutStr(strs, length = 3, type = 0) { // 0=>123...   1=>12万
	let str = String(strs),
		flag = false;
	if (type == 0) {
		if (str.length < length) {
		length = str.length;
		flag = true
		}
		let end = str.substr(0, length)
		if (flag) {
		return end
		} else {
		return end + '...'
		}
	}
	if (type == 1) {
		if (str.length > 4 && str.length < 8) {
		let end = div(str, 10000)
		return end + '万+'
		} else {
		return str
		}
	}
}

// 时间戳转化为日期

function timestampToDate(timestamp, type = 'YMD') {
	let date = new Date(timestamp)
	let year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		hour = date.getHours(),
		minute = date.getMinutes(),
		second = date.getSeconds();
	if (month < 10) month = `0${month}`;
	if (day < 10) day = `0${day}`;
	if (hour < 10) hour = `0${hour}`;
	if (minute < 10) minute = `0${minute}`;
	if (second < 10) second = `0${second}`;
	if (type == 'MD') {
		return `${month}-${day}`
	}
	if (type == 'HM') {
		return `${hour}:${minute}`
	}
	if (type == 'MDHM') {
		return `${month}-${day} ${hour}:${minute}`
	}
	if (type == 'YMD') {
		return `${year}年${month}月${day}日`
	}
	if (type === '-') {
		return `${year}-${month}-${day}`
	}
	if (type == 'Y-M-D') {
		return `${year}-${month}-${day}`
	}
	if (type == 'Y-M-D hh:mm:ss') {
		return `${year}-${month}-${day} ${hour}:${minute}:${second}`
	}
}

function tofixed(num, s) {
	let times = Math.pow(10, s + 1),
		des = parseInt(num * times),
		rest = des % 10;
	if (rest == 5) {
		return ((parseFloat(des) + 1) / times).toFixed(s);
	}
	return num.toFixed(s);
}

// 微信版本号
function compareVersion(v1, v2) {
	v1 = v1.split('.')
	v2 = v2.split('.')
	const len = Math.max(v1.length, v2.length)
	while (v1.length < len) {
		v1.push('0')
	}
	while (v2.length < len) {
		v2.push('0')
	}
	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i])
		const num2 = parseInt(v2[i])
		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}
	return 0
}

// 格式化毫秒

function formatTimeMs(ms, type = '') {
	let days = Math.floor(ms / (1000 * 60 * 60 * 24))
	let hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
	let seconds = Math.floor((ms % (1000 * 60)) / 1000)
	let milliseconds = parseInt(Math.floor((ms % (1000 * 60)) % 1000).toString().slice(0, 1))
	if (days < 10) days = `0${days}`
	if (hours < 10) hours = `0${hours}`
	if (minutes < 10) minutes = `0${minutes}`
	if (seconds < 10) seconds = `0${seconds}`
	if (days > 0) {
		switch (type) {
			case 'HH':
				let nowHours = String(hours)
				let nowDay = String(days)
				if (hours && nowHours.indexOf('0') === 0) {
					nowHours = nowHours.substr(1, 1)
				}
				if (nowDay && nowDay.indexOf('0') === 0) {
					nowDay = nowDay.substr(1, 1)
				}
				hours = Number(nowHours) + Number(nowDay) * 24
				return {
					hours,
					minutes,
					seconds,
					milliseconds
				}
			default :
				return {
					days,
					hours,
					minutes,
					seconds,
					milliseconds
				}
		}
	} else {
		return {
			hours,
			minutes,
			seconds,
			milliseconds
		}
	}
}

/**
 * 根据id获取元素位置信息
 * @param id
 * target 传this
 * @returns {Promise<any>}
 */
function nodePosition(id, target) {
	return new Promise(resolve => {
		let query
		if (process.env.TARO_ENV === 'h5') {
			query = Taro.createSelectorQuery().in(target)
		} else {
			query = Taro.createSelectorQuery().in(target.$scope)
		}
		if (id.indexOf('#') > -1) { // id选择器默认第一个
			query.select(id).boundingClientRect()
		} else { // 类选择器
			query.selectAll(id).boundingClientRect()
		}
		query.selectViewport().scrollOffset()
		query.exec(res => {
		resolve(res)
		})
	})
}
// 发表时间 几秒前 几分前 几小时前
function formatTimeBefore (time) {
	let ms = new Date().getTime() - new Date(time).getTime();
	var days = Math.floor(ms / (1000 * 60 * 60 * 24))
	var hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	var minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
	var seconds = Math.floor((ms % (1000 * 60)) / 1000)
	if (days) {
		return days + '天前'
	}
	if (hours) {
		return hours + '小时前'
	}
	if (minutes) {
		return minutes + '分钟前'
	}
	if (seconds) {
		return seconds + '秒前'
	} else {
		return '刚刚'
	}
}

// 发表时间 几秒前 几分前 几小时前
function formatDayBefore (time) {
	let ms = new Date().getTime() - time;
	var days = Math.floor(ms / (1000 * 60 * 60 * 24))
	return days
}

/**
 * 自定义key
 * @returns {number}
 */
function customKey () {
	return Date.now()+ Math.random()
}

function debounce (func, wait = 1000) {
	// 缓存一个定时器id
	let timer = 0
	// 这里返回的函数是每次用户实际调用的防抖函数
	// 如果已经设定过定时器了就清空上一次的定时器
	// 开始一个新的定时器，延迟执行用户传入的方法
	return function(...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
		func.apply(this, args)
		}, wait)
	}
}

function getDistanceSpecifiedTime(dateTime) {
	// 指定日期和时间
	let EndTime = new Date(dateTime.replace(/-/g,'/'));
	// 当前系统时间
	let NowTime = new Date();
	let t = EndTime.getTime() - NowTime.getTime();
	let d = Math.floor(t / 1000 / 60 / 60 / 24);
	let h = Math.floor(t / 1000 / 60 / 60 % 24);
	let m = Math.floor(t / 1000 / 60 % 60);
	let s = Math.floor(t / 1000 % 60);
	let html = '';
	if (d > 0) {
		html = `${d}天${h}时${m}分${s}秒`;
	}
	else {
		html = `${h}时${m}分${s}秒`;
	}
	return html;
}
function toMoney (num) {
	num = Number(num);
	num = num.toFixed(2);
	return num;
}
function isEmojiCharacter (substring) {
	for(var i = 0; i < substring.length; i++) {
		var hs = substring.charCodeAt(i);
		if(0xd800 <= hs && hs <= 0xdbff) {
			if(substring.length > 1) {
				var ls = substring.charCodeAt(i + 1);
				var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
				if(0x1d000 <= uc && uc <= 0x1f77f) {
					return true;
				}
			}
		} else if(substring.length > 1) {
			var ls = substring.charCodeAt(i + 1);
			if(ls == 0x20e3) {
				return true;
			}
		} else {
			if(0x2100 <= hs && hs <= 0x27ff) {
				return true;
			} else if(0x2B05 <= hs && hs <= 0x2b07) {
				return true;
			} else if(0x2934 <= hs && hs <= 0x2935) {
				return true;
			} else if(0x3297 <= hs && hs <= 0x3299) {
				return true;
			} else if(hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 ||
				hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b ||
				hs == 0x2b50) {
				return true;
			}
		}
	}
}

function getAge(birthday){
	let fullYear = new Date().getFullYear();
	return fullYear - birthday;
}


function getToDay() {
	let year = new Date().getFullYear();
	let month = new Date().getMonth() + 1;
	let day = new Date().getDate();
	if (month < 10) {
		month = `0${month}`
	}
	if (day < 10) {
		day = `0${day}`
	}
	let time = new Date(`${year}-${month}-${day} 00:00:00`).getTime();
	return time;
}

function getNextDay() {
	let year = new Date().getFullYear();
	let month = new Date().getMonth() + 1;
	let day = new Date().getDate() + 1;
	if (month < 10) {
		month = `0${month}`
	}
	if (day < 10) {
		day = `0${day}`
	}
	let time = new Date(`${year}-${month}-${day} 00:00:00`).getTime();
	return time;
}

function formatTimes(ms) {
	let date = new Date(ms);
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	month = month < 10 ? `0${month}` : month;
	let day = date.getDate();
	day = day < 10 ? `0${day}` : day;
	let hour = date.getHours();
	hour = hour < 10 ? `0${hour}` : hour;
	let minute = date.getMinutes();
	minute = minute < 10 ? `0${minute}` : minute;
	let second = date.getSeconds();
	second = second < 10 ? `0${second}` : second;
	return `${month}-${day} ${hour}:${minute}`
}

function formatRichText(html){
  if (html) {
    let str = html.replace(/<img[^>]*>/gi, function (match, capture) {
      if (match.indexOf('style=') != -1) {
        return match.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/ig, 'style="width:100%;max-width:100%;height:auto;"') // 替换style
      } else {
        const imageStyle = `width:100%;max-width:100%;height:auto;`;
        return match.replace(/<img/g, `<img style="${imageStyle}"`);
      }
    });
    return str
  } else {
    return ''
  }
}

function isPhoneNumber(phone) {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

function isEmail(email) {
  const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  return reg.test(email);
}

function maskPhoneNumber(phone) {
  return phone.replace(/(\d{3})\d{4}(\d+)/, "$1****$2");
}

function maskBankNumber(bankCardNumber) {
  if (bankCardNumber && bankCardNumber.length > 16) {
    console.log('bankCardNumber', bankCardNumber)
    const frontFour = bankCardNumber.substring(0, 4);
    const backFour = bankCardNumber.substring(bankCardNumber.length - 4);
    // 中间用 * 重复填满
    const middle = '*'.repeat(bankCardNumber.length - 8);
    return frontFour + middle + backFour;
  } else {
    return bankCardNumber;
  }
}

function maskIdCard(idCard) {
  if (idCard) {
    const frontFour = idCard.substring(0, 2);
    const backFour = idCard.substring(idCard.length - 2);
    // 中间用 * 重复填满
    const middle = '*'.repeat(idCard.length - 4);
    return frontFour + middle + backFour;
  } else {
    return '';
  }
}

export default {
	getCurrentTime,
	objLength,
	displayProp,
	sTrim,
	replaceMaohao,
	vailPhone,
	sub,
	div,
	mul,
	accAdd,
	currency,
	cutStr,
	formatTime,
	timestampToDate,
	tofixed,
	compareVersion,
	formatTimeMs,
	nodePosition,
	formatTimeBefore,
	formatDayBefore,
	customKey,
	debounce,
	getDistanceSpecifiedTime,
	toMoney,
	isEmojiCharacter,
	getAge,
	getToDay,
	getNextDay,
	formatTimes,
	formatRichText,
  isPhoneNumber,
  isEmail,
  maskPhoneNumber,
  maskBankNumber,
  maskIdCard,
  useKeyboardHeight
}
