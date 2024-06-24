export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/detail/index',
    'pages/list/index',
    'pages/resetPwd/index'
  ],
  permission: {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    },
    "bluetooth": {
      "desc": "你的设备蓝牙信息将用于小程序蓝牙接口的效果展示"
    }
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
