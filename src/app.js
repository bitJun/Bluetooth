import React, { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { getStorageSync } from "@utils/util";
import {
  queryVerifyToken
} from '@api';
// 全局样式
import './app.scss';


function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {})

  // 对应 onShow
  useDidShow(() => {
    onVerifyToken();
  })

  // 对应 onHide
  useDidHide(() => {})

  const onVerifyToken = () => {
    queryVerifyToken({})
      .then(res=>{
        console.log('res', res);
      })
  }

  return props.children
}

export default App
